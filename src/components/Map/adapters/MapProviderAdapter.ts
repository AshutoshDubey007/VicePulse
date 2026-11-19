import { StyleSpecification } from 'maplibre-gl';
import { gameToMap, mapToGame, REFERENCE_ORIGIN } from '@/lib/coordinates';
import { 
  leonidaLandmassGeoJSON, 
  leonidaWaterwaysGeoJSON, 
  leonidaSectorsGeoJSON 
} from './leonidaGeoJson';

export interface IVicePulseMapAdapter {
  id: string;
  name: string;
  badge: string;
  description: string;
  attribution: string;
  getStyleSpec(): StyleSpecification;
  projectGameToMap(x: number, y: number): [number, number];
  projectMapToGame(lng: number, lat: number): [number, number];
  bounds: [[number, number], [number, number]];
  defaultCenter: [number, number];
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
}

// Full Leonida / South Florida bounding box covering Vice Beach to Port Gellhorn, Lake Leonida & The Keys
const LEONIDA_BOUNDS: [[number, number], [number, number]] = [
  [-84.00, 23.50], // Southwest (Gulf of Mexico / Lower Keys / Deep South)
  [-78.00, 28.50], // Northeast (Atlantic Ocean / Lake Leonida / North Border)
];

const LEONIDA_CENTER: [number, number] = [-80.45, 25.68];

/**
 * 1. VicePulse Dark Tactical Adapter (Primary)
 * Real-world South Florida / Leonida geography using Esri Dark Gray Canvas Base tiles.
 * Displays real coastlines, islands, keys, waterways, causeways, highways, and street grids.
 * 100% free of commercial POIs, third-party landmark icons, and street labels.
 * Completely free of watermarks — zero API key or token required.
 * Fully configurable via NEXT_PUBLIC_MAP_TILE_URL, NEXT_PUBLIC_MAP_ATTRIBUTION, NEXT_PUBLIC_MAP_MIN_ZOOM, NEXT_PUBLIC_MAP_MAX_ZOOM.
 */
export class VicePulseDarkTacticalAdapter implements IVicePulseMapAdapter {
  id = 'vicepulse-dark';
  name = 'VicePulse Dark Tactical';
  badge = 'TACTICAL DARK';
  description = 'High-contrast dark Leonida cartography with zero third-party commercial POIs, street labels, or watermarks.';
  attribution = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_MAP_ATTRIBUTION
    ? process.env.NEXT_PUBLIC_MAP_ATTRIBUTION
    : '© Esri, HERE, Garmin, © OpenStreetMap contributors';

  bounds = LEONIDA_BOUNDS;
  defaultCenter = LEONIDA_CENTER;
  defaultZoom = 10;
  minZoom = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_MAP_MIN_ZOOM ? Number(process.env.NEXT_PUBLIC_MAP_MIN_ZOOM) : 7;
  maxZoom = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_MAP_MAX_ZOOM ? Number(process.env.NEXT_PUBLIC_MAP_MAX_ZOOM) : 18;

  projectGameToMap(x: number, y: number): [number, number] {
    return gameToMap(x, y);
  }

  projectMapToGame(lng: number, lat: number): [number, number] {
    return mapToGame(lng, lat);
  }

  getStyleSpec(): StyleSpecification {
    const customTileUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_MAP_TILE_URL;
    
    // Default to clean Esri World Dark Gray Base (no labels, zero watermark, no API key required)
    const tileUrls = customTileUrl
      ? [customTileUrl]
      : [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        ];

    return {
      version: 8,
      name: 'VicePulse Dark Tactical',
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'esri-dark-tiles': {
          type: 'raster',
          tiles: tileUrls,
          tileSize: 256,
          attribution: this.attribution,
        },
        'leonida-sectors': {
          type: 'geojson',
          data: leonidaSectorsGeoJSON,
        },
      },
      layers: [
        // Base dark raster map layer
        {
          id: 'esri-dark-layer',
          type: 'raster',
          source: 'esri-dark-tiles',
          minzoom: 0,
          maxzoom: 19,
          paint: {
            'raster-opacity': 0.95,
            'raster-contrast': 0.2,
            'raster-saturation': -0.15,
          },
        },
        // Tactical district sectors
        {
          id: 'sector-boundaries',
          type: 'line',
          source: 'leonida-sectors',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-dasharray': [4, 3],
            'line-opacity': 0.75,
          },
        },
        // Sector names
        {
          id: 'sector-labels',
          type: 'symbol',
          source: 'leonida-sectors',
          layout: {
            'text-field': '{name}',
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 11,
            'text-letter-spacing': 0.15,
            'text-transform': 'uppercase',
          },
          paint: {
            'text-color': '#F4F0E8',
            'text-halo-color': '#111114',
            'text-halo-width': 2,
            'text-opacity': 0.7,
          },
        },
      ],
    };
  }
}

// Retain alias for backwards compatibility
export const CartoDarkNoLabelsAdapter = VicePulseDarkTacticalAdapter;

/**
 * 2. Satellite Orthophoto Recon Adapter
 * Real satellite imagery of Vice City / Leonida terrain, coral reefs, and waterways.
 * Completely free of baked-in street labels or third-party markers.
 * Legal Attribution: Esri, Maxar, Earthstar Geographics.
 */
