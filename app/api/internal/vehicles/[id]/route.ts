import { normalizeVehicleInput, readVehicles, writeVehicles } from "@/lib/vehicles";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const { id } = await params;
    const nextVehicle = normalizeVehicleInput({ ...body, id });

    const vehicles = await readVehicles();
    const index = vehicles.findIndex((item) => item.id === id);
    if (index < 0) {
      return Response.json({ ok: false, message: "Fahrzeug nicht gefunden." }, { status: 404 });
    }

    vehicles[index] = nextVehicle;
    await writeVehicles(vehicles);
    return Response.json({ ok: true, vehicle: nextVehicle });
  } catch {
    return Response.json({ ok: false, message: "Fahrzeug konnte nicht aktualisiert werden." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const vehicles = await readVehicles();
    const filtered = vehicles.filter((item) => item.id !== id);
    if (filtered.length === vehicles.length) {
      return Response.json({ ok: false, message: "Fahrzeug nicht gefunden." }, { status: 404 });
    }

    await writeVehicles(filtered);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, message: "Fahrzeug konnte nicht gelöscht werden." }, { status: 400 });
  }
}
