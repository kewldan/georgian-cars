"use client";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { ActiveFilters } from "@/components/active-filters";
import { FiltersPanel } from "@/components/filters-panel";
import { ListingCard } from "@/components/listing-card";
import { ListingCardSkeleton, ListingCardSkeletonGrid } from "@/components/listing-card-skeleton";
import { ListingsToolbar } from "@/components/listings-toolbar";
import { RecentStrip } from "@/components/recent-strip";
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
    { keepPreviousData: true, revalidateFirstPage: false }
  );

  // Stagger only the cards that are new since the last filter/search/sort change.
  // Pre-existing cards skip the entrance animation so infinite-scroll appends don't re-fire it.
  const querySig = useMemo(() => JSON.stringify([filters, search, sort]), [filters, search, sort]);
  const animatedRef = useRef<{ sig: string; ids: Set<string> }>({ sig: querySig, ids: new Set() });
  if (animatedRef.current.sig !== querySig) {
    animatedRef.current = { sig: querySig, ids: new Set() };
  }
  const shouldAnimate = (id: string) => {
    if (animatedRef.current.ids.has(id)) return false;
    animatedRef.current.ids.add(id);
    return true;
  };

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
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, isLoading, isLoadingMore, setSize]);

  return (
    <div className="mx-auto grid max-w-[1640px] grid-cols-1 lg:grid-cols-[280px_1fr]">
      <FiltersPanel />
      <section aria-label="Listings" className="px-4 pb-16 pt-3.5 min-w-0 sm:px-5">
        <ListingsToolbar count={total} />
        <ActiveFilters />
        {!filtersActive ? <RecentStrip /> : null}
        {error && items.length === 0 ? (
          <SwrError error={error} onRetry={() => mutate()} />
        ) : isLoading && items.length === 0 ? (
          <ListingCardSkeletonGrid count={8} viewMode={viewMode} />
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
              {items.map((l, i) => {
                const animate = shouldAnimate(l.id);
                return (
                  <motion.div
                    key={l.id}
                    initial={animate ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut", delay: animate ? Math.min(i, 11) * 0.018 : 0 }}
                  >
                    <ListingCard listing={l} viewMode={viewMode} priority={i < 4} />
                  </motion.div>
                );
              })}
              {isLoadingMore
                ? Array.from({ length: Math.min(pageSize, 8) }, (_, i) => (
                    <ListingCardSkeleton
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder, no semantic identity
                      key={`more-${i}`}
                      viewMode={viewMode}
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
