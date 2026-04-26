"use client";

// CSS is loaded globally via app/globals.css @import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef, useState } from "react";
import type { HeatmapPoint, HeatmapResponse } from "@/lib/types/heatmap";

const CELL_SIZE = 0.01;

// ── Grid aggregation ──────────────────────────────────────────────────────────

interface GridCell {
  lat:            number;
  lng:            number;
  count:          number;
  eventsCount:    number;
  guardCount:     number;
  totalIntensity: number;
  height:         number;
}

function buildGrid(points: HeatmapPoint[]): GridCell[] {
  const cells = new Map<string, GridCell>();

  for (const p of points) {
    const lat = Math.round(p.lat / CELL_SIZE) * CELL_SIZE;
    const lng = Math.round(p.lng / CELL_SIZE) * CELL_SIZE;
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

    if (!cells.has(key)) {
      cells.set(key, { lat, lng, count: 0, eventsCount: 0, guardCount: 0, totalIntensity: 0, height: 200 });
    }

    const c = cells.get(key)!;
    c.count++;
    c.totalIntensity += p.intensity;
    if (p.source === "events") c.eventsCount++;
    else                       c.guardCount++;
  }

  return Array.from(cells.values())
    .map((c) => ({
      ...c,
      height: Math.min(5000, Math.max(200, c.count * 80)) + c.guardCount * 300,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 1000);
}

function toGeoJSON(cells: GridCell[]) {
  return {
    type: "FeatureCollection" as const,
    features: cells.map((c) => ({
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [c.lng,             c.lat            ],
          [c.lng + CELL_SIZE, c.lat            ],
          [c.lng + CELL_SIZE, c.lat + CELL_SIZE],
          [c.lng,             c.lat + CELL_SIZE],
          [c.lng,             c.lat            ],
        ]],
      },
      properties: {
        count:          c.count,
        eventsCount:    c.eventsCount,
        guardCount:     c.guardCount,
        totalIntensity: Math.round(c.totalIntensity),
        height:         c.height,
        lat:            c.lat.toFixed(4),
        lng:            c.lng.toFixed(4),
      },
    })),
  };
}

// ── Overlay panel ─────────────────────────────────────────────────────────────

