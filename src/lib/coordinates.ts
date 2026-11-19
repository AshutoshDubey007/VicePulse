/**
 * VicePulse Coordinate Transformation & Provenance Engine
 * 
 * Supports bidirectional translation between:
 * 1. GTA VI In-Game World Coordinates (GTADB CRS: [x, y] in meters from central origin)
 * 2. Map Coordinates ([lng, lat] for MapLibre GL JS)
 * 3. Tactical In-Game Grid References (e.g. "VD-04", "PB-12")
 */

export interface InGameCoord {
  x: number;
  y: number;
  z?: number;
}

export interface MapCoord {
  lng: number;
  lat: number;
}

export interface CoordinateProvenance {
  system: 'gtadb_v6' | 'in_game_gps' | 'vicepulse_recon';
  originalCoords: [number, number];
  source: string;
  importedAt?: string;
}

// In-Game [0, 0] anchor reference aligned to Vice City Downtown
export const REFERENCE_ORIGIN = {
  lng: -80.1918,
  lat: 25.7617,
  // Scale factors in degrees per in-game meter (WGS84 projection approximation for Florida latitudes)
  degPerMeterLng: 0.0000104,
  degPerMeterLat: 0.0000095,
};

/**
 * Transforms GTADB In-Game coordinates (meters) to MapLibre [lng, lat]
 */
export function gameToMap(x: number, y: number): [number, number] {
  const lng = REFERENCE_ORIGIN.lng + x * REFERENCE_ORIGIN.degPerMeterLng;
  const lat = REFERENCE_ORIGIN.lat + y * REFERENCE_ORIGIN.degPerMeterLat;
  return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
}

/**
 * Transforms MapLibre [lng, lat] to GTADB In-Game coordinates [x, y]
 */
export function mapToGame(lng: number, lat: number): [number, number] {
  const x = (lng - REFERENCE_ORIGIN.lng) / REFERENCE_ORIGIN.degPerMeterLng;
  const y = (lat - REFERENCE_ORIGIN.lat) / REFERENCE_ORIGIN.degPerMeterLat;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

/**
 * Calculates human-readable in-game tactical grid sector (e.g. "VD-04", "KC-02")
 */
export function calculateInGameGrid(x: number, y: number): string {
  // Sector prefixes based on quadrant & distance
  let prefix = 'VC'; // Vice City
  if (x < -2000 && y < 0) prefix = 'GR'; // Grassrivers
  else if (x < -2000 && y >= 0) prefix = 'PG'; // Port Gellhorn
  else if (x >= 0 && y < -1500) prefix = 'KC'; // Key Chicas
  else if (x > 1000) prefix = 'VB'; // Vice Beach
  else if (y > 2000) prefix = 'NL'; // North Leonida

  // 1000m grid cell indexing
  const gridX = Math.floor(Math.abs(x) / 1000);
  const gridY = Math.floor(Math.abs(y) / 1000);
  const num = (gridX * 4 + gridY) % 99 + 1;
  const pad = num < 10 ? `0${num}` : `${num}`;

  return `${prefix}-${pad}`;
}

/**
 * Computes straight-line distance in meters between two in-game or map coordinate points
 */
export function getDistanceInMeters(
  pointA: { x?: number; y?: number; lng?: number; lat?: number },
  pointB: { x?: number; y?: number; lng?: number; lat?: number }
): number {
  let x1 = pointA.x;
  let y1 = pointA.y;
  let x2 = pointB.x;
  let y2 = pointB.y;

  if (x1 === undefined && pointA.lng !== undefined && pointA.lat !== undefined) {
    [x1, y1] = mapToGame(pointA.lng, pointA.lat);
  }
  if (x2 === undefined && pointB.lng !== undefined && pointB.lat !== undefined) {
    [x2, y2] = mapToGame(pointB.lng, pointB.lat);
  }

  if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
    return 0;
  }

  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}
