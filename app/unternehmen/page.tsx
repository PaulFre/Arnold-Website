import { readCompanyReviews } from "@/lib/reviews";
import Link from "next/link";

export const revalidate = 3600;

const sectionConfig = {
  bewertungen: {
    label: "Bewertungen",
    title: "Bewertungen"
  },
  galerie: {
    label: "Bildergalerie",
    title: "Bildergalerie"
  },
  "ueber-uns": {
    label: "Ueber uns",
    title: "Ueber uns"
  }
} as const;

type SectionKey = keyof typeof sectionConfig;

type UnternehmenPageProps = {
  searchParams: Promise<{
    section?: string;
  }>;
};

export default async function UnternehmenPage({ searchParams }: UnternehmenPageProps) {
  const { section } = await searchParams;
  const selectedSection = (section && section in sectionConfig ? section : null) as SectionKey | null;
  const reviews = await readCompanyReviews();

  return (
    <section className="section">
      <div className="container">
        <h1>Unternehmen</h1>

        <nav className="company-subnav card anchored-card" aria-label="Unternehmen Bereiche">
          <div className="company-subnav-grid">
            {(Object.keys(sectionConfig) as SectionKey[]).map((key) => (
              <Link
                key={key}
                href={`/unternehmen?section=${key}`}
                className={`company-subnav-link ${selectedSection === key ? "active" : ""}`}
              >
                {sectionConfig[key].label}
              </Link>
            ))}
          </div>
        </nav>

        {selectedSection === "bewertungen" ? (
          <section id="bewertungen" className="card anchored-card">
            <h2>{sectionConfig.bewertungen.title}</h2>
            <div className="reviews-grid">
              {reviews.map((review) => (
                <article key={review.id} className="review-tile">
                  <p className="review-text">"{review.text}"</p>
                  <footer className="review-meta">
                    <strong>{review.author}</strong>
                    <a href={review.sourceUrl} target="_blank" rel="noreferrer noopener" className="review-source-badge">
                      {review.source}
                    </a>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {selectedSection === "galerie" ? (
          <section id="galerie" className="card anchored-card">
            <h2>{sectionConfig.galerie.title}</h2>
            <p>Platzhalter fuer Galerie-Inhalte.</p>
          </section>
        ) : null}

        {selectedSection === "ueber-uns" ? (
          <section id="ueber-uns" className="card anchored-card">
            <h2>{sectionConfig["ueber-uns"].title}</h2>
            <p>Platzhalter fuer kurze Worte ueber das Unternehmen.</p>
          </section>
        ) : null}
      </div>
    </section>
  );
}
