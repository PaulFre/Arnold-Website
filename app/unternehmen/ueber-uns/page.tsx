import { CompanySubnav } from "../subnav";

export default function UnternehmenUeberUnsPage() {
  return (
    <section className="section">
      <div className="container">
        <h1>Ueber uns</h1>
        <CompanySubnav activeKey="ueber-uns" />

        <section className="card anchored-card">
          <p>Platzhalter fuer kurze Worte ueber das Unternehmen.</p>
        </section>
      </div>
    </section>
  );
}