function MapOverlays({
  total,
  cells,
  dataLoading,
}: {
  total:       number;
  cells:       number;
  dataLoading: boolean;
}) {
  return (
    <>
      {/* Title — top left */}
      <div className="absolute top-3 left-3 z-[200] bg-black/70 backdrop-blur-md rounded-xl border border-white/10 px-3 py-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-base">🏙️</span>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight">Vista Volumétrica 3D</p>
            <p className="text-[9px] text-slate-400">CDMX · datos reales Supabase</p>
          </div>
        </div>
      </div>

      {/* Stats — top center */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md rounded-lg border border-white/10 px-2.5 py-1.5 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${dataLoading ? "bg-amber-400" : "bg-emerald-400"}`} />
          <span className="text-[10px] font-semibold text-white whitespace-nowrap">
            {dataLoading
              ? "Cargando datos…"
              : `${total.toLocaleString()} puntos · ${cells.toLocaleString()} celdas`}
          </span>
        </div>
      </div>

      {/* Legend — bottom left */}
      <div className="absolute bottom-10 left-3 z-[200] bg-black/70 backdrop-blur-md rounded-xl border border-white/10 px-3 py-2.5 pointer-events-none">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Densidad</p>
        <div className="space-y-1.5">
          {[
            { color: "#7c3aed", label: "Alertas Guard"  },
            { color: "#dc2626", label: "Muy alta (>50)"  },
            { color: "#f97316", label: "Alta (>20)"      },
            { color: "#facc15", label: "Normal"          },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-xl z-[300]">
      <div className="text-center max-w-sm px-6">
        <div className="h-12 w-12 mx-auto mb-4 rounded-2xl bg-red-900/50 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-sm font-semibold text-white mb-2">Error al inicializar el mapa</p>
        <p className="text-xs text-slate-400 font-mono break-all">{message}</p>
      </div>
    </div>
  );
}

// ── No-token state ────────────────────────────────────────────────────────────

function NoTokenState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-xl">
      <div className="text-center max-w-sm px-6">
        <div className="h-12 w-12 mx-auto mb-4 rounded-2xl bg-violet-900/50 flex items-center justify-center">
          <span className="text-2xl">🗺️</span>
        </div>
        <p className="text-sm font-semibold text-white mb-2">Token de Mapbox requerido</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Agrega{" "}
          <code className="bg-slate-800 text-violet-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          a{" "}
          <code className="bg-slate-800 text-violet-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
            .env.local
          </code>{" "}
          y reinicia el servidor.
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Mapbox3DVolumeMap() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<any>(null);

  const [mapError,     setMapError]     = useState<string | null>(null);
  const [dataLoading,  setDataLoading]  = useState(true);
  const [total,        setTotal]        = useState(0);
  const [cellCount,    setCellCount]    = useState(0);

  // Read token inside effect so it's never stale from module-level capture
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  useEffect(() => {
    console.log("[Mapbox3D] useEffect start");
    console.log("[Mapbox3D] token exists:", !!token);

    if (!token) {
      console.error("[Mapbox3D] No token — aborting");
      return;
    }

    const el = containerRef.current;
    if (!el) {
      console.error("[Mapbox3D] containerRef.current is null");
      return;
    }

    console.log("[Mapbox3D] container:", el.clientWidth, "x", el.clientHeight);

    let cancelled = false;

    // ── Step 1: import mapbox-gl then immediately init the map ────────────────
    import("mapbox-gl")
      .then((mod) => {
        const mapboxgl: any = mod.default ?? mod;

        if (cancelled) return;

        console.log("[Mapbox3D] mapboxgl.Map type:", typeof mapboxgl.Map);

        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container:   el,
          style:       "mapbox://styles/mapbox/streets-v12",
          center:      [-99.1332, 19.4326],
          zoom:        10.8,
          pitch:       60,
          bearing:     -20,
          antialias:   true,
          accessToken: token,
        });

        mapRef.current = map;
        console.log("[Mapbox3D] Map instance created");

        // Navigation control — visible UI proof the map is mounting
        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");

        map.on("error", (e: any) => {
          const msg = e?.error?.message ?? JSON.stringify(e);
          console.error("[Mapbox3D] map error:", msg);
          setMapError(msg);
        });

        map.on("style.load", () => {
          console.log("[Mapbox3D] style.load fired");
        });

        // ── Step 2: fetch data only after map tiles are ready ─────────────────
        map.on("load", async () => {
          console.log("[Mapbox3D] map.on('load') fired");
          if (cancelled) return;

          map.resize();
          const canvas = map.getCanvas();
          console.log("[Mapbox3D] canvas after resize:", canvas.width, "x", canvas.height);

          try {
            const r = await fetch("/api/heatmap");
            if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.statusText}`);
            const data: HeatmapResponse = await r.json();
            if (cancelled) return;

            const points = data.points ?? [];
            const cells  = buildGrid(points);
            const geo    = toGeoJSON(cells);

            console.log("[Mapbox3D] points received:", points.length);
            console.log("[Mapbox3D] cells generated:", cells.length);
            if (cells[0]) console.log("[Mapbox3D] sample cell:", JSON.stringify(cells[0]));

            setTotal(points.length);
            setCellCount(cells.length);

            // Add source + extrusion layer
            map.addSource("grid", { type: "geojson", data: geo });

            map.addLayer({
              id:     "grid-extrusion",
              type:   "fill-extrusion",
              source: "grid",
              paint:  {
                "fill-extrusion-color": [
                  "case",
                  [">", ["get", "guardCount"], 0], "#7c3aed",
                  [">", ["get", "count"],      50], "#dc2626",
                  [">", ["get", "count"],      20], "#f97316",
                  "#facc15",
                ],
                "fill-extrusion-height":  ["get", "height"],
                "fill-extrusion-base":    0,
                "fill-extrusion-opacity": 0.85,
              },
            });

            console.log("[Mapbox3D] fill-extrusion layer added");

            // Popup on click
            const popup = new mapboxgl.Popup({ closeButton: true, maxWidth: "260px" });

            map.on("click", "grid-extrusion", (e: any) => {
              const props = e.features?.[0]?.properties;
              if (!props) return;
              popup
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="font-family:ui-sans-serif,system-ui,sans-serif;padding:2px 0;background:#1e293b;color:#fff;border-radius:8px;">
                    <div style="font-size:11px;font-weight:700;margin-bottom:8px;color:#f8fafc;">
                      Celda&nbsp;${props.lat},&nbsp;${props.lng}
                    </div>
                    <table style="width:100%;font-size:11px;border-collapse:collapse;">
                      <tr><td style="color:#94a3b8;padding:2px 0;">Eventos totales</td>
                          <td style="color:#fff;font-weight:600;text-align:right;">${props.count}</td></tr>
                      <tr><td style="color:#94a3b8;padding:2px 0;">Territoriales</td>
                          <td style="color:#fb923c;font-weight:600;text-align:right;">${props.eventsCount}</td></tr>
                      <tr><td style="color:#94a3b8;padding:2px 0;">Guard</td>
                          <td style="color:#a78bfa;font-weight:600;text-align:right;">${props.guardCount}</td></tr>
                      <tr><td style="color:#94a3b8;padding:2px 0;">Intensidad</td>
                          <td style="color:#fff;font-weight:600;text-align:right;">${props.totalIntensity}</td></tr>
                    </table>
                  </div>
                `)
                .addTo(map);
            });

            map.on("mouseenter", "grid-extrusion", () => {
              map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", "grid-extrusion", () => {
              map.getCanvas().style.cursor = "";
            });

          } catch (err: any) {
            console.error("[Mapbox3D] data fetch error:", err);
          } finally {
            setDataLoading(false);
          }
        });
      })
      .catch((err: any) => {
        console.error("[Mapbox3D] import/init error:", err);
        setMapError(String(err));
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!token) return <NoTokenState />;
  if (mapError) return <ErrorState message={mapError} />;

  return (
    <div className="relative w-full" style={{ height: "600px", minHeight: "600px" }}>
      {/* Map canvas — explicit pixel dimensions guarantee WebGL initializes */}
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* Overlays sit on top with high z-index + pointer-events-none */}
      <MapOverlays total={total} cells={cellCount} dataLoading={dataLoading} />
    </div>
  );
}
