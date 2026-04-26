"use client";

import "leaflet/dist/leaflet.css";
// leaflet.heat augments L.heatLayer — no TS types bundled, cast via (L as any) below
// @ts-ignore
import "leaflet.heat";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { HeatmapPoint, HeatmapResponse } from "@/lib/types/heatmap";

// ── Inner component: adds a heat layer to the map ────────────────────────────

interface HeatLayerProps {
  points:   HeatmapPoint[];
  gradient: Record<number, string>;
  radius?:  number;
  blur?:    number;
}

function HeatLayer({ points, gradient, radius = 18, blur = 15 }: HeatLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const maxIntensity = Math.max(...points.map((p) => p.intensity), 1);
    const heatData: [number, number, number][] = points.map((p) => [
      p.lat,
      p.lng,
      p.intensity / maxIntensity,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layer = (L as any).heatLayer(heatData, {
      radius,
      blur,
      maxZoom: 17,
      gradient,
    });

    layer.addTo(map);
    return () => { map.removeLayer(layer); };
  }, [map, points, gradient, radius, blur]);

  return null;
}

// ── Gradient presets ─────────────────────────────────────────────────────────

const EVENTS_GRADIENT = { 0.2: "#fbbf24", 0.5: "#f97316", 0.8: "#ef4444" };
const GUARD_GRADIENT  = { 0.2: "#a5b4fc", 0.5: "#6366f1", 0.8: "#4338ca" };

// ── Loading / error states ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 mx-auto mb-2 rounded-full border-2 border-slate-300 border-t-brand-500 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Cargando datos de Supabase…</span>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
      <div className="text-center px-6 max-w-xs">
        <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-red-500 text-lg">!</span>
        </div>
        <p className="text-sm font-semibold text-red-600 mb-1">Error al cargar datos</p>
        <p className="text-xs text-slate-400 break-words">{message}</p>
      </div>
    </div>
  );
}

// ── Map overlays ──────────────────────────────────────────────────────────────

interface OverlaysProps {
  total:       number;
  eventCount:  number;
  guardCount:  number;
}

function Overlays({ total, eventCount, guardCount }: OverlaysProps) {
  return (
    <>
      {/* Counter — top right */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md rounded-lg border border-slate-100 shadow-sm px-2.5 py-1.5 flex items-center gap-1.5 pointer-events-none">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-semibold text-slate-600">
          Puntos cargados: {total.toLocaleString()}
        </span>
      </div>

      {/* Legend — bottom left */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md rounded-xl border border-slate-100 shadow-card px-3 py-2.5 pointer-events-none">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Fuente de datos
        </p>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
          <span className="text-[11px] font-medium text-slate-600">
            Datos territoriales
          </span>
          <span className="text-[10px] tabular-nums font-semibold text-orange-600 ml-auto pl-3">
            {eventCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0" />
          <span className="text-[11px] font-medium text-slate-600">
            Alertas Layers Guard
          </span>
          <span className="text-[10px] tabular-nums font-semibold text-indigo-600 ml-auto pl-3">
            {guardCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Source badge — top left */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-md rounded-lg border border-slate-100 shadow-sm px-2.5 py-1.5 pointer-events-none">
        <span className="text-[10px] font-semibold text-slate-600">Datos reales · Supabase</span>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function LiveHeatmapLeaflet() {
  const [status, setStatus]   = useState<"loading" | "ready" | "error">("loading");
  const [points, setPoints]   = useState<HeatmapPoint[]>([]);
  const [errMsg, setErrMsg]   = useState<string>("");

  useEffect(() => {
    fetch("/api/heatmap")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.statusText}`);
        return r.json() as Promise<HeatmapResponse>;
      })
      .then((data) => {
        setPoints(data.points);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setErrMsg(err instanceof Error ? err.message : String(err));
        setStatus("error");
      });
  }, []);

  const eventPoints = points.filter((p) => p.source === "events");
  const guardPoints = points.filter((p) => p.source === "layers_guard");

  if (status === "loading") return <LoadingState />;
  if (status === "error")   return <ErrorState message={errMsg} />;

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={[19.41, -99.15]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Territorial events — warm orange/red */}
        {eventPoints.length > 0 && (
          <HeatLayer
            points={eventPoints}
            gradient={EVENTS_GRADIENT}
            radius={18}
            blur={15}
          />
        )}

        {/* Layers Guard digital alerts — cool indigo/violet */}
        {guardPoints.length > 0 && (
          <HeatLayer
            points={guardPoints}
            gradient={GUARD_GRADIENT}
            radius={20}
            blur={18}
          />
        )}
      </MapContainer>

      <Overlays
        total={points.length}
        eventCount={eventPoints.length}
        guardCount={guardPoints.length}
      />
    </div>
  );
}
