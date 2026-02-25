"use client";

import { useMemo, useState } from "react";
import { Vehicle } from "@/lib/vehicles";

type Props = {
  vehicles: Vehicle[];
  brands: string[];
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

const formatMileage = (value: number): string => `${new Intl.NumberFormat("de-DE").format(value)} km`;

const formatFirstRegistration = (value: string): string => {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return `${month}/${year}`;
};

export function VehicleInventory({ vehicles, brands }: Props) {
  const [activeBrand, setActiveBrand] = useState<string>("Alle");

  const filtered = useMemo(() => {
    if (activeBrand === "Alle") return vehicles.filter((v) => v.isAvailable);
    return vehicles.filter((v) => v.isAvailable && v.brand === activeBrand);
  }, [vehicles, activeBrand]);

  return (
    <section className="section">
      <div className="container">
        <div className="inventory-head">
          <div>
            <h1>Sofort verfügbare Fahrzeuge</h1>
            <p>Aktueller Bestand mit den wichtigsten Fahrzeugdaten auf einen Blick.</p>
          </div>
        </div>

        <div className="inventory-layout">
          <div className="inventory-list" aria-live="polite">
            {filtered.length === 0 ? (
              <article className="vehicle-list-card">
                <h2>Keine Fahrzeuge gefunden</h2>
                <p>Bitte wähle eine andere Marke im Filter.</p>
              </article>
            ) : (
              filtered.map((vehicle) => (
                <article className="vehicle-list-card" key={vehicle.id}>
                  <div className="vehicle-list-image">
                    <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} loading="lazy" />
                  </div>
                  <div className="vehicle-list-content">
                    <header>
                      <h2>{vehicle.brand}</h2>
                      <h3>{vehicle.model}</h3>
                    </header>
                    <p className="vehicle-price">{formatCurrency(vehicle.priceEur)}</p>
                    <div className="vehicle-spec-grid">
                      <p>
                        <span>Erstzulassung</span>
                        {formatFirstRegistration(vehicle.firstRegistration)}
                      </p>
                      <p>
                        <span>Kilometerstand</span>
                        {formatMileage(vehicle.mileageKm)}
                      </p>
                      <p>
                        <span>Kraftstoff</span>
                        {vehicle.fuel}
                      </p>
                      <p>
                        <span>Leistung</span>
                        {vehicle.powerPs} PS
                      </p>
                      <p>
                        <span>Getriebe</span>
                        {vehicle.transmission}
                      </p>
                      <p>
                        <span>Standort</span>
                        {vehicle.location}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="inventory-filter">
            <h2>Filter</h2>
            <p>Marke auswählen</p>
            <div className="brand-filter-list">
              <button
                type="button"
                className={activeBrand === "Alle" ? "active" : ""}
                onClick={() => setActiveBrand("Alle")}
              >
                Alle
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className={activeBrand === brand ? "active" : ""}
                  onClick={() => setActiveBrand(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
