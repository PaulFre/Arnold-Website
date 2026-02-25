import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import { z } from "zod";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_FILES = 12;
const MIN_FILES = 4;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/heic", "image/heif"]);

const valuationSchema = z
  .object({
    vin: z.string().min(1),
    registrationDate: z.string().min(1),
    mileageKm: z.coerce.number().int().nonnegative(),
    condition: z.enum(["sehr_gut", "gut", "okay", "reparaturbeduerftig"]),
    accidentDamage: z.enum(["ja", "nein"]),
    ownerCount: z.coerce.number().int().nonnegative(),
    enginePower: z.string().optional(),
    fullName: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    preferredContact: z.enum(["whatsapp", "telefon", "email"]),
    message: z.string().optional(),
    dsgvoConsent: z.literal("on")
  })
  .superRefine((data, ctx) => {
    const hasPhone = Boolean(data.phone && data.phone.trim().length > 0);
    const hasEmail = Boolean(data.email && data.email.trim().length > 0);
    if (!hasPhone && !hasEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telefon oder E-Mail muss angegeben werden."
      });
    }
  });

type UploadMeta = {
  publicPath: string;
  fileName: string;
};

const toSafeSegment = (value: string): string => value.replace(/[^a-zA-Z0-9-_]/g, "_");

const saveFile = async (file: File): Promise<UploadMeta> => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = path.extname(file.name) || ".jpg";
  const baseName = toSafeSegment(path.basename(file.name, extension)).slice(0, 40) || "upload";
  const fileName = `${Date.now()}-${randomUUID()}-${baseName}${extension.toLowerCase()}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const outputPath = path.join(uploadsDir, fileName);
  await writeFile(outputPath, buffer);

  return { fileName, publicPath: `/uploads/${fileName}` };
};

const createTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const asText = (value: FormDataEntryValue | null): string => (typeof value === "string" ? value : "");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photos = formData.getAll("photos").filter((entry): entry is File => entry instanceof File);

    if (photos.length < MIN_FILES || photos.length > MAX_FILES) {
      return Response.json(
        { ok: false, message: `Bitte ${MIN_FILES} bis ${MAX_FILES} Bilder hochladen.` },
        { status: 400 }
      );
    }

    for (const file of photos) {
      if (!ACCEPTED_TYPES.has(file.type)) {
        return Response.json({ ok: false, message: "Nur JPG, PNG oder HEIC Bilder erlaubt." }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return Response.json({ ok: false, message: "Ein Bild ist groesser als 8 MB." }, { status: 400 });
      }
    }

    const parseResult = valuationSchema.safeParse({
      vin: asText(formData.get("vin")),
      registrationDate: asText(formData.get("registrationDate")),
      mileageKm: asText(formData.get("mileageKm")),
      condition: asText(formData.get("condition")),
      accidentDamage: asText(formData.get("accidentDamage")),
      ownerCount: asText(formData.get("ownerCount")),
      enginePower: asText(formData.get("enginePower")),
      fullName: asText(formData.get("fullName")),
      phone: asText(formData.get("phone")),
      email: asText(formData.get("email")),
      preferredContact: asText(formData.get("preferredContact")),
      message: asText(formData.get("message")),
      dsgvoConsent: asText(formData.get("dsgvoConsent"))
    });

    if (!parseResult.success) {
      const message = parseResult.error.issues[0]?.message ?? "Bitte Eingaben pruefen.";
      return Response.json({ ok: false, message }, { status: 400 });
    }

    const savedUploads = await Promise.all(photos.map((file) => saveFile(file)));
    const data = parseResult.data;
    const emailTo = process.env.CONTACT_EMAIL_TO || "chef@example.com";

    const uploadLinks = savedUploads.map((upload) => upload.publicPath).join("\n");
    const mailText = [
      "Neue Fahrzeugbewertung",
      "",
      `Name: ${data.fullName}`,
      `VIN: ${data.vin}`,
      `Erstzulassung: ${data.registrationDate}`,
      `Kilometerstand: ${data.mileageKm}`,
      `Zustand: ${data.condition}`,
      `Unfallschaden: ${data.accidentDamage}`,
      `Anzahl Halter: ${data.ownerCount}`,
      `Motorisierung/PS: ${data.enginePower || "-"}`,
      `Telefon: ${data.phone || "-"}`,
      `E-Mail: ${data.email || "-"}`,
      `Kontaktweg: ${data.preferredContact}`,
      `Nachricht: ${data.message || "-"}`,
      "",
      "Uploads:",
      uploadLinks
    ].join("\n");

    const transporter = createTransport();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: emailTo,
        subject: "Neue Fahrzeugbewertung",
        text: mailText
      });
    }

    return Response.json({
      ok: true,
      message: transporter
        ? "Ihre Anfrage wurde erfolgreich gesendet."
        : "Ihre Anfrage wurde gespeichert. Bitte SMTP in der Umgebung konfigurieren.",
      preferredContact: data.preferredContact
    });
  } catch {
    return Response.json({ ok: false, message: "Serverfehler beim Absenden." }, { status: 500 });
  }
}
