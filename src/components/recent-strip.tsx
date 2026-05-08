"use client";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import useSWR from "swr";
import { ListingCard } from "@/components/listing-card";
import { ListingCardSkeleton } from "@/components/listing-card-skeleton";
import { fetcher } from "@/lib/api";
import type { Listing } from "@/lib/data";
import { useRecentIds } from "@/lib/use-recent";

const PAGE_SIZE = 8;

function RecentItem({ id }: { id: string }) {
  const { data, isLoading } = useSWR<Listing>(`/listings/${encodeURIComponent(id)}`, fetcher);
  if (isLoading) return <ListingCardSkeleton />;
  if (!data) return null;
  return <ListingCard listing={data} />;
}

export function RecentStrip({ excludeId }: { excludeId?: string }) {
  const t = useTranslations();
  const { ids, clear } = useRecentIds();
  const filtered = ids.filter((id) => id !== excludeId).slice(0, PAGE_SIZE);
  if (filtered.length === 0) return null;
  return (
    <section aria-label={t("recent.title")} className="mt-6 mb-8">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("recent.title")}</h3>
        <button
          type="button"
          onClick={clear}
          className="text-[11px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-foreground"
        >
          {t("recent.clear")}
        </button>
      </div>
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {filtered.map((id) => (
          <RecentItem key={id} id={id} />
        ))}
      </div>
    </section>
  );
}

export function TrackRecent({ id }: { id: string }) {
  const { push } = useRecentIds();
  useEffect(() => {
    push(id);
  }, [id, push]);
  return null;
}