export class SatelliteOrthophotoAdapter implements IVicePulseMapAdapter {
  id = 'satellite-recon';
  name = 'Satellite Orthophoto Recon';
  badge = 'SATELLITE';
  description = 'True high-resolution satellite imagery of South Florida / Leonida coastlines and Everglades.';
  attribution = '© Esri, Maxar, Earthstar Geographics';

  bounds = LEONIDA_BOUNDS;
  defaultCenter = LEONIDA_CENTER;
  defaultZoom = 10;
  minZoom = 7;
  maxZoom = 18;

  projectGameToMap(x: number, y: number): [number, number] {
    return gameToMap(x, y);
  }

  projectMapToGame(lng: number, lat: number): [number, number] {
    return mapToGame(lng, lat);
  }

  getStyleSpec(): StyleSpecification {
    return {
      version: 8,
      name: 'VicePulse Satellite Recon',
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'esri-satellite-tiles': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: this.attribution,
        },
        'leonida-sectors': {
          type: 'geojson',
          data: leonidaSectorsGeoJSON,
        },
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'esri-satellite-tiles',
          minzoom: 0,
          maxzoom: 19,
          paint: {
            'raster-opacity': 0.9,
          },
        },
        {
          id: 'sector-boundaries',
          type: 'line',
          source: 'leonida-sectors',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-dasharray': [4, 3],
            'line-opacity': 0.85,
          },
        },
        {
          id: 'sector-labels',
          type: 'symbol',
          source: 'leonida-sectors',
          layout: {
            'text-field': '{name}',
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 11,
            'text-letter-spacing': 0.15,
            'text-transform': 'uppercase',
          },
          paint: {
            'text-color': '#F4F0E8',
            'text-halo-color': '#111114',
            'text-halo-width': 2,
            'text-opacity': 0.85,
          },
        },
      ],
    };
  }
}

/**
 * 3. Vector Blueprint Tactical Grid Adapter
 * Minimalist geometric blueprint overlay with stylized coastline contour glow.
 */
export class VectorBlueprintAdapter implements IVicePulseMapAdapter {
  id = 'vector-blueprint';
  name = 'Vector Blueprint Grid';
  badge = 'BLUEPRINT';
  description = 'Geometric vector landmass contours and sector grids in high-contrast neon palette.';
  attribution = 'VicePulse Autonomous Cartography Unit';

  bounds = LEONIDA_BOUNDS;
  defaultCenter = LEONIDA_CENTER;
  defaultZoom = 10;
  minZoom = 7;
  maxZoom = 18;

  projectGameToMap(x: number, y: number): [number, number] {
    return gameToMap(x, y);
  }

  projectMapToGame(lng: number, lat: number): [number, number] {
    return mapToGame(lng, lat);
  }

  getStyleSpec(): StyleSpecification {
    return {
      version: 8,
      name: 'VicePulse Vector Blueprint',
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'leonida-landmass': {
          type: 'geojson',
          data: leonidaLandmassGeoJSON,
        },
        'leonida-waterways': {
          type: 'geojson',
          data: leonidaWaterwaysGeoJSON,
        },
        'leonida-sectors': {
          type: 'geojson',
          data: leonidaSectorsGeoJSON,
        },
      },
      layers: [
        {
          id: 'ocean-background',
          type: 'background',
          paint: {
            'background-color': '#111114',
          },
        },
        {
          id: 'landmass-fill',
          type: 'fill',
          source: 'leonida-landmass',
          paint: {
            'fill-color': '#1C1B20',
            'fill-opacity': 0.95,
          },
        },
        {
          id: 'coastline-glow',
          type: 'line',
          source: 'leonida-landmass',
          paint: {
            'line-color': '#19C7B8',
            'line-width': 4,
            'line-opacity': 0.4,
          },
        },
        {
          id: 'coastline-stroke',
          type: 'line',
          source: 'leonida-landmass',
          paint: {
            'line-color': '#19C7B8',
            'line-width': 2.5,
          },
        },
        {
          id: 'waterways-line',
          type: 'line',
          source: 'leonida-waterways',
          paint: {
            'line-color': '#111114',
            'line-width': 3,
            'line-opacity': 0.8,
          },
        },
        {
          id: 'sector-boundaries',
          type: 'line',
          source: 'leonida-sectors',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 1.5,
            'line-dasharray': [4, 3],
            'line-opacity': 0.7,
          },
        },
        {
          id: 'sector-labels',
          type: 'symbol',
          source: 'leonida-sectors',
          layout: {
            'text-field': '{name}',
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 11,
            'text-letter-spacing': 0.15,
            'text-transform': 'uppercase',
          },
          paint: {
            'text-color': '#F4F0E8',
            'text-halo-color': '#111114',
            'text-halo-width': 2,
            'text-opacity': 0.8,
          },
        },
      ],
    };
  }
}

export const MAP_ADAPTERS: Record<string, IVicePulseMapAdapter> = {
  'vicepulse-dark': new VicePulseDarkTacticalAdapter(),
  'satellite-recon': new SatelliteOrthophotoAdapter(),
  'vector-blueprint': new VectorBlueprintAdapter(),
};
