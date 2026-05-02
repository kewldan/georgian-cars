"use client";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { FiltersPanel } from "@/components/filters-panel";
import { ListingCard } from "@/components/listing-card";
import { ListingsToolbar } from "@/components/listings-toolbar";
import { LISTINGS } from "@/lib/data";
import { applyFilters, applySort } from "@/lib/filter-listings";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ListingsPage() {
  const t = useTranslations();
  const { filters, search, sort, viewMode } = useApp();
  const sorted = useMemo(() => applySort(applyFilters(LISTINGS, filters, search), sort), [filters, search, sort]);

  return (
    <div className="mx-auto grid max-w-[1640px] grid-cols-1 lg:grid-cols-[280px_1fr]">
      <FiltersPanel />
      <main className="px-5 pb-16 pt-3.5 min-w-0">
        <ListingsToolbar count={sorted.length} />
        {sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted">
              <Search className="h-5 w-5" />
            </div>
            <div className="font-bold">{t("search.noResults")}</div>
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
      </main>
    </div>
  );
}
