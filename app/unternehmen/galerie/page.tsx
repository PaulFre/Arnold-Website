import { CompanySubnav } from "../subnav";

export default function UnternehmenGaleriePage() {
  return (
    <section className="section">
      <div className="container">
        <h1>Bildergalerie</h1>
        <CompanySubnav activeKey="galerie" />

        <section className="card anchored-card">
          <p>Platzhalter fuer Galerie-Inhalte.</p>
        </section>
      </div>
    </section>
  );
}
