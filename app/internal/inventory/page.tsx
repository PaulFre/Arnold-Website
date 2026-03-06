"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Vehicle } from "@/lib/vehicles";

type VehicleInput = Omit<Vehicle, "id"> & { id?: string };

const EQUIPMENT_CATEGORIES = [
  {
    title: "Sicherheit",
    options: [
      "ABS",
      "ESP",
      "Front-, Seiten- und Kopfairbags",
      "Isofix",
      "Traktionskontrolle",
      "Reifendruckkontrolle",
      "Wegfahrsperre"
    ]
  },
  {
    title: "Assistenz",
    options: ["Regensensor", "Spurhalteassistent", "Abstandstempomat", "Rueckfahrkamera"]
  },
  {
    title: "Komfort",
    options: [
      "Automatische Klimatisierung 3 Zonen",
      "Elektrische Aussenspiegel",
      "Elektrische Fensterheber",
      "Sitzheizung vorne",
      "Servolenkung",
      "Zentralverriegelung",
      "Lederlenkrad"
    ]
  },
  {
    title: "Licht und Sicht",
    options: ["LED-Scheinwerfer"]
  },
  {
    title: "Infotainment",
    options: ["Bluetooth", "Freisprecheinrichtung", "Apple CarPlay und Android Auto", "Multifunktionslenkrad"]
  },
  {
    title: "Fahrdynamik",
    options: ["Sportfahrwerk"]
  }
];

const DESCRIPTION_OPTIONS = [
  "Aus 1. Hand mit lueckenloser Servicehistorie.",
  "Garantie auf Wunsch verlaengerbar.",
  "Nichtraucherfahrzeug, sehr gepflegter Innenraum.",
  "HU/AU vor Uebergabe neu.",
  "Inspektion aktuell durchgefuehrt.",
  "Fahrzeug wird aufbereitet uebergeben.",
  "Sofort verfuegbar.",
  "Finanzierung und Inzahlungnahme moeglich."
];

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
  location: "Bad Duerkheim",
  isAvailable: true,
  equipment: [],
  descriptionLines: []
};

export default function InternalInventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [draft, setDraft] = useState<VehicleInput>(emptyInput);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

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
      isAvailable: Boolean(draft.isAvailable),
      equipment: Array.from(new Set((draft.equipment ?? []).map((item) => item.trim()).filter(Boolean))),
      descriptionLines: Array.from(new Set((draft.descriptionLines ?? []).map((line) => line.trim()).filter(Boolean)))
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
    setEquipmentInput("");
    setDescriptionInput("");
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
      isAvailable: vehicle.isAvailable,
      equipment: vehicle.equipment ?? [],
      descriptionLines: vehicle.descriptionLines ?? []
    });
    setEditingId(vehicle.id);
    setEquipmentInput("");
    setDescriptionInput("");
    setStatus("");
  };

  const onDelete = async (id: string) => {
    const confirmed = window.confirm("Fahrzeug wirklich loeschen?");
    if (!confirmed) return;

    const response = await fetch(`/api/internal/vehicles/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setStatus(data.message ?? "Loeschen fehlgeschlagen.");
      return;
    }
    setStatus("Fahrzeug geloescht.");
    await loadVehicles();
  };

  const toggleEquipment = (item: string) => {
    const selected = draft.equipment ?? [];
    const next = selected.includes(item) ? selected.filter((entry) => entry !== item) : [...selected, item];
    setDraft({ ...draft, equipment: next });
  };

  const toggleDescription = (line: string) => {
    const selected = draft.descriptionLines ?? [];
    const next = selected.includes(line) ? selected.filter((entry) => entry !== line) : [...selected, line];
    setDraft({ ...draft, descriptionLines: next });
  };

  const addEquipmentFromInput = () => {
    const value = equipmentInput.trim();
    if (!value) return;
    if ((draft.equipment ?? []).includes(value)) {
      setEquipmentInput("");
      return;
    }
    setDraft({ ...draft, equipment: [...(draft.equipment ?? []), value] });
    setEquipmentInput("");
  };

  const addDescriptionFromInput = () => {
    const value = descriptionInput.trim();
    if (!value) return;
    if ((draft.descriptionLines ?? []).includes(value)) {
      setDescriptionInput("");
      return;
    }
    setDraft({ ...draft, descriptionLines: [...(draft.descriptionLines ?? []), value] });
    setDescriptionInput("");
  };

  return (
    <section className="section">
      <div className="container">
        <h1>Interner Fahrzeugbestand</h1>
        <p>Nur fuer Mitarbeiter. Hier kannst du Fahrzeuge inserieren, aendern und entfernen.</p>

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
            Fahrzeug ist sofort verfuegbar
          </label>

          <fieldset className="internal-picker-fieldset">
            <legend>Ausstattung (per Klick auswaehlen)</legend>
            <div className="internal-category-list">
              {EQUIPMENT_CATEGORIES.map((category) => (
                <section key={category.title} className="internal-category-block">
                  <h3>{category.title}</h3>
                  <div className="internal-option-grid">
                    {category.options.map((item) => {
                      const active = (draft.equipment ?? []).includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          className={`internal-option-btn ${active ? "active" : ""}`}
                          onClick={() => toggleEquipment(item)}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
            <div className="internal-add-row">
              <input
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                placeholder="Eigene Ausstattung ergaenzen"
              />
              <button className="btn btn-secondary" type="button" onClick={addEquipmentFromInput}>
                Hinzufuegen
              </button>
            </div>
            <div className="internal-selected-list">
              {(draft.equipment ?? []).map((item) => (
                <button key={item} type="button" className="internal-selected-chip" onClick={() => toggleEquipment(item)}>
                  {item} <span>x</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="internal-picker-fieldset">
            <legend>Fahrzeugbeschreibung (Textbausteine per Klick)</legend>
            <div className="internal-option-grid">
              {DESCRIPTION_OPTIONS.map((line) => {
                const active = (draft.descriptionLines ?? []).includes(line);
                return (
                  <button
                    key={line}
                    type="button"
                    className={`internal-option-btn ${active ? "active" : ""}`}
                    onClick={() => toggleDescription(line)}
                  >
                    {line}
                  </button>
                );
              })}
            </div>
            <div className="internal-add-row">
              <input
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Eigene Beschreibungszeile ergaenzen"
              />
              <button className="btn btn-secondary" type="button" onClick={addDescriptionFromInput}>
                Hinzufuegen
              </button>
            </div>
            <div className="internal-selected-list">
              {(draft.descriptionLines ?? []).map((line) => (
                <button key={line} type="button" className="internal-selected-chip" onClick={() => toggleDescription(line)}>
                  {line} <span>x</span>
                </button>
              ))}
            </div>
          </fieldset>

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
                  Loeschen
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
