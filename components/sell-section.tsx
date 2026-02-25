import Link from "next/link";

export function SellSection() {
  return (
    <section className="section sell-section">
      <div className="container">
        <h2>Fahrzeug verkaufen</h2>
        <p className="lead-question">Warum mit uns verkaufen?</p>
        <p className="sell-copy">Platzhaltertext für deinen späteren Erklärungstext zum Ablauf und deinen Vorteilen.</p>

        <div className="sell-split-panels">
          <article className="sell-panel panel-left">
            <Link className="btn btn-primary" href="/bewerten">
              Fahrzeug bewerten
            </Link>
          </article>
          <span className="divider panel-divider" aria-hidden="true" />
          <article className="sell-panel panel-right">
            <Link className="btn btn-secondary" href="/termin">
              Direkt Termin vor Ort buchen
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
