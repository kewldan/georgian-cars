"use client";
import {WheelGesturesPlugin} from "embla-carousel-wheel-gestures";
import {Heart, MessageSquare, Phone, Send} from "lucide-react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {useEffect, useState} from "react";
import useSWR from "swr";
import {ListingCard} from "@/components/listing-card";
import {SwrError} from "@/components/swr-error";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {fetcher} from "@/lib/api";
import type {Listing} from "@/lib/data";
import {FX} from "@/lib/data";
import {PRICE_BAR_GRADIENT, RATING_META, ratingLabel as getRatingLabel} from "@/lib/rating";
import {useApp} from "@/lib/store";
import {useFavorites} from "@/lib/use-favorites";
import {cn, fmt} from "@/lib/utils";

function Spec({k, v}: { k: string; v: string | number }) {
    return (
        <div className="flex items-baseline justify-between gap-3 border-t border-border px-4 py-2.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{k}</span>
            <span className="font-mono text-[13px] font-semibold text-right">{v}</span>
        </div>
    );
}

function isKnownStr(v: string | null | undefined): v is string {
    if (!v) return false;
    const s = v.trim().toLowerCase();
    return s !== "" && s !== "unknown" && s !== "—" && s !== "-" && s !== "?";
}

export function DetailView({listing}: { listing: Listing }) {
    const t = useTranslations();
    const [api, setApi] = useState<CarouselApi>();
    const [photo, setPhoto] = useState(0);
    const {currency} = useApp();
    const {isFav: isFavId, toggle: toggleFav} = useFavorites();

    useEffect(() => {
        if (!api) return;
        const onSelect = () => setPhoto(api.selectedScrollSnap());
        onSelect();
        api.on("select", onSelect);
        api.on("reInit", onSelect);
        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api]);
    const isFav = isFavId(listing.id);
    const meta = RATING_META[listing.priceRating];
    const ratingLabel = getRatingLabel(t, listing.priceRating);

    const {
        data: similarData,
        error: similarError,
        mutate: mutateSimilar,
    } = useSWR<{ items: Listing[] }>(`/listings/${encodeURIComponent(listing.id)}/similar?limit=4`, fetcher);
    const similar = similarData?.items ?? [];

    return (
        <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-4 sm:px-5">
            <nav className="mb-3.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground hover:underline">
                    {t("detail.back")}
                </Link>
                <span className="inline-flex items-center gap-1.5">
          <span className="text-foreground/40">/</span>
          <span>{listing.make}</span>
        </span>
                <span className="inline-flex items-center gap-1.5">
          <span className="text-foreground/40">/</span>
          <span>{listing.model}</span>
        </span>
                <span className="inline-flex items-center gap-1.5 min-w-0">
          <span className="text-foreground/40">/</span>
          <span className="font-mono break-all min-w-0">{listing.id}</span>
        </span>
            </nav>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0">
                    <Card className="overflow-hidden">
                        <Carousel setApi={setApi} opts={{loop: true}} plugins={[WheelGesturesPlugin()]}
                                  className="bg-muted">
                            <CarouselContent className="ml-0">
                                {listing.photos.map((p) => (
                                    <CarouselItem key={p} className="pl-0">
                                        <div className="aspect-[2/1] sm:aspect-video">
                                            {/* biome-ignore lint/performance/noImgElement: photos are inline SVG data URIs */}
                                            <img src={p} alt="" draggable={false}
                                                 className="h-full w-full object-cover select-none"/>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-3"/>
                            <CarouselNext className="right-3"/>
                        </Carousel>
                        <ScrollArea className="bg-secondary">
                            <div className="flex gap-1.5 p-1.5">
                                {listing.photos.map((p, i) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => api?.scrollTo(i)}
                                        className={cn(
                                            "h-12 w-16 shrink-0 overflow-hidden rounded-sm border-2 sm:h-[60px] sm:w-20",
                                            i === photo ? "border-foreground" : "border-transparent"
                                        )}
                                    >
                                        {/* biome-ignore lint/performance/noImgElement: photos are inline SVG data URIs */}
                                        <img src={p} alt="" className="h-full w-full object-cover"/>
                                    </button>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal"/>
                        </ScrollArea>
                    </Card>

                    <Card className="mt-3.5 bg-gradient-to-b from-muted to-card p-4">
                        <Badge className="mb-2">
                            <span className="h-1.5 w-1.5 rounded-sm bg-accent"/>
                            {t("detail.summary")}
                        </Badge>
                        <p className="text-sm leading-relaxed">{listing.summary}</p>
                        <div
                            className="mt-2.5 flex items-center gap-2.5 rounded-md border border-border bg-secondary px-3.5 py-3">
              <span className="font-mono text-[11px] font-bold" style={{color: meta.color}}>
                {ratingLabel}
              </span>
                            <div className="relative h-1.5 flex-1 rounded-full"
                                 style={{background: PRICE_BAR_GRADIENT}}>
                <span
                    className="absolute -top-[3px] h-3 w-1 rounded-sm border border-background bg-foreground"
                    style={{left: `calc(${meta.pct}% - 2px)`}}
                />
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">
                {fmt.price(listing.fairPrice, currency, FX)}
              </span>
                        </div>
                    </Card>

                    <Card className="mt-3.5 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-sm bg-accent"/>
                            {t("detail.specs")}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2">
                            {listing.year > 0 ? <Spec k={t("filters.year")} v={listing.year}/> : null}
                            {listing.mileage > 0 ? (
                                <Spec k={t("filters.mileage")} v={`${fmt.km(listing.mileage)} ${t("card.km")}`}/>
                            ) : null}
                            {listing.fuel === "Electric" ? (
                                <Spec k={t("filters.engine")} v="EV"/>
                            ) : listing.engine > 0 ? (
                                <Spec k={t("filters.engine")} v={`${listing.engine} L`}/>
                            ) : null}
                            {listing.power > 0 ?
                                <Spec k={t("filters.power")} v={`${listing.power} ${t("card.hp")}`}/> : null}
                            {isKnownStr(listing.fuel) ? <Spec k={t("filters.fuel")} v={listing.fuel}/> : null}
                            {isKnownStr(listing.transmission) ? (
                                <Spec k={t("filters.transmission")} v={listing.transmission}/>
                            ) : null}
                            {isKnownStr(listing.drive) ? <Spec k={t("filters.drive")} v={listing.drive}/> : null}
                            {isKnownStr(listing.body) ? <Spec k={t("filters.body")} v={listing.body}/> : null}
                            {isKnownStr(listing.color) ? <Spec k={t("filters.color")} v={listing.color}/> : null}
                            {isKnownStr(listing.city) ? <Spec k={t("filters.city")} v={listing.city}/> : null}
                            <Spec k="VIN" v={listing.vinChecked ? `✓ ${t("detail.verified")}` : "—"}/>
                            <Spec k="Customs"
                                  v={listing.customsCleared ? t("detail.cleared") : t("detail.notCleared")}/>
                        </div>
                    </Card>

                    <Card className="mt-3.5 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-sm bg-accent"/>
                            {t("detail.features")}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {listing.features.map((f) => (
                                <span
                                    key={f}
                                    className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
                                >
                  {f}
                </span>
                            ))}
                        </div>
                    </Card>

                    <Card className="mt-3.5 p-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-sm bg-accent"/>
                            {t("detail.desc")}
                        </h3>
                        <p className="border-l-2 border-accent pl-3 font-mono text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {listing.description}
                        </p>
                    </Card>
                </div>

                <div className="min-w-0 lg:sticky lg:top-[65px] lg:self-start space-y-3.5">
                    <Card className="p-4">
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight break-words">
                            {listing.make} {listing.model}
                        </h2>
                        <div className="mb-4 mt-1 font-mono text-[13px] text-muted-foreground break-all">
                            {listing.year} · {listing.body} · {listing.id}
                        </div>
                        <div className="flex items-end justify-between gap-3 border-t border-border pt-3.5 mb-3.5">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight break-all min-w-0">
                {fmt.price(listing.price, currency, FX)}
              </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => toggleFav(listing.id)}
                                className={cn("shrink-0", isFav && "bg-accent text-accent-foreground border-accent")}
                            >
                                <Heart className={cn("h-3.5 w-3.5", isFav && "fill-current")}/>
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            <Button variant="tg" size="lg" onClick={() => {
                                // TODO: Metrika

                                window.open('https://t.me/kewldan', "_blank");
                            }}>
                                <Send className="h-4 w-4"/> {t("detail.openTg")}
                            </Button>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <Button variant="outline" onClick={() => {
                                    // TODO: Metrika

                                    window.open('https://t.me/kewldan', "_blank");
                                }}>
                                    <Phone className="h-3.5 w-3.5"/> {t("detail.callSeller")}
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    // TODO: Metrika

                                    window.open('https://t.me/kewldan', "_blank");
                                }}>
                                    <MessageSquare className="h-3.5 w-3.5"/> {t("detail.message")}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div
                        className="flex items-center gap-2.5 rounded-md border border-border bg-secondary px-3.5 py-2.5">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-[#229ED9] text-white">
                            <Send className="h-3.5 w-3.5"/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-bold">{listing.channel.name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                                {(listing.channel.subs / 1000).toFixed(1)}k subs
                            </div>
                        </div>
                    </div>

                    <Card className="p-3.5">
                        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-sm bg-accent"/>
                            {t("detail.seller")}
                        </h3>
                        <div className="text-sm font-bold">{listing.seller}</div>
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{listing.city}</div>
                    </Card>
                </div>
            </div>

            {similarError && similar.length === 0 ? (
                <>
                    <h3 className="mt-10 mb-3 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                        {t("detail.similar")}
                    </h3>
                    <SwrError error={similarError} onRetry={() => mutateSimilar()} compact/>
                </>
            ) : similar.length > 0 ? (
                <>
                    <h3 className="mt-10 mb-3 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                        {t("detail.similar")}
                    </h3>
                    <div className="grid gap-3.5"
                         style={{gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))"}}>
                        {similar.map((s) => (
                            <ListingCard key={s.id} listing={s}/>
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}
