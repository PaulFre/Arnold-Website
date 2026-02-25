import Link from "next/link";

export function SellSection() {
  return (
    <section className="section sell-section">
      <div className="container">
        <h2>Fahrzeug verkaufen</h2>
        <p className="lead-question">Warum mit uns verkaufen?</p>
        <p className="sell-copy">Platzhaltertext fuer deinen spaeteren Erklaerungstext zum Ablauf und deinen Vorteilen.</p>

        <div className="split-actions">
          <Link className="btn btn-primary" href="/bewerten">
            Fahrzeug bewerten
          </Link>
          <span className="divider" aria-hidden="true" />
          <Link className="btn btn-secondary" href="/termin">
            Direkt Termin vor Ort buchen
          </Link>
        </div>

        <div className="sell-image-grid">
          <div className="sell-image" />
          <div className="sell-image" />
          <div className="sell-image" />
        </div>
      </div>
    </section>
  );
}
