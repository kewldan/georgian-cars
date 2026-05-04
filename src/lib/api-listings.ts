import type { FilterState } from "@/lib/store";

export const LISTINGS_PAGE_SIZE = 24;

export function listingsKey(
  filters: FilterState,
  search: string,
  sort: string,
  page = 1,
  pageSize = LISTINGS_PAGE_SIZE
) {
  const p = new URLSearchParams();
  if (search) p.set("q", search);
  for (const [k, v] of Object.entries(filters)) {
    if (v == null || (Array.isArray(v) && v.length === 0)) continue;
    if (typeof v === "boolean") {
      if (v) p.set(k, "true");
    } else if (Array.isArray(v)) {
      for (const x of v) p.append(k, String(x));
    } else {
      p.set(k, String(v));
    }
  }
  p.set("sort", sort);
  p.set("page", String(page));
  p.set("pageSize", String(pageSize));
  return `/listings?${p.toString()}`;
}
