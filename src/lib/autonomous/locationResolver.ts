import { gameToMap, calculateInGameGrid } from '@/lib/coordinates';

export interface ResolvedLocation {
  hasCoordinates: boolean;
  precision: 'exact' | 'approximate' | 'unknown';
  locationName: string;
  district: string;
  coordinates?: {
    lat: number;
    lng: number;
    inGameGrid?: string;
  };
  inGameCoordinates?: {
    x: number;
    y: number;
    z?: number;
  };
  coordinateProvenance?: {
    system: 'gtadb_v6' | 'in_game_gps' | 'vicepulse_recon';
    originalCoords: [number, number];
    source: string;
    importedAt: string;
  };
}

interface LandmarkDef {
  aliases: string[];
  locationName: string;
  district: string;
  x: number;
  y: number;
  z?: number;
}

const LEONIDA_LANDMARK_REGISTRY: LandmarkDef[] = [
  {
    aliases: ['jack of hearts', 'strip club', 'jack hearts', 'bayside club'],
    locationName: 'Jack of Hearts Club',
    district: 'Bayside / Vice City Mainland',
    x: -320.4,
    y: 145.2,
    z: 8.5,
  },
  {
    aliases: ['key chicas', 'sunken airframe', 'smuggler wreck', 'key chicas reef', 'archipelago'],
    locationName: 'Key Chicas South Reef',
    district: 'Key Chicas',
    x: 820.0,
    y: -2640.5,
    z: -14.0,
  },
  {
    aliases: ['gator gulch', 'mudbog', 'albino alligator', 'albino gator', 'grassrivers'],
    locationName: 'Gator Gulch Mudbog',
    district: 'Grassrivers',
    x: -3420.0,
    y: -820.5,
    z: 2.0,
  },
  {
    aliases: ['radar dome', 'cold war observatory', 'listening post', 'north leonida pine'],
    locationName: 'North Leonida Radar Dome',
    district: 'North Leonida',
    x: -1250.0,
    y: 3450.0,
    z: 120.0,
  },
  {
    aliases: ['biscayne bay', 'ghost ship', 'rum runner schooner', 'biscayne shoals'],
    locationName: 'Biscayne Bay Deep Shoals',
    district: 'Biscayne Bay',
    x: -1840.0,
    y: 2190.0,
    z: -25.0,
  },
  {
    aliases: ['fort leonida', 'military airbase', 'hardened hangar', 'lazer jet', 'military base'],
    locationName: 'Fort Leonida Airbase',
    district: 'North Leonida',
    x: -2450.0,
    y: 2890.0,
    z: 15.0,
  },
  {
    aliases: ['ocean beach', 'south beach', 'parking deck', 'car meet', 'underground meet'],
    locationName: 'Ocean Beach Parking Deck',
    district: 'Vice Beaches',
    x: 1450.0,
    y: 320.0,
    z: 12.0,
  },
  {
    aliases: ['port gellhorn', 'freight yard', 'freight terminal', 'gellhorn docks'],
    locationName: 'Port Gellhorn Freight Yard',
    district: 'Port Gellhorn',
    x: -3100.0,
    y: 1200.0,
    z: 4.0,
  },
  {
    aliases: ['starfish island', 'mansion', 'tommy vercetti estate', 'diaz mansion'],
    locationName: 'Starfish Island Estate',
    district: 'Starfish Island',
    x: -120.0,
    y: -450.0,
    z: 6.0,
  },
  {
    aliases: ['lake leonida', 'florida panther', 'dark forest glades', 'panther spawns'],
    locationName: 'Lake Leonida Glades',
    district: 'North Leonida',
    x: -1680.0,
    y: 2310.0,
    z: 18.0,
  },
];

export function resolveLocationFromText(rawText: string, suggestedLocation?: string): ResolvedLocation {
  const normalized = `${rawText} ${suggestedLocation || ''}`.toLowerCase();

  for (const landmark of LEONIDA_LANDMARK_REGISTRY) {
    const isMatch = landmark.aliases.some((alias) => normalized.includes(alias));
    if (isMatch) {
      const [lng, lat] = gameToMap(landmark.x, landmark.y);
      const grid = calculateInGameGrid(landmark.x, landmark.y);

      return {
        hasCoordinates: true,
        precision: 'exact',
        locationName: landmark.locationName,
        district: landmark.district,
        coordinates: {
          lat,
          lng,
          inGameGrid: grid,
        },
        inGameCoordinates: {
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
        },
        coordinateProvenance: {
          system: 'gtadb_v6',
          originalCoords: [landmark.x, landmark.y],
          source: 'GTADB Leonida Coordinate Registry (v6 CRS)',
          importedAt: new Date().toISOString(),
        },
      };
    }
  }

  // Never invent coordinates when location is unknown
  return {
    hasCoordinates: false,
    precision: 'unknown',
    locationName: suggestedLocation || 'Unverified Leonida Coordinates',
    district: 'Leonida Unassigned',
  };
}
