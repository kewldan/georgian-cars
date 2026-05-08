"use client";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { ListingCard } from "@/components/listing-card";
import { ListingCardSkeletonGrid } from "@/components/listing-card-skeleton";
import { SwrError } from "@/components/swr-error";
import { fetcher } from "@/lib/api";
import type { Listing } from "@/lib/data";

export default function FavoritesPage() {
  const t = useTranslations();
  const { data, error, isLoading, mutate } = useSWR<{ items: Listing[] }>("/favorites", fetcher);
  const list = data?.items ?? [];

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-4">
      <div className="mb-6 flex items-baseline gap-2">
        <span className="font-mono text-[22px] font-extrabold tabular-nums">{list.length}</span>
        <span className="text-[13px] text-muted-foreground">
          {t("favorites.title").toLowerCase()} · {t("favorites.count")}
        </span>
      </div>
      {error && list.length === 0 ? (
        <SwrError error={error} onRetry={() => mutate()} />
      ) : isLoading && list.length === 0 ? (
        <ListingCardSkeletonGrid count={6} />
      ) : list.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Heart className="h-5 w-5" />
          </div>
          <div className="font-bold mb-1">{t("favorites.title")}</div>
          <div className="text-[13px]">{t("favorites.empty")}</div>
        </div>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {list.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
