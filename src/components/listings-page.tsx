"use client";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { FiltersPanel } from "@/components/filters-panel";
import { ListingCard } from "@/components/listing-card";
import { ListingsToolbar } from "@/components/listings-toolbar";
import { SwrError } from "@/components/swr-error";
import { fetcher } from "@/lib/api";
import { LISTINGS_PAGE_SIZE, listingsKey } from "@/lib/api-listings";
import type { Listing } from "@/lib/data";
import { useListingsParams } from "@/lib/listings-params";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type Page = { items: Listing[]; total: number; page: number; pageSize: number };

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
  const filtersActive = hasActiveFilters(filters, search);

  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite<Page>(
    (index, prev) => {
      if (prev && prev.items.length < prev.pageSize) return null;
      return listingsKey(filters, search, sort, index + 1);
    },
    fetcher,
    { keepPreviousData: true, revalidateFirstPage: false },
  );

  const pages = data ?? [];
  const items = pages.flatMap((p) => p.items);
  const total = pages[0]?.total ?? 0;
  const pageSize = pages[0]?.pageSize ?? LISTINGS_PAGE_SIZE;
  const hasMore = items.length < total;
  const isLoadingMore = isValidating && size > 1 && !!data && typeof data[size - 1] === "undefined";

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || isLoading || isLoadingMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setSize((s) => s + 1);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, isLoading, isLoadingMore, setSize]);

  return (
    <div className="mx-auto grid max-w-[1640px] grid-cols-1 lg:grid-cols-[280px_1fr]">
      <FiltersPanel />
      <section aria-label="Listings" className="px-4 pb-16 pt-3.5 min-w-0 sm:px-5">
        <ListingsToolbar count={total} />
        {error && items.length === 0 ? (
          <SwrError error={error} onRetry={() => mutate()} />
        ) : isLoading && items.length === 0 ? (
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder, no semantic identity
                key={i}
                className="aspect-[16/10] animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
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
          <>
            <div
              className={cn("grid gap-3.5", viewMode === "list" && "grid-cols-1")}
              style={viewMode === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" } : undefined}
            >
              {items.map((l) => (
                <ListingCard key={l.id} listing={l} viewMode={viewMode} />
              ))}
              {isLoadingMore
                ? Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder, no semantic identity
                      key={`more-${i}`}
                      className="aspect-[16/10] animate-pulse rounded-md bg-muted"
                    />
                  ))
                : null}
            </div>
            {hasMore ? <div ref={sentinelRef} aria-hidden className="h-px w-full" /> : null}
          </>
        )}
      </section>
    </div>
  );
}
