import Link from "next/link";
import { notFound } from "next/navigation";
import { FinancingCalculator } from "@/components/financing-calculator";
import { readVehicles } from "@/lib/vehicles";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

const formatMileage = (value: number): string => `${new Intl.NumberFormat("de-DE").format(value)} km`;

const formatFirstRegistration = (value: string): string => {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return `${month}/${year}`;
};

const EQUIPMENT_PREVIEW_LIMIT = 9;
const DESCRIPTION_PREVIEW_LIMIT = 8;

export default async function FahrzeugDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vehicles = await readVehicles();
  const vehicle = vehicles.find((entry) => entry.id === id && entry.isAvailable);

  if (!vehicle) {
    notFound();
  }

  const equipment = vehicle.equipment ?? [];
  const descriptionLines = vehicle.descriptionLines ?? [];
  const equipmentPreview = equipment.slice(0, EQUIPMENT_PREVIEW_LIMIT);
  const equipmentMore = equipment.slice(EQUIPMENT_PREVIEW_LIMIT);
  const descriptionPreview = descriptionLines.slice(0, DESCRIPTION_PREVIEW_LIMIT);
  const descriptionMore = descriptionLines.slice(DESCRIPTION_PREVIEW_LIMIT);

  return (
    <section className="section">
      <div className="container vehicle-detail-wrap">
        <Link href="/fahrzeuge" className="vehicle-back-link">
          Zurück zur Fahrzeugliste
        </Link>

        <article className="vehicle-detail-card">
          <div className="vehicle-detail-image">
            <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} />
          </div>

          <div className="vehicle-detail-main">
            <header className="vehicle-detail-head">
              <p className="vehicle-detail-brand">{vehicle.brand}</p>
              <h1>{vehicle.model}</h1>
              <p className="vehicle-price">{formatCurrency(vehicle.priceEur)}</p>
            </header>

            <div className="vehicle-detail-spec-grid">
              <p>
                <span>Erstzulassung</span>
                {formatFirstRegistration(vehicle.firstRegistration)}
              </p>
              <p>
                <span>Kilometerstand</span>
                {formatMileage(vehicle.mileageKm)}
              </p>
              <p>
                <span>Kraftstoff</span>
                {vehicle.fuel}
              </p>
              <p>
                <span>Getriebe</span>
                {vehicle.transmission}
              </p>
              <p>
                <span>Leistung</span>
                {vehicle.powerPs} PS
              </p>
              <p>
                <span>Standort</span>
                {vehicle.location}
              </p>
              <p>
                <span>Fahrzeug-ID</span>
                {vehicle.id}
              </p>
              <p>
                <span>Status</span>
                {vehicle.isAvailable ? "Sofort verfügbar" : "Reserviert"}
              </p>
            </div>
          </div>
        </article>

        {equipment.length > 0 ? (
          <article className="vehicle-detail-extra-card">
            <header className="vehicle-detail-extra-head">
              <h2>Ausstattung</h2>
            </header>
            <ul className="vehicle-equipment-grid">
              {equipmentPreview.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {equipmentMore.length > 0 ? (
              <details className="vehicle-more-block">
                <summary>
                  <span className="more-label-open">Weniger Informationen anzeigen</span>
                  <span className="more-label-closed">Mehr Informationen anzeigen</span>
                </summary>
                <ul className="vehicle-equipment-grid">
                  {equipmentMore.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </article>
        ) : null}

        {descriptionLines.length > 0 ? (
          <article className="vehicle-detail-extra-card">
            <header className="vehicle-detail-extra-head">
              <h2>Fahrzeugbeschreibung</h2>
            </header>
            <ul className="vehicle-description-list">
              {descriptionPreview.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {descriptionMore.length > 0 ? (
              <details className="vehicle-more-block">
                <summary>
                  <span className="more-label-open">Weniger Informationen anzeigen</span>
                  <span className="more-label-closed">Mehr Informationen anzeigen</span>
                </summary>
                <ul className="vehicle-description-list">
                  {descriptionMore.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </article>
        ) : null}

        <FinancingCalculator vehiclePrice={vehicle.priceEur} vehicleLabel={`${vehicle.brand} ${vehicle.model}`} />
      </div>
    </section>
  );
}
