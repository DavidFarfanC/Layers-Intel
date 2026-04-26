export interface HeatmapPoint {
  id: string;
  source: "events" | "layers_guard";
  lat: number;
  lng: number;
  intensity: number;
  title: string | null;
  category: string | null;
  severity: string | null;
  description: string | null;
}

export interface HeatmapResponse {
  points: HeatmapPoint[];
}
