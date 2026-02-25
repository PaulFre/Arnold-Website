"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/lib/vehicles";

type VehicleInput = Omit<Vehicle, "id"> & { id?: string };

const emptyInput: VehicleInput = {
  brand: "",
  model: "",
  priceEur: 0,
  firstRegistration: "",
  mileageKm: 0,
  fuel: "Benzin",
  transmission: "Automatik",
  powerPs: 0,
  imageUrl: "",
  location: "Bad Dürkheim",
  isAvailable: true
};

export default function InternalInventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [draft, setDraft] = useState<VehicleInput>(emptyInput);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const loadVehicles = async () => {
    const response = await fetch("/api/internal/vehicles", { cache: "no-store" });
    const data = await response.json();
    if (data.ok) setVehicles(data.vehicles);
  };

  useEffect(() => {
    loadVehicles()
      .catch(() => setStatus("Fahrzeugliste konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    const payload: VehicleInput = {
      ...draft,
      priceEur: Number(draft.priceEur),
      mileageKm: Number(draft.mileageKm),
      powerPs: Number(draft.powerPs),
      isAvailable: Boolean(draft.isAvailable)
    };

    const response = await fetch(editingId ? `/api/internal/vehicles/${editingId}` : "/api/internal/vehicles", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      setStatus(data.message ?? "Speichern fehlgeschlagen.");
      return;
    }

    setDraft(emptyInput);
    setEditingId(null);
    setStatus(editingId ? "Fahrzeug aktualisiert." : "Fahrzeug inseriert.");
    await loadVehicles();
  };

  const onEdit = (vehicle: Vehicle) => {
    setDraft({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      priceEur: vehicle.priceEur,
      firstRegistration: vehicle.firstRegistration,
      mileageKm: vehicle.mileageKm,
      fuel: vehicle.fuel,
      transmission: vehicle.transmission,
      powerPs: vehicle.powerPs,
      imageUrl: vehicle.imageUrl,
      location: vehicle.location,
      isAvailable: vehicle.isAvailable
    });
    setEditingId(vehicle.id);
    setStatus("");
  };

  const onDelete = async (id: string) => {
    const confirmed = window.confirm("Fahrzeug wirklich löschen?");
    if (!confirmed) return;

    const response = await fetch(`/api/internal/vehicles/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setStatus(data.message ?? "Löschen fehlgeschlagen.");
      return;
    }
    setStatus("Fahrzeug gelöscht.");
    await loadVehicles();
  };

  return (
    <section className="section">
      <div className="container">
        <h1>Interner Fahrzeugbestand</h1>
        <p>Nur für Mitarbeiter. Hier kannst du Fahrzeuge inserieren, ändern und entfernen.</p>

        <form className="internal-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              Marke*
              <input value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} required />
            </label>
            <label>
              Modell*
              <input value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} required />
            </label>
            <label>
              Preis (EUR)*
              <input
                type="number"
                value={draft.priceEur}
                onChange={(e) => setDraft({ ...draft, priceEur: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              Erstzulassung (YYYY-MM)*
              <input
                value={draft.firstRegistration}
                onChange={(e) => setDraft({ ...draft, firstRegistration: e.target.value })}
                placeholder="2023-04"
                required
              />
            </label>
            <label>
              Kilometerstand*
              <input
                type="number"
                value={draft.mileageKm}
                onChange={(e) => setDraft({ ...draft, mileageKm: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              Kraftstoff*
              <input value={draft.fuel} onChange={(e) => setDraft({ ...draft, fuel: e.target.value })} required />
            </label>
            <label>
              Getriebe*
              <input
                value={draft.transmission}
                onChange={(e) => setDraft({ ...draft, transmission: e.target.value })}
                required
              />
            </label>
            <label>
              Leistung (PS)*
              <input
                type="number"
                value={draft.powerPs}
                onChange={(e) => setDraft({ ...draft, powerPs: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              Bild-URL*
              <input value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} required />
            </label>
            <label>
              Standort*
              <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} required />
            </label>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={draft.isAvailable}
              onChange={(e) => setDraft({ ...draft, isAvailable: e.target.checked })}
            />
            Fahrzeug ist sofort verfügbar
          </label>

          <div className="button-row">
            <button className="btn btn-primary" type="submit">
              {isEditing ? "Fahrzeug aktualisieren" : "Fahrzeug inserieren"}
            </button>
            {isEditing ? (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDraft(emptyInput);
                }}
              >
                Bearbeitung abbrechen
              </button>
            ) : null}
          </div>
          {status ? <p>{status}</p> : null}
        </form>

        <div className="internal-list">
          <h2>Aktuelle Inserate</h2>
          {loading ? <p>Lade Fahrzeuge...</p> : null}
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className="internal-row">
              <div>
                <h3>
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p>
                  {vehicle.priceEur.toLocaleString("de-DE")} EUR | {vehicle.firstRegistration} | {vehicle.mileageKm} km
                </p>
              </div>
              <div className="button-row">
                <button className="btn btn-secondary" type="button" onClick={() => onEdit(vehicle)}>
                  Bearbeiten
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => onDelete(vehicle.id)}>
                  Löschen
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
