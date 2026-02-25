import { SellSection } from "@/components/sell-section";

export default function FahrzeugVerkaufenPage() {
  return (
    <>
      <section className="section">
        <div className="container narrow">
          <h1>Fahrzeug verkaufen</h1>
          <p>Hier findest du alle Optionen für Bewertung und Terminbuchung.</p>
        </div>
      </section>
      <SellSection />
    </>
  );
}
