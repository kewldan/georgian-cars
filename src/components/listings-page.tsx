"use client";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { FiltersPanel } from "@/components/filters-panel";
import { ListingCard } from "@/components/listing-card";
import { ListingsToolbar } from "@/components/listings-toolbar";
import { LISTINGS } from "@/lib/data";
import { applyFilters, applySort } from "@/lib/filter-listings";
import { useListingsParams } from "@/lib/listings-params";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

function hasActiveFilters(filters: Record<string, unknown>, search: string) {
  if (search) return true;
  for (const v of Object.values(filters)) {
    if (v == null) continue;
    if (Array.isArray(v) ? v.length > 0 : v !== false && v !== "") return true;
  }
  return false;
}

export function ListingsPage() {
  const t = useTranslations();
  const { viewMode } = useApp();
  const { filters, search, sort, clearAll } = useListingsParams();
  const sorted = useMemo(() => applySort(applyFilters(LISTINGS, filters, search), sort), [filters, search, sort]);
  const filtersActive = hasActiveFilters(filters, search);

  return (
    <div className="mx-auto grid max-w-[1640px] grid-cols-1 lg:grid-cols-[280px_1fr]">
      <FiltersPanel />
      <section aria-label="Listings" className="px-5 pb-16 pt-3.5 min-w-0">
        <ListingsToolbar count={sorted.length} />
        {sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted">
              <Search className="h-5 w-5" />
            </div>
            <div className="font-bold text-foreground">{t("search.noResults")}</div>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearAll}
                className="mt-3 text-[12px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-foreground transition-colors"
              >
                {t("search.clearAll")}
              </button>
            ) : null}
          </div>
        ) : (
          <div
            className={cn("grid gap-3.5", viewMode === "list" && "grid-cols-1")}
            style={viewMode === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" } : undefined}
          >
            {sorted.map((l) => (
              <ListingCard key={l.id} listing={l} viewMode={viewMode} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
