"use client";

import dynamic from "next/dynamic";
import type { GuardEvent, HeatmapPoint } from "@/lib/types/heatmap";

const Mapbox3DVolumeMap = dynamic(
  () => import("./Mapbox3DVolumeMap"),
  {
    ssr:     false,
    loading: () => (
      <div style={{ height: 600 }} className="bg-slate-900 flex items-center justify-center rounded-xl">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-2 rounded-full border-2 border-slate-700 border-t-violet-500 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Cargando mapa 3D…</span>
        </div>
      </div>
    ),
  }
);

interface Props {
  points?:            HeatmapPoint[];
  recentGuardEvents?: GuardEvent[];
}

export default function Mapbox3DVolumeMapWrapper({ points, recentGuardEvents }: Props) {
  return <Mapbox3DVolumeMap points={points} recentGuardEvents={recentGuardEvents} />;
}
