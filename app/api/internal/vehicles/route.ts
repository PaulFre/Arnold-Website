import { normalizeVehicleInput, readVehicles, writeVehicles } from "@/lib/vehicles";

export const runtime = "nodejs";

export async function GET() {
  try {
    const vehicles = await readVehicles();
    return Response.json({ ok: true, vehicles });
  } catch {
    return Response.json({ ok: false, message: "Fahrzeuge konnten nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const vehicle = normalizeVehicleInput(body);
    const vehicles = await readVehicles();

    if (vehicles.some((item) => item.id === vehicle.id)) {
      return Response.json({ ok: false, message: "ID existiert bereits." }, { status: 409 });
    }

    vehicles.unshift(vehicle);
    await writeVehicles(vehicles);
    return Response.json({ ok: true, vehicle });
  } catch {
    return Response.json({ ok: false, message: "Fahrzeug konnte nicht gespeichert werden." }, { status: 400 });
  }
}
