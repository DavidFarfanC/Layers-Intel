"use client";

import dynamic from "next/dynamic";
import type { MapViewMode } from "./FilteredMapLeaflet";
import type { Incident } from "@/lib/mockData";

// Load Leaflet only on the client — it requires browser APIs.
const FilteredMapLeaflet = dynamic(
  () => import("./FilteredMapLeaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-2 rounded-full border-2 border-slate-300 border-t-brand-500 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Cargando mapa…</span>
        </div>
      </div>
    ),
  }
);

interface DashboardMapProps {
  incidents: Incident[];
  viewMode: MapViewMode;
  className?: string;
}

export default function DashboardMap({ incidents, viewMode, className }: DashboardMapProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl w-full h-full ${className ?? ""}`}>
      <FilteredMapLeaflet incidents={incidents} viewMode={viewMode} />
    </div>
  );
}
