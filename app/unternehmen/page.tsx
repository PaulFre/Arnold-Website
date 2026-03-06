import { readCompanyReviews } from "@/lib/reviews";

export const revalidate = 3600;

export default async function UnternehmenPage() {
  const reviews = await readCompanyReviews();

  return (
    <section className="section">
      <div className="container">
        <h1>Unternehmen</h1>
        <section id="bewertungen" className="card anchored-card">
          <h2>Bewertungen</h2>
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
        <section id="galerie" className="card anchored-card">
          <h2>Bildergalerie</h2>
          <p>Platzhalter fuer Galerie-Inhalte.</p>
        </section>
        <section id="ueber-uns" className="card anchored-card">
          <h2>Ueber uns</h2>
          <p>Platzhalter fuer kurze Worte ueber das Unternehmen.</p>
        </section>
      </div>
    </section>
  );
}
