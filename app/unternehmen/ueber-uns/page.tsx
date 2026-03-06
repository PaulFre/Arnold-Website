import Link from "next/link";

export default function UnternehmenUeberUnsPage() {
  return (
    <section className="section">
      <div className="container">
        <Link href="/unternehmen" className="company-back-link">
          ← Zurueck zur Unternehmensuebersicht
        </Link>
        <h1>Ueber uns</h1>

        <section className="card anchored-card">
          <p>Platzhalter fuer kurze Worte ueber das Unternehmen.</p>
        </section>
      </div>
    </section>
  );
}
