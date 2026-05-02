export const RATING_KEYS = ["great", "good", "fair", "high", "overpriced"] as const;
export type PriceRating = (typeof RATING_KEYS)[number];

export const RATING_META: Record<PriceRating, { color: string; pct: number }> = {
  great: { color: "#16a34a", pct: 5 },
  good: { color: "#65a30d", pct: 25 },
  fair: { color: "#525252", pct: 50 },
  high: { color: "#f59e0b", pct: 75 },
  overpriced: { color: "#dc2626", pct: 95 },
};

export const PRICE_BAR_GRADIENT =
  "linear-gradient(90deg, #16a34a 0%, #65a30d 25%, #525252 50%, #f59e0b 75%, #dc2626 100%)";

export function ratingLabel(t: (key: string) => string, rating: PriceRating) {
  return t(`card.${rating}`);
}
