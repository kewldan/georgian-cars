"use client";
import type { DivIcon } from "leaflet";
import { ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { SwrError } from "@/components/swr-error";
import { useTheme } from "@/components/theme-provider";
import { fetcher } from "@/lib/api";
import { FX, type Listing } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn, fmt } from "@/lib/utils";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

type CityCount = { name: string; count: number; lat: number; lng: number };

export function MapView() {
  const t = useTranslations();
  const { currency } = useApp();
  const [selected, setSelected] = useState("Tbilisi");
  const [makeIcon, setMakeIcon] = useState<((count: number, active: boolean) => DivIcon) | null>(null);

  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled) return;
      setMakeIcon(
        () => (count: number, active: boolean) =>
          L.divIcon({
            className: "",
            html: `<div class="map-pin${active ? " is-active" : ""}"><span>${count}</span></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -18],
          })
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    data: cityData,
    error: citiesError,
    mutate: mutateCities,
  } = useSWR<{ cities: CityCount[]; total: number }>("/map/cities", fetcher);
  const cities = cityData?.cities ?? [];
  const total = cityData?.total ?? 0;

  const {
    data: cityListings,
    error: cityListingsError,
    mutate: mutateCityListings,
  } = useSWR<{ items: Listing[] }>(
    selected ? `/map/cities/${encodeURIComponent(selected)}/listings?limit=6` : null,
    fetcher
  );
  const inCity = cityListings?.items ?? [];
  const inCityCount = cities.find((c) => c.name === selected)?.count ?? 0;

  return (
    <div className="grid h-[calc(100dvh-53px)] grid-cols-1 md:grid-cols-[320px_1fr]">
      <aside className="overflow-y-auto border-r border-border bg-card">
        <div className="border-b border-border px-4 py-3.5">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {cities.length} {t("map.cities")} · {total} {t("map.adsIn")}
          </div>
        </div>
        {citiesError && cities.length === 0 ? (
          <div className="p-3.5">
            <SwrError error={citiesError} onRetry={() => mutateCities()} compact />
          </div>
        ) : null}
        {cities.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setSelected(c.name)}
            className={cn(
              "flex w-full items-center justify-between border-b border-border px-4 py-3 text-left hover:bg-secondary",
              selected === c.name && "bg-secondary"
            )}
          >
            <div>
              <div className="font-bold">{c.name}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {c.count} {t("map.adsIn")}
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ))}
      </aside>

      <div className="relative">
        <MapContainer
          center={[42.0, 43.5]}
          zoom={7}
          className="h-full w-full"
          style={{ background: theme === "dark" ? "#000" : "#fff" }}
        >
          <TileLayer
            key={theme}
            attribution="&copy; OpenStreetMap &copy; CARTO"
            url={
              theme === "dark"
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
            subdomains={["a", "b", "c", "d"]}
            maxZoom={20}
          />
          {makeIcon
            ? cities.map((c) => (
                <Marker
                  key={c.name}
                  position={[c.lat, c.lng]}
                  icon={makeIcon(c.count, selected === c.name)}
                  eventHandlers={{ click: () => setSelected(c.name) }}
                >
                  <Popup>
                    <strong>{c.name}</strong>
                    <br />
                    {c.count} {t("map.adsIn")}
                  </Popup>
                </Marker>
              ))
            : null}
        </MapContainer>

        <div className="pointer-events-auto absolute right-4 top-4 bottom-4 z-[1100] hidden w-[320px] overflow-y-auto rounded-md border border-border bg-card p-3.5 md:block">
          <div className="text-base font-extrabold">{selected}</div>
          <div className="mt-1 mb-3 font-mono text-[11px] text-muted-foreground">
            {inCityCount} {t("map.adsIn")}
          </div>
          {cityListingsError && inCity.length === 0 ? (
            <SwrError error={cityListingsError} onRetry={() => mutateCityListings()} compact />
          ) : null}
          <div className="grid gap-2">
            {inCity.map((l) => (
              <a
                key={l.id}
                href={`/listing/${l.id}`}
                className="flex gap-2.5 rounded-sm border border-border p-2 hover:bg-secondary"
              >
                <div className="relative h-[42px] w-14 shrink-0 overflow-hidden rounded-sm">
                  <Image src={l.photos[0]} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold">
                    {l.make} {l.model}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {l.year} · {fmt.km(l.mileage)}km
                  </div>
                  <div className="font-mono text-[13px] font-extrabold">{fmt.price(l.price, currency, FX)}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
