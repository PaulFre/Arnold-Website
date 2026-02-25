import { readFile, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";

export const vehicleSchema = z.object({
  id: z.string().min(2),
  brand: z.string().min(2),
  model: z.string().min(2),
  priceEur: z.coerce.number().int().positive(),
  firstRegistration: z.string().min(7),
  mileageKm: z.coerce.number().int().nonnegative(),
  fuel: z.string().min(2),
  transmission: z.string().min(2),
  powerPs: z.coerce.number().int().positive(),
  imageUrl: z.string().url(),
  location: z.string().min(2),
  isAvailable: z.boolean()
});

export type Vehicle = z.infer<typeof vehicleSchema>;

const vehicleInputSchema = vehicleSchema.omit({ id: true }).extend({
  id: z.string().min(2).optional()
});

const filePath = path.join(process.cwd(), "data", "vehicles.json");

export async function readVehicles(): Promise<Vehicle[]> {
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  return z.array(vehicleSchema).parse(parsed);
}

export async function writeVehicles(vehicles: Vehicle[]): Promise<void> {
  await writeFile(filePath, JSON.stringify(vehicles, null, 2), "utf-8");
}

export function normalizeVehicleInput(input: unknown): Vehicle {
  const data = vehicleInputSchema.parse(input);
  const id =
    data.id && data.id.trim().length > 0
      ? data.id
      : `${data.brand}-${data.model}-${data.firstRegistration}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

  return {
    ...data,
    id
  };
}

export function listBrands(vehicles: Vehicle[]): string[] {
  return Array.from(new Set(vehicles.filter((v) => v.isAvailable).map((v) => v.brand))).sort((a, b) =>
    a.localeCompare(b, "de")
  );
}
