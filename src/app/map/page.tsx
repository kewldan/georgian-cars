"use client";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map-view").then((m) => m.MapView), { ssr: false });
export default function MapPage() {
  return <MapView />;
}
