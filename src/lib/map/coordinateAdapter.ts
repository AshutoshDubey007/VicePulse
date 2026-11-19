/**
 * VicePulse - GTADB Coordinate Adapter & Projection Engine
 * 
 * Provides mathematically exact transformations between:
 * 1. GTADB In-Game Cartesian World Space (in-game meters [x, y], bounds [-16384, -16384] to [16384, 16384])
 * 2. Leaflet / Slippy Tile Space (tileX, tileY at zoom levels 0-5)
 * 3. VicePulse Discovery Geographic Space ([lng, lat] for Florida/Leonida reference points)
 * 
 * Attributions:
 * - GTA VI Map Tiles & Landmark Data (CC BY 4.0) — https://map.gtadb.org
 * - GTADB Core Engine (MIT License) — https://github.com/rolux/gtadb.org
 */

export const WORLD_SIZE = 32768; // in meters (level bounds: -16384 to 16384)
export const HALF_WORLD = 16384;
export const TILE_SIZE = 256;
export const MIN_ZOOM = 0;
export const MAX_ZOOM = 5;

// Valid tile index bounds [x0, y0] to [x1, y1] for each zoom level in GTADB 'day' tileset
export const DAY_TILE_RANGES: Record<number, [[number, number], [number, number]]> = {
  0: [[0, 0], [2, 3]],
  1: [[1, 1], [5, 6]],
  2: [[2, 2], [10, 12]],
  3: [[4, 4], [20, 25]],
  4: [[8, 8], [41, 51]],
  5: [[17, 17], [83, 103]],
};

