import Link from "next/link";

export default function UnternehmenGaleriePage() {
  return (
    <section className="section">
      <div className="container">
        <Link href="/unternehmen" className="company-back-link">
          ← Zurueck zur Unternehmensuebersicht
        </Link>
        <h1>Bildergalerie</h1>

        <section className="card anchored-card">
          <p>Platzhalter fuer Galerie-Inhalte.</p>
        </section>
      </div>
    </section>
  );
}
