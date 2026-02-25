"use client";

import { useMemo, useState } from "react";

type Vehicle = {
  id: number;
  name: string;
  price: string;
  color: string;
};

const vehicles: Vehicle[] = [
  { id: 1, name: "BMW 320d Touring", price: "23.900 EUR", color: "#5e636e" },
  { id: 2, name: "Audi A4 Avant", price: "21.400 EUR", color: "#6c5d57" },
  { id: 3, name: "VW Golf GTI", price: "27.800 EUR", color: "#676767" },
  { id: 4, name: "Mercedes C 220", price: "28.900 EUR", color: "#615a61" },
  { id: 5, name: "Skoda Octavia RS", price: "24.700 EUR", color: "#5a6262" },
  { id: 6, name: "Ford Focus ST", price: "19.900 EUR", color: "#635a52" },
  { id: 7, name: "SEAT Leon FR", price: "18.300 EUR", color: "#5e5e5e" },
  { id: 8, name: "Opel Insignia", price: "16.900 EUR", color: "#585f68" }
];

const PAGE_SIZE = 4;

export function VehicleCardsCarousel() {
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil(vehicles.length / PAGE_SIZE) - 1;

  const visible = useMemo(() => {
    const start = page * PAGE_SIZE;
    return vehicles.slice(start, start + PAGE_SIZE);
  }, [page]);

  return (
    <section className="section">
      <div className="container">
        <div className="section-inline-head">
          <h2>Fahrzeuge im Sortiment</h2>
          <div className="arrow-controls">
            <button type="button" aria-label="Vorherige Fahrzeuge" onClick={() => setPage((p) => Math.max(0, p - 1))}>
              {"<"}
            </button>
            <button type="button" aria-label="Naechste Fahrzeuge" onClick={() => setPage((p) => Math.min(maxPage, p + 1))}>
              {">"}
            </button>
          </div>
        </div>

        <div className="vehicle-grid">
          {visible.map((vehicle) => (
            <article key={vehicle.id} className="vehicle-card">
              <div className="vehicle-image" style={{ background: vehicle.color }} aria-hidden="true" />
              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <p>{vehicle.price}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