// 1x1 Transparent PNG fallback for missing ocean tiles
export const EMPTY_TILE_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Ocean blue fallback tile (matches GTADB Leonida waters: #2F90B0 / rgb(47, 144, 176))
export const OCEAN_TILE_COLOR = '#2F90B0';

/**
 * Checks whether a tile coordinate is within the valid GTADB community map bounds
 */
export function isTileWithinDayBounds(z: number, x: number, y: number): boolean {
  const range = DAY_TILE_RANGES[z];
  if (!range) return false;
  const [[x0, y0], [x1, y1]] = range;
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

/**
 * Returns the local URL path for a GTADB GTA VI tile, or fallback transparent data URI
 */
export function getGtaTileUrl(z: number, x: number, y: number): string {
  if (z < MIN_ZOOM || z > MAX_ZOOM || !isTileWithinDayBounds(z, x, y)) {
    return EMPTY_TILE_DATA_URI;
  }
  return `/maps/tiles/6/day/${z}/${z},${y},${x}.jpg`;
}

/**
 * Converts GTADB in-game meters [x, y] to total world pixel coordinates at zoom level z
 * At zoom 5, 1 meter = 1 pixel. Total map width = 32768px.
 * At zoom 0, total map width = 1024px.
 */
export function inGameToMapPixel(x: number, y: number, z: number): { px: number; py: number } {
  const clampedZ = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
  const scale = Math.pow(2, clampedZ) / 32; // (1024 * 2^z) / 32768
  const px = (x + HALF_WORLD) * scale;
  const py = (HALF_WORLD - y) * scale; // in-game y increases upwards; screen py increases downwards
  return { px, py };
}

/**
 * Converts world pixel coordinates at zoom level z back to in-game meters [x, y]
 */
export function mapPixelToInGame(px: number, py: number, z: number): { x: number; y: number } {
  const clampedZ = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
  const scale = Math.pow(2, clampedZ) / 32;
  const x = px / scale - HALF_WORLD;
  const y = HALF_WORLD - py / scale;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

/**
 * Converts GTADB in-game coordinates [x, y] to tile coordinates and tile offsets
 */
export function inGameToTileCoords(x: number, y: number, z: number) {
  const { px, py } = inGameToMapPixel(x, y, z);
  const tileX = Math.floor(px / TILE_SIZE);
  const tileY = Math.floor(py / TILE_SIZE);
  const offsetX = px % TILE_SIZE;
  const offsetY = py % TILE_SIZE;
  return { tileX, tileY, offsetX, offsetY };
}

/**
 * Anchor alignment points for Florida GPS [lng, lat] to GTADB In-Game Space [x, y]
 * Rockstar designed Leonida based on South Florida, condensing regional distances:
 * - Downtown Vice City / Biscayne Bay is at map origin [0, 0]
 * - Vice Beach (Ocean Drive / Collins Ave) is to the East [1400..2500, 1000..3000]
 * - Port Gellhorn (Gulf Coast analog) is to the West [-9500..-6000, 2000..4500]
 * - Key Chicas / Straits (Florida Keys analog) are to the South [-1500..1500, -7500..-2000]
 * - Lake Leonida / Ambrosia (Lake Okeechobee / rural sugar mills) are to the North [-4000..1000, 3000..8000]
 */
interface AnchorPoint {
  name: string;
  lng: number;
  lat: number;
  x: number;
  y: number;
}

export const REFERENCE_ANCHORS: AnchorPoint[] = [
  { name: 'Downtown Vice City', lng: -80.1918, lat: 25.7617, x: 0, y: 0 },
  { name: 'Ocean Drive / South Beach', lng: -80.1310, lat: 25.7820, x: 1850, y: 1550 },
  { name: 'Vice Regal Hotel / Bal Harbour', lng: -80.1233, lat: 25.8990, x: 1409.4, y: 2803.2 },
  { name: 'Port Gellhorn Shipping Yards', lng: -81.2310, lat: 25.4210, x: -7200, y: 2750 },
  { name: 'Ambrosia Allied Sugar Mill', lng: -80.9520, lat: 25.8890, x: -3016.5, y: 3346.7 },
  { name: 'Key Chicas Marine Station', lng: -80.2200, lat: 25.5400, x: 600, y: -4500 },
  { name: 'Grassrivers Airboat Camp', lng: -80.6420, lat: 25.6120, x: -2600, y: -800 },
];

/**
 * Maps VicePulse discovery coordinates [lng, lat] to GTADB in-game meters [x, y]
 * Uses anchor-based distance-weighted inverse distance weighting (IDW) interpolation
 * for faithful alignment with the community GTA VI map geometry.
 */
export function discoveryToInGame(lng: number, lat: number): { x: number; y: number } {
  // If coordinates are exact or very close to an anchor
  for (const anchor of REFERENCE_ANCHORS) {
    const dLng = lng - anchor.lng;
    const dLat = lat - anchor.lat;
    if (Math.abs(dLng) < 0.001 && Math.abs(dLat) < 0.001) {
      return { x: anchor.x, y: anchor.y };
    }
  }

  // Inverse distance weighting across anchors
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (const anchor of REFERENCE_ANCHORS) {
    const dLng = lng - anchor.lng;
    const dLat = lat - anchor.lat;
    const distSq = dLng * dLng + dLat * dLat;
    const dist = Math.sqrt(distSq);
    if (dist < 0.0001) {
      return { x: anchor.x, y: anchor.y };
    }
    const weight = 1 / Math.pow(dist, 1.8);
    totalWeight += weight;
    weightedX += anchor.x * weight;
    weightedY += anchor.y * weight;
  }

  const x = Math.round((weightedX / totalWeight) * 10) / 10;
  const y = Math.round((weightedY / totalWeight) * 10) / 10;
  return { x, y };
}

/**
 * Converts GTADB in-game meters [x, y] to South Florida geographic coordinates [lng, lat]
 */
export function inGameToDiscovery(x: number, y: number): { lng: number; lat: number } {
  let totalWeight = 0;
  let weightedLng = 0;
  let weightedLat = 0;

  for (const anchor of REFERENCE_ANCHORS) {
    const dx = x - anchor.x;
    const dy = y - anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) {
      return { lng: anchor.lng, lat: anchor.lat };
    }
    const weight = 1 / Math.pow(dist, 1.8);
    totalWeight += weight;
    weightedLng += anchor.lng * weight;
    weightedLat += anchor.lat * weight;
  }

  const lng = Number((weightedLng / totalWeight).toFixed(6));
  const lat = Number((weightedLat / totalWeight).toFixed(6));
  return { lng, lat };
}

/**
 * Formats an in-game grid reference string (e.g. "VB-04", "PG-12") based on in-game coordinates
 */
export function getInGameGridCode(x: number, y: number): string {
  let prefix = 'VC';
  if (x > 1000 && y >= 500) prefix = 'VB'; // Vice Beach
  else if (x < -4000) prefix = 'PG'; // Port Gellhorn
  else if (x < -1500 && y > 2000) prefix = 'AM'; // Ambrosia / Lake Leonida
  else if (x < -1000 && y <= 0) prefix = 'GR'; // Grassrivers
  else if (y < -1500) prefix = 'KC'; // Key Chicas / Straits
  else if (y > 4000) prefix = 'NL'; // North Leonida

  const gridX = Math.floor(Math.abs(x) / 1000);
  const gridY = Math.floor(Math.abs(y) / 1000);
  const num = (gridX * 7 + gridY * 3) % 99 + 1;
  const pad = num < 10 ? `0${num}` : `${num}`;

  return `${prefix}-${pad}`;
}
