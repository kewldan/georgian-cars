"use client";
import { Heart, ImageIcon, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/data";
import { FX } from "@/lib/data";
import { ratingLabel as getRatingLabel } from "@/lib/rating";
import { useApp } from "@/lib/store";
import { useFavorites } from "@/lib/use-favorites";
import { cn, fmt } from "@/lib/utils";

function ago(d: number, h: number, t: ReturnType<typeof useTranslations>) {
  if (d > 0) return t("card.ago_d", { n: d });
  if (h > 0) return t("card.ago_h", { n: h });
  return t("card.ago_now");
}

export function ListingCard({ listing, viewMode = "grid" }: { listing: Listing; viewMode?: "grid" | "list" }) {
  const t = useTranslations();
  const { currency } = useApp();
  const { isFav, toggle } = useFavorites();
  const fav = isFav(listing.id);
  const isList = viewMode === "list";

  const ratingLabel = getRatingLabel(t, listing.priceRating);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className={cn(
        "group flex overflow-hidden rounded-md border border-border bg-card transition-all hover:shadow-md hover:border-foreground/40",
        isList ? "flex-row min-h-[120px] sm:min-h-[160px]" : "flex-col"
      )}
    >
      <div className={cn("relative overflow-hidden bg-muted", isList ? "w-28 shrink-0 sm:w-72" : "aspect-[16/10]")}>
        <Image
          src={listing.photos[0]}
          alt={`${listing.make} ${listing.model}`}
          fill
          sizes={
            isList ? "(min-width: 640px) 288px, 112px" : "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          }
          className="object-cover"
        />
        <div className={cn("absolute left-2 top-2 flex flex-wrap gap-1", isList && "hidden sm:flex")}>
          <Badge variant={listing.priceRating}>{ratingLabel}</Badge>
          {listing.vinChecked && <Badge variant="default">VIN ✓</Badge>}
          {listing.postedDays === 0 && <Badge variant="new">NEW</Badge>}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(listing.id);
          }}
          className={cn(
            "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border backdrop-blur",
            fav ? "bg-accent text-accent-foreground border-accent" : "bg-white/90 text-neutral-900 border-black/5"
          )}
          aria-label="favorite"
        >
          <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
        </button>
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold font-mono text-white">
          <ImageIcon className="h-2.5 w-2.5" /> {listing.photos.length}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate text-[15px] font-bold leading-tight tracking-tight">
            {listing.make} {listing.model}
          </span>
          <span className="font-mono text-[13px] font-semibold text-muted-foreground shrink-0">{listing.year}</span>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {fmt.km(listing.mileage)}&nbsp;{t("card.km")}
          <span className="mx-2 text-foreground/30">·</span>
          {listing.fuel === "Electric" ? "EV" : `${listing.engine}L`}
          <span className="mx-2 text-foreground/30">·</span>
          {listing.power}&nbsp;{t("card.hp")}
          <span className={cn("mx-2 text-foreground/30", isList && "hidden sm:inline")}>·</span>
          <span className={cn(isList && "hidden sm:inline")}>{listing.transmission.slice(0, 4)}</span>
          <span className={cn("mx-2 text-foreground/30", isList && "hidden sm:inline")}>·</span>
          <span className={cn(isList && "hidden sm:inline")}>{listing.drive}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1 font-semibold text-foreground/80">
            <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{listing.city}</span>
          </span>
          <span className="font-mono shrink-0">{ago(listing.postedDays, listing.postedHours, t)}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-dashed border-border pt-2">
          <span className="min-w-0 font-mono text-lg sm:text-xl font-extrabold tracking-tight tabular-nums truncate">
            {fmt.price(listing.price, currency, FX)}
          </span>
          <span className="shrink-0 rounded-md bg-accent px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono text-accent-foreground">
            {t("card.details")} →
          </span>
        </div>
      </div>
    </Link>
  );
}
