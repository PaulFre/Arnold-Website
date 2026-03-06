import { readFile } from "fs/promises";
import path from "path";
import { z } from "zod";

const reviewSchema = z.object({
  id: z.string().min(2),
  source: z.enum(["Google", "mobile.de"]),
  author: z.string().min(2),
  text: z.string().min(4),
  sourceUrl: z.string().url(),
  rating: z.number().min(0).max(5).optional()
});

export type CompanyReview = z.infer<typeof reviewSchema>;

const reviewsPath = path.join(process.cwd(), "data", "reviews.json");
const googleReviewSchema = z.object({
  author_name: z.string().min(1),
  text: z.string().min(1),
  rating: z.number().optional()
});
const googlePlaceDetailsSchema = z.object({
  result: z
    .object({
      reviews: z.array(googleReviewSchema).optional()
    })
    .optional()
});

async function readLocalCompanyReviews(): Promise<CompanyReview[]> {
  const raw = await readFile(reviewsPath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  return z.array(reviewSchema).parse(parsed);
}

async function readGoogleReviewsLive(): Promise<CompanyReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  const sourceUrl = process.env.GOOGLE_REVIEW_SOURCE_URL;

  if (!apiKey || !placeId || !sourceUrl) {
    return [];
  }

  const endpoint = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  endpoint.searchParams.set("place_id", placeId);
  endpoint.searchParams.set("fields", "reviews");
  endpoint.searchParams.set("reviews_sort", "newest");
  endpoint.searchParams.set("language", "de");
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint.toString(), {
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as unknown;
  const parsed = googlePlaceDetailsSchema.safeParse(payload);
  if (!parsed.success) {
    return [];
  }

  const reviews = parsed.data.result?.reviews ?? [];
  return reviews
    .filter((review) => review.text.trim().length > 0)
    .map((review, index) => ({
      id: `google-live-${index + 1}`,
      source: "Google" as const,
      author: review.author_name.trim(),
      text: review.text.trim(),
      sourceUrl,
      rating: review.rating
    }));
}

export async function readCompanyReviews(): Promise<CompanyReview[]> {
  const localReviews = await readLocalCompanyReviews();
  const googleLiveReviews = await readGoogleReviewsLive().catch(() => []);
  const mobileSourceUrlOverride = process.env.MOBILE_DE_REVIEW_SOURCE_URL?.trim();

  const mobileReviews = localReviews
    .filter((review) => review.source === "mobile.de")
    .map((review) => ({
      ...review,
      sourceUrl: mobileSourceUrlOverride && mobileSourceUrlOverride.length > 0 ? mobileSourceUrlOverride : review.sourceUrl
    }));
  const googleFallback = localReviews.filter((review) => review.source === "Google");
  const googleReviews = googleLiveReviews.length > 0 ? googleLiveReviews : googleFallback;

  return [...googleReviews, ...mobileReviews];
}
