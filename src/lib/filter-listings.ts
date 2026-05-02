import type { Listing } from "./data";
import { RATING_KEYS } from "./rating";
import type { FilterState } from "./store";

export function applyFilters(arr: Listing[], f: FilterState, search: string): Listing[] {
  let out = arr;
  if (search) {
    const q = search.toLowerCase();
    out = out.filter((l) => `${l.make} ${l.model} ${l.id} ${l.city}`.toLowerCase().includes(q));
  }
  const { priceFrom, priceTo, yearFrom, yearTo, mileageFrom, mileageTo, engineFrom, engineTo, powerFrom, powerTo } = f;
  if (priceFrom != null) out = out.filter((l) => l.price >= priceFrom);
  if (priceTo != null) out = out.filter((l) => l.price <= priceTo);
  if (yearFrom != null) out = out.filter((l) => l.year >= yearFrom);
  if (yearTo != null) out = out.filter((l) => l.year <= yearTo);
  if (mileageFrom != null) out = out.filter((l) => l.mileage >= mileageFrom);
  if (mileageTo != null) out = out.filter((l) => l.mileage <= mileageTo);
  if (engineFrom != null) out = out.filter((l) => l.engine >= engineFrom);
  if (engineTo != null) out = out.filter((l) => l.engine <= engineTo);
  if (powerFrom != null) out = out.filter((l) => l.power >= powerFrom);
  if (powerTo != null) out = out.filter((l) => l.power <= powerTo);
  if (f.makes?.length) out = out.filter((l) => f.makes?.includes(l.make));
  if (f.models?.length) out = out.filter((l) => f.models?.includes(l.model));
  if (f.fuels?.length) out = out.filter((l) => f.fuels?.includes(l.fuel));
  if (f.trans?.length) out = out.filter((l) => f.trans?.includes(l.transmission));
  if (f.drives?.length) out = out.filter((l) => f.drives?.includes(l.drive));
  if (f.bodies?.length) out = out.filter((l) => f.bodies?.includes(l.body));
  if (f.cities?.length) out = out.filter((l) => f.cities?.includes(l.city));
  if (f.colors?.length) out = out.filter((l) => f.colors?.includes(l.color));
  if (f.channel) out = out.filter((l) => l.channel.id === f.channel);
  if (f.vinOnly) out = out.filter((l) => l.vinChecked);
  if (f.priceOnly) out = out.filter((l) => l.price > 0);
  return out;
}

export function applySort(arr: Listing[], sort: string): Listing[] {
  const out = [...arr];
  const ratingOrder = Object.fromEntries(RATING_KEYS.map((k, i) => [k, i])) as Record<string, number>;
  switch (sort) {
    case "cheap":
      return out.sort((a, b) => a.price - b.price);
    case "expensive":
      return out.sort((a, b) => b.price - a.price);
    case "mileage_asc":
      return out.sort((a, b) => a.mileage - b.mileage);
    case "year_desc":
      return out.sort((a, b) => b.year - a.year);
    case "year_asc":
      return out.sort((a, b) => a.year - b.year);
    case "best_deal":
      return out.sort((a, b) => ratingOrder[a.priceRating] - ratingOrder[b.priceRating]);
    default:
      return out.sort((a, b) => a.postedDays * 24 + a.postedHours - (b.postedDays * 24 + b.postedHours));
  }
}
