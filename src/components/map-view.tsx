"use client";
import type { DivIcon } from "leaflet";
import { ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { CITIES, FX, LISTINGS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn, fmt } from "@/lib/utils";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const CITY_COORDS: Record<string, [number, number]> = {
  Tbilisi: [41.7151, 44.8271],
  Batumi: [41.6168, 41.6367],
  Kutaisi: [42.2679, 42.718],
  Rustavi: [41.5495, 45.001],
  Gori: [41.9847, 44.1086],
  Zugdidi: [42.5088, 41.8709],
  Poti: [42.15, 41.671],
  Telavi: [41.9197, 45.4731],
};

export function MapView() {
  const t = useTranslations();
  const { currency } = useApp();
  const [selected, setSelected] = useState("Tbilisi");
  const [makeIcon, setMakeIcon] = useState<((count: number, active: boolean) => DivIcon) | null>(null);

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

  const cityCounts = useMemo(
    () =>
      CITIES.map((c) => ({ name: c, count: LISTINGS.filter((l) => l.city === c).length })).sort(
        (a, b) => b.count - a.count
      ),
    []
  );
  const inCity = LISTINGS.filter((l) => l.city === selected).slice(0, 6);

  return (
    <div className="grid h-[calc(100vh-53px)] grid-cols-1 md:grid-cols-[320px_1fr]">
      <aside className="overflow-y-auto border-r border-border bg-card">
        <div className="border-b border-border px-4 py-3.5">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {cityCounts.length} {t("map.cities")} · {LISTINGS.length} {t("map.adsIn")}
          </div>
        </div>
        {cityCounts.map((c) => (
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
        <MapContainer center={[42.0, 43.5]} zoom={7} className="h-full w-full" style={{ background: "#000" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap &copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c", "d"]}
            maxZoom={20}
          />
          {makeIcon
            ? cityCounts.map((c) => {
                const co = CITY_COORDS[c.name];
                if (!co) return null;
                return (
                  <Marker
                    key={c.name}
                    position={co}
                    icon={makeIcon(c.count, selected === c.name)}
                    eventHandlers={{ click: () => setSelected(c.name) }}
                  >
                    <Popup>
                      <strong>{c.name}</strong>
                      <br />
                      {c.count} {t("map.adsIn")}
                    </Popup>
                  </Marker>
                );
              })
            : null}
        </MapContainer>

        <div className="pointer-events-auto absolute right-4 top-4 bottom-4 z-[1100] hidden w-[320px] overflow-y-auto rounded-md border border-border bg-card p-3.5 md:block">
          <div className="text-base font-extrabold">{selected}</div>
          <div className="mt-1 mb-3 font-mono text-[11px] text-muted-foreground">
            {LISTINGS.filter((l) => l.city === selected).length} {t("map.adsIn")}
          </div>
          <div className="grid gap-2">
            {inCity.map((l) => (
              <a
                key={l.id}
                href={`/listing/${l.id}`}
                className="flex gap-2.5 rounded-sm border border-border p-2 hover:bg-secondary"
              >
                {/* biome-ignore lint/performance/noImgElement: photos are inline SVG data URIs */}
                <img src={l.photos[0]} alt="" className="h-[42px] w-14 rounded-sm object-cover" />
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
