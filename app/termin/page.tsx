import { createTelLink, createWhatsappLink, siteConfig } from "@/lib/site-config";

export default function TerminPage() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1>Termin vereinbaren</h1>
        <p>Waehlen Sie Ihren Wunschtermin, wir bestaetigen kurzfristig.</p>
        <div className="card">
          <a className="btn btn-primary" href={siteConfig.bookingUrl} target="_blank" rel="noreferrer">
            Terminseite oeffnen
          </a>
          <a className="btn btn-secondary" href={createTelLink()}>
            Telefonisch anrufen
          </a>
          <a className="btn btn-secondary" href={createWhatsappLink("Hallo, ich moechte einen Termin vereinbaren.")}>
            WhatsApp schreiben
          </a>
        </div>
      </div>
    </section>
  );
}
