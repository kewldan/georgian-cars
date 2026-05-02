"use client";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { ListingCard } from "@/components/listing-card";
import { LISTINGS } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function FavoritesPage() {
  const t = useTranslations();
  const { favorites } = useApp();
  const list = LISTINGS.filter((l) => favorites.includes(l.id));
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-4">
      <div className="mb-6 flex items-baseline gap-2">
        <span className="font-mono text-[22px] font-extrabold tabular-nums">{list.length}</span>
        <span className="text-[13px] text-muted-foreground">
          {t("favorites.title").toLowerCase()} · {t("favorites.count")}
        </span>
      </div>
      {list.length === 0 ? (
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
