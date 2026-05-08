"use client";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useListingsParams } from "@/lib/listings-params";
import type { FilterState } from "@/lib/store";
import { useFacets } from "@/lib/use-facets";
import { fmt } from "@/lib/utils";

type Pill = { key: string; label: string; clear: () => void };

const RANGE_PAIRS = [
  ["priceFrom", "priceTo", "price"],
  ["yearFrom", "yearTo", "year"],
  ["mileageFrom", "mileageTo", "mileage"],
  ["engineFrom", "engineTo", "engine"],
  ["powerFrom", "powerTo", "power"],
] as const satisfies readonly (readonly [keyof FilterState, keyof FilterState, string])[];

const ARRAY_KEYS = ["makes", "models", "fuels", "trans", "drives", "bodies", "cities", "colors"] as const;

const BOOL_KEYS = ["vinOnly", "priceOnly", "bargain", "customsCleared"] as const;

function fmtNum(k: string, v: number) {
  if (k === "price") return `$${fmt.km(v)}`;
  if (k === "mileage") return `${fmt.km(v)}km`;
  if (k === "engine") return `${v}L`;
  if (k === "power") return `${v}hp`;
  return String(v);
}

export function ActiveFilters() {
  const t = useTranslations();
  const { filters, search, setFilters, setSearch, clearAll } = useListingsParams();
  const { facets } = useFacets();

  const pills: Pill[] = [];

  if (search) {
    pills.push({
      key: "search",
      label: `“${search}”`,
      clear: () => setSearch(""),
    });
  }

  for (const [fromK, toK, base] of RANGE_PAIRS) {
    const fromV = filters[fromK] as number | undefined;
    const toV = filters[toK] as number | undefined;
    if (fromV == null && toV == null) continue;
    const from = fromV != null ? fmtNum(base, fromV) : "—";
    const to = toV != null ? fmtNum(base, toV) : "—";
    pills.push({
      key: base,
      label: `${t(`filters.${base}`)}: ${from}–${to}`,
      clear: () => setFilters({ ...filters, [fromK]: undefined, [toK]: undefined }),
    });
  }

  for (const k of ARRAY_KEYS) {
    const arr = filters[k] as string[] | undefined;
    if (!arr?.length) continue;
    for (const v of arr) {
      pills.push({
        key: `${k}:${v}`,
        label: v,
        clear: () =>
          setFilters({
            ...filters,
            [k]: (arr.filter((x) => x !== v) as FilterState[typeof k]) || undefined,
          }),
      });
    }
  }

  if (filters.channel) {
    const ch = facets.channels.find((c) => c.id === filters.channel);
    pills.push({
      key: "channel",
      label: ch?.name ?? filters.channel,
      clear: () => setFilters({ ...filters, channel: undefined }),
    });
  }

  for (const k of BOOL_KEYS) {
    if (!filters[k]) continue;
    pills.push({
      key: k,
      label: t(`filters.${k === "vinOnly" ? "vin" : k === "priceOnly" ? "withPrice" : k}`),
      clear: () => setFilters({ ...filters, [k]: undefined }),
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={p.clear}
          aria-label={t("listings.removeFilter")}
          className="group inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground/80 transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <span>{p.label}</span>
          <X className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
        </button>
      ))}
      {pills.length > 1 ? (
        <button
          type="button"
          onClick={clearAll}
          className="ml-1 text-[11px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-foreground"
        >
          {t("search.clearAll")}
        </button>
      ) : null}
    </div>
  );
}
