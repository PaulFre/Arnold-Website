import { InventoryEmbed } from "@/components/inventory-embed";

export default function FahrzeugePage() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1>Fahrzeuge</h1>
        <p>
          Hier findest du den aktuellen Fahrzeugbestand. Falls das Embed auf deinem Geraet nicht funktioniert, nutze
          bitte den externen Link.
        </p>
        <InventoryEmbed />
      </div>
    </section>
  );
}
