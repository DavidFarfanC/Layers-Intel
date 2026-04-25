"use client";

import dynamic from "next/dynamic";

// Leaflet requires a browser DOM — load with ssr:false to prevent server errors.
const RealHeatmapMap = dynamic(
  () => import("@/components/map/RealHeatmapMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[220px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-slate-400 font-medium">Cargando mapa…</span>
      </div>
    ),
  }
);

export default function MapCard() {
  return (
    // overflow-hidden clips the map to the parent's rounded corners
    <div className="relative w-full h-full min-h-[220px] overflow-hidden rounded-xl">
      <RealHeatmapMap />
    </div>
  );
}
