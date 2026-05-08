"use client";
import { GitCompare, Heart, ImageIcon, MapPin } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/lib/data";
import { FX } from "@/lib/data";
import { ratingLabel as getRatingLabel } from "@/lib/rating";
import { COMPARE_LIMIT, useApp } from "@/lib/store";
import { useFavorites } from "@/lib/use-favorites";
import { cn, fmt } from "@/lib/utils";

function ago(d: number, h: number, t: ReturnType<typeof useTranslations>) {
  if (d > 0) return t("card.ago_d", { n: d });
  if (h > 0) return t("card.ago_h", { n: h });
  return t("card.ago_now");
}

export function ListingCard({
  listing,
  viewMode = "grid",
  priority = false,
}: {
  listing: Listing;
  viewMode?: "grid" | "list";
  priority?: boolean;
}) {
  if (viewMode === "list") return <ListingRow listing={listing} priority={priority} />;
  return <ListingGridCard listing={listing} priority={priority} />;
}

function FavButton({ id, fav, onToggle }: { id: string; fav: boolean; onToggle: (id: string) => void }) {
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onToggle(id);
      }}
      whileTap={{ scale: 0.85 }}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full border backdrop-blur transition-colors",
        fav ? "bg-accent text-accent-foreground border-accent" : "bg-white/90 text-neutral-900 border-black/5"
      )}
      aria-label="favorite"
      aria-pressed={fav}
    >
      <motion.span
        key={fav ? "on" : "off"}
        initial={{ scale: fav ? 0.6 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 14 }}
        className="grid place-items-center"
      >
        <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
      </motion.span>
    </motion.button>
  );
}

function CompareToggle({ id }: { id: string }) {
  const t = useTranslations();
  const compare = useApp((s) => s.compare);
  const toggleCompare = useApp((s) => s.toggleCompare);
  const on = compare.includes(id);
  const disabled = !on && compare.length >= COMPARE_LIMIT;
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) toggleCompare(id);
      }}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.85 }}
      aria-label={on ? t("listings.removeFromCompare") : t("listings.addToCompare")}
      aria-pressed={on}
      title={on ? t("listings.removeFromCompare") : t("listings.addToCompare")}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full border backdrop-blur transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        on ? "bg-primary text-primary-foreground border-primary" : "bg-white/90 text-neutral-900 border-black/5"
      )}
    >
      <GitCompare className="h-3.5 w-3.5" />
    </motion.button>
  );
}

function ListingGridCard({ listing, priority }: { listing: Listing; priority: boolean }) {
  const t = useTranslations();
  const { currency } = useApp();
  const { isFav, toggle } = useFavorites();
  const fav = isFav(listing.id);
  const ratingLabel = getRatingLabel(t, listing.priceRating);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-foreground/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={listing.photos[0]}
          alt={`${listing.make} ${listing.model}`}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge variant={listing.priceRating}>{ratingLabel}</Badge>
          {listing.vinChecked && <Badge variant="default">VIN ✓</Badge>}
          {listing.postedDays === 0 && <Badge variant="new">NEW</Badge>}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <FavButton id={listing.id} fav={fav} onToggle={toggle} />
          <CompareToggle id={listing.id} />
        </div>
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
          <span className="mx-2 text-foreground/30">·</span>
          <span>{listing.transmission.slice(0, 4)}</span>
          <span className="mx-2 text-foreground/30">·</span>
          <span>{listing.drive}</span>
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

function ListingRow({ listing, priority }: { listing: Listing; priority: boolean }) {
  const t = useTranslations();
  const { currency } = useApp();
  const { isFav, toggle } = useFavorites();
  const fav = isFav(listing.id);
  const ratingLabel = getRatingLabel(t, listing.priceRating);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group grid items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 transition-colors hover:border-foreground/40 hover:bg-secondary/50 sm:px-3.5 sm:py-3"
      style={{
        gridTemplateColumns: "auto minmax(0, 1.4fr) auto auto",
        gridTemplateAreas: '"thumb title price fav"',
      }}
    >
      <div className="relative h-14 w-20 overflow-hidden rounded-sm bg-muted shrink-0" style={{ gridArea: "thumb" }}>
        <Image
          src={listing.photos[0]}
          alt=""
          fill
          sizes="80px"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover"
        />
        {listing.postedDays === 0 ? (
          <span className="absolute left-1 top-1 rounded-sm bg-accent px-1 font-mono text-[9px] font-bold uppercase tracking-wider text-accent-foreground">
            new
          </span>
        ) : null}
      </div>

      <div className="min-w-0" style={{ gridArea: "title" }}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="min-w-0 truncate text-[14px] font-bold leading-tight">
            {listing.make} {listing.model}
          </span>
          <span className="font-mono text-[12px] font-semibold text-muted-foreground">{listing.year}</span>
          <Badge variant={listing.priceRating} className="hidden sm:inline-flex">
            {ratingLabel}
          </Badge>
          {listing.vinChecked ? (
            <Badge variant="default" className="hidden sm:inline-flex">
              VIN ✓
            </Badge>
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
          <span>
            {fmt.km(listing.mileage)} {t("card.km")}
          </span>
          <span className="text-foreground/30">·</span>
          <span>{listing.fuel === "Electric" ? "EV" : `${listing.engine}L`}</span>
          <span className="text-foreground/30">·</span>
          <span>
            {listing.power} {t("card.hp")}
          </span>
          <span className="text-foreground/30">·</span>
          <span>{listing.transmission.slice(0, 4)}</span>
          <span className="text-foreground/30">·</span>
          <span>{listing.drive}</span>
          <span className="text-foreground/30">·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {listing.city}
          </span>
          <span className="text-foreground/30">·</span>
          <span>{ago(listing.postedDays, listing.postedHours, t)}</span>
        </div>
      </div>

      <span
        className="font-mono text-base sm:text-lg font-extrabold tracking-tight tabular-nums shrink-0 text-right"
        style={{ gridArea: "price" }}
      >
        {fmt.price(listing.price, currency, FX)}
      </span>

      <div className="flex items-center gap-1.5" style={{ gridArea: "fav" }}>
        <CompareToggle id={listing.id} />
        <FavButton id={listing.id} fav={fav} onToggle={toggle} />
      </div>
    </Link>
  );
}
