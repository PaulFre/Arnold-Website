"use client";

import { FormEvent, useMemo, useState } from "react";
import { createWhatsappLink } from "@/lib/site-config";

type SubmitState = {
  ok: boolean;
  message: string;
  preferredContact?: "whatsapp" | "telefon" | "email";
};

const acceptedTypes = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const acceptedExt = [".jpg", ".jpeg", ".png", ".heic", ".heif"];

export function ValuationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitState | null>(null);
  const [selectedContact, setSelectedContact] = useState<"whatsapp" | "telefon" | "email">("whatsapp");

  const whatsappHref = useMemo(
    () => createWhatsappLink("Hallo, ich habe gerade die Fahrzeugbewertung gesendet."),
    []
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const files = formData.getAll("photos").filter((entry): entry is File => entry instanceof File);

    if (files.length < 4 || files.length > 12) {
      setError("Bitte lade mindestens 4 und höchstens 12 Bilder hoch.");
      setSubmitting(false);
      return;
    }

    const invalidFile = files.find((file) => {
      const lowerName = file.name.toLowerCase();
      const hasExt = acceptedExt.some((ext) => lowerName.endsWith(ext));
      const hasType = file.type ? acceptedTypes.includes(file.type) : false;
      return !(hasExt || hasType);
    });
    if (invalidFile) {
      setError("Bitte nur JPG, PNG oder HEIC Bilder hochladen.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as SubmitState;
      if (!response.ok || !data.ok) {
        setError(data.message || "Absenden fehlgeschlagen.");
        setSubmitting(false);
        return;
      }

      setResult(data);
      formElement.reset();
    } catch {
      setError("Es gab ein technisches Problem. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.ok) {
    return (
      <div className="success-box" role="status">
        <h2>Danke! Wir melden uns zeitnah.</h2>
        <p>{result.message}</p>
        {result.preferredContact === "whatsapp" ? (
          <a className="btn btn-primary" href={whatsappHref} target="_blank" rel="noreferrer">
            Jetzt per WhatsApp senden
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form className="valuation-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          Fahrgestellnummer (VIN)*
          <input name="vin" required />
        </label>

        <label>
          Erstzulassung*
          <input name="registrationDate" type="month" required />
        </label>

        <label>
          Kilometerstand*
          <input name="mileageKm" type="number" min={0} required />
        </label>

        <label>
          Zustand*
          <select name="condition" required>
            <option value="">Bitte wählen</option>
            <option value="sehr_gut">Sehr gut</option>
            <option value="gut">Gut</option>
            <option value="okay">Okay</option>
            <option value="reparaturbeduerftig">Reparaturbedürftig</option>
          </select>
        </label>

        <fieldset>
          <legend>Unfallschaden*</legend>
          <label>
            <input type="radio" name="accidentDamage" value="ja" required /> Ja
          </label>
          <label>
            <input type="radio" name="accidentDamage" value="nein" required /> Nein
          </label>
        </fieldset>

        <label>
          Anzahl Halter*
          <input name="ownerCount" type="number" min={0} required />
        </label>

        <label>
          Motorisierung / PS
          <input name="enginePower" />
        </label>

        <label>
          Name*
          <input name="fullName" required />
        </label>

        <label>
          Telefon
          <input name="phone" type="tel" />
        </label>

        <label>
          E-Mail
          <input name="email" type="email" />
        </label>
      </div>

      <fieldset>
        <legend>Gewünschter Kontaktweg*</legend>
        <label>
          <input
            type="radio"
            name="preferredContact"
            value="whatsapp"
            checked={selectedContact === "whatsapp"}
            onChange={() => setSelectedContact("whatsapp")}
            required
          />
          WhatsApp
        </label>
        <label>
          <input
            type="radio"
            name="preferredContact"
            value="telefon"
            checked={selectedContact === "telefon"}
            onChange={() => setSelectedContact("telefon")}
          />
          Telefon
        </label>
        <label>
          <input
            type="radio"
            name="preferredContact"
            value="email"
            checked={selectedContact === "email"}
            onChange={() => setSelectedContact("email")}
          />
          E-Mail
        </label>
      </fieldset>

      <label>
        Fotos Upload* (4-12 Bilder, JPG/PNG/HEIC, max 8 MB je Bild)
        <input name="photos" type="file" accept=".jpg,.jpeg,.png,.heic,.heif,image/*" multiple required />
      </label>

      <label>
        Nachricht / Besonderheiten
        <textarea name="message" rows={5} />
      </label>

      <label className="checkbox">
        <input type="checkbox" name="dsgvoConsent" required /> Ich stimme zu, dass meine Daten zur Bearbeitung
        gespeichert werden.*
      </label>

      {error ? <p className="error-text">{error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Wird gesendet..." : "Bewertung anfragen"}
      </button>
    </form>
  );
}
