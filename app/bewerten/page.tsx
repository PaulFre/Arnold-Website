import { ValuationForm } from "@/components/valuation-form";

export default function BewertenPage() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1>Fahrzeug bewerten lassen (Ankauf/Kommission)</h1>
        <p>
          Sende uns die wichtigsten Fahrzeugdaten und aussagekräftige Bilder. Wir melden uns kurzfristig mit einer
          fairen Einschätzung.
        </p>
        <ValuationForm />
      </div>
    </section>
  );
}
