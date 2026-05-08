"use client";
import type { DivIcon } from "leaflet";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useTheme } from "@/components/theme-provider";
import { fetcher } from "@/lib/api";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

type CityCount = { name: string; count: number; lat: number; lng: number };

export function MiniMap({ city }: { city: string }) {
  const t = useTranslations();
  const { theme } = useTheme();
  const { data } = useSWR<{ cities: CityCount[] }>("/map/cities", fetcher);
  const target = data?.cities.find((c) => c.name === city);
  const [icon, setIcon] = useState<DivIcon | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled) return;
      setIcon(
        L.divIcon({
          className: "",
          html: `<div class="map-pin is-active"><span></span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) return null;

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="border-b border-border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {t("map.onMap")} · {city}
      </div>
      <div className="h-[180px] w-full">
        <MapContainer
          key={`${target.lat},${target.lng},${theme}`}
          center={[target.lat, target.lng]}
          zoom={11}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
          className="h-full w-full"
        >
          <TileLayer
            url={
              theme === "dark"
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
            subdomains={["a", "b", "c", "d"]}
            maxZoom={20}
          />
          {icon ? <Marker position={[target.lat, target.lng]} icon={icon} /> : null}
        </MapContainer>
      </div>
    </div>
  );
}
