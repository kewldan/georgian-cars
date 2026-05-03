// Wire-format type for a listing — the backend serializes exactly this shape.
// See backend/app/schemas/listing.py and BACKEND.md §2.

import type { PriceRating } from "./rating";

export type Listing = {
  id: string;
  make: string;
  model: string;
  year: number;
  fuel: string;
  engine: number;
  power: number;
  mileage: number;
  transmission: string;
  drive: string;
  body: string;
  color: string;
  city: string;
  price: number;
  currency: "USD";
  priceRating: PriceRating;
  fairPrice: number;
  vinChecked: boolean;
  customsCleared: boolean;
  hasPhotos: boolean;
  photos: string[];
  channel: { id: string; name: string; subs: number };
  postedDays: number;
  postedHours: number;
  summary: string;
  features: string[];
  seller: string;
  description: string;
  bargain: boolean;
};

// Currency conversion table used by formatters in src/lib/utils.ts.
export const FX = { USD: 1, RUB: 92, GEL: 2.7 };
