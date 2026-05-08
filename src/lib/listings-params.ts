"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { FilterState } from "@/lib/store";

const NUM_KEYS = [
  "priceFrom",
  "priceTo",
  "yearFrom",
  "yearTo",
  "mileageFrom",
  "mileageTo",
  "engineFrom",
  "engineTo",
  "powerFrom",
  "powerTo",
] as const satisfies readonly (keyof FilterState)[];

const ARRAY_KEYS = [
  "makes",
  "models",
  "fuels",
  "trans",
  "drives",
  "bodies",
  "cities",
  "colors",
] as const satisfies readonly (keyof FilterState)[];

export const DEFAULT_SORT = "newest";

export type ListingsParams = { filters: FilterState; search: string; sort: string };

export function parseListingsParams(sp: URLSearchParams): ListingsParams {
  const filters: FilterState = {};
  for (const k of NUM_KEYS) {
    const raw = sp.get(k);
    if (raw === null || raw === "") continue;
    const n = Number(raw);
    if (!Number.isNaN(n)) filters[k] = n;
  }
  for (const k of ARRAY_KEYS) {
    const vs = sp.getAll(k).filter(Boolean);
    if (vs.length) filters[k] = vs;
  }
  const channel = sp.get("channel");
  if (channel) filters.channel = channel;
  if (sp.get("vinOnly") === "1") filters.vinOnly = true;
  if (sp.get("priceOnly") === "1") filters.priceOnly = true;
  if (sp.get("bargain") === "1") filters.bargain = true;
  if (sp.get("customsCleared") === "1") filters.customsCleared = true;
  return {
    filters,
    search: sp.get("q") ?? "",
    sort: sp.get("sort") ?? DEFAULT_SORT,
  };
}

export function serializeListingsParams({ filters, search, sort }: ListingsParams): string {
  const sp = new URLSearchParams();
  if (search) sp.set("q", search);
  if (sort && sort !== DEFAULT_SORT) sp.set("sort", sort);
  for (const k of NUM_KEYS) {
    const v = filters[k];
    if (v != null) sp.set(k, String(v));
  }
  for (const k of ARRAY_KEYS) {
    const vs = filters[k];
    if (vs?.length) for (const v of vs) sp.append(k, v);
  }
  if (filters.channel) sp.set("channel", filters.channel);
  if (filters.vinOnly) sp.set("vinOnly", "1");
  if (filters.priceOnly) sp.set("priceOnly", "1");
  if (filters.bargain) sp.set("bargain", "1");
  if (filters.customsCleared) sp.set("customsCleared", "1");
  return sp.toString();
}

export function useListingsParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = useMemo<ListingsParams>(() => parseListingsParams(new URLSearchParams(sp.toString())), [sp]);

  const apply = useCallback(
    (next: ListingsParams) => {
      const qs = serializeListingsParams(next);
      const target = qs ? `${pathname}?${qs}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router]
  );

  const setFilters = useCallback((filters: FilterState) => apply({ ...state, filters }), [apply, state]);
  const setSearch = useCallback((search: string) => apply({ ...state, search }), [apply, state]);
  const setSort = useCallback((sort: string) => apply({ ...state, sort }), [apply, state]);

  const clearAll = useCallback(() => apply({ filters: {}, search: "", sort: DEFAULT_SORT }), [apply]);

  return { ...state, setFilters, setSearch, setSort, clearAll };
}
