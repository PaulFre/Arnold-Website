"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  { id: 1, title: "Fahrzeuge", href: "/fahrzeuge", color: "#2b2b2b" },
  { id: 2, title: "Fahrzeug verkaufen", href: "/bewerten", color: "#3a3a3a" },
  { id: 3, title: "Unternehmen", href: "/unternehmen", color: "#444" },
  { id: 4, title: "Kontakt", href: "/kontakt", color: "#2f2f2f" }
];

export function HomeSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const current = slides[index];

  return (
    <section className="home-slideshow section">
      <div className="container">
        <div className="slide-frame" style={{ background: current.color }}>
          <div className="slide-content">
            <h1>Willkommen bei Arnold Automobile</h1>
            <p>Moderne Fahrzeuge, faire Beratung und schnelle Wege zum Ziel.</p>
            <Link className="btn btn-primary" href={current.href}>
              {current.title}
            </Link>
          </div>
        </div>
        <div className="slide-controls">
          <button
            type="button"
            aria-label="Vorheriger Slide"
            onClick={() => setIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          >
            {"<"}
          </button>
          <div className="dots" aria-hidden="true">
            {slides.map((slide, i) => (
              <span key={slide.id} className={i === index ? "dot active" : "dot"} />
            ))}
          </div>
          <button type="button" aria-label="Nächster Slide" onClick={() => setIndex((prev) => (prev + 1) % slides.length)}>
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}
