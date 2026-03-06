import { readCompanyReviews } from "@/lib/reviews";
import Link from "next/link";

export const revalidate = 3600;

export default async function UnternehmenBewertungenPage() {
  const reviews = await readCompanyReviews();

  return (
    <section className="section">
      <div className="container">
        <Link href="/unternehmen" className="company-back-link">
          ← Zurueck zur Unternehmensuebersicht
        </Link>
        <h1>Bewertungen</h1>

        <section className="card anchored-card">
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
      </div>
    </section>
  );
}
