import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GtaMapFeature from '@/models/GtaMapFeature';
import GtaEntity from '@/models/GtaEntity';
import { gameToMap } from '@/lib/coordinates';

export const dynamic = 'force-dynamic';

// Baseline GeoJSON for Leonida districts (GTADB CC BY 4.0 Community Model)
const BASELINE_DISTRICTS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'district.vice-beach',
      properties: {
        name: 'Vice Beach',
        slug: 'vice-beach',
        region: 'Vice City',
        kind: 'district',
        color: '#FF4FA0',
        description: 'Vibrant sun-soaked coastal strip famous for Ocean Drive, art deco hotels, and bustling boardwalks.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.145, 25.820],
            [-80.115, 25.820],
            [-80.115, 25.750],
            [-80.145, 25.750],
            [-80.145, 25.820],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'district.downtown-vice-city',
      properties: {
        name: 'Downtown Vice City',
        slug: 'downtown-vice-city',
        region: 'Vice City',
        kind: 'district',
        color: '#19C7B8',
        description: 'Commercial high-rise financial core, port terminals, and transit hubs.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.220, 25.790],
            [-80.170, 25.790],
            [-80.170, 25.740],
            [-80.220, 25.740],
            [-80.220, 25.790],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'district.port-gellhorn',
      properties: {
        name: 'Port Gellhorn',
        slug: 'port-gellhorn',
        region: 'Port Gellhorn',
        kind: 'district',
        color: '#FF8247',
        description: 'Industrial shipping port, container depots, and coastal refineries on western Leonida.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-81.280, 25.460],
            [-81.180, 25.460],
            [-81.180, 25.380],
            [-81.280, 25.380],
            [-81.280, 25.460],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'district.grassrivers',
      properties: {
        name: 'Grassrivers',
        slug: 'grassrivers',
        region: 'Grassrivers',
        kind: 'district',
        color: '#10B981',
        description: 'Vast subtropical wetland wilderness, cypress swamps, airboat trails, and wildlife sanctuaries.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.850, 25.680],
            [-80.450, 25.680],
            [-80.450, 25.250],
            [-80.850, 25.250],
            [-80.850, 25.680],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'district.key-chicas',
      properties: {
        name: 'Key Chicas',
        slug: 'key-chicas',
        region: 'Key Chicas',
        kind: 'district',
        color: '#3B82F6',
        description: 'Tropical archipelago connected by the Overseas Highway, coral reefs, and luxury marinas.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.600, 25.100],
            [-80.250, 25.100],
            [-80.350, 24.800],
            [-80.700, 24.800],
            [-80.600, 25.100],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'district.ambrosia',
      properties: {
        name: 'Ambrosia',
        slug: 'ambrosia',
        region: 'Ambrosia',
        kind: 'district',
        color: '#F59E0B',
        description: 'Agricultural heartland, rural towns, cattle ranches, and country highways.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.800, 26.150],
            [-80.300, 26.150],
            [-80.300, 25.750],
            [-80.800, 25.750],
            [-80.800, 26.150],
          ],
        ],
      },
    },
  ],
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const layer = url.searchParams.get('layer') || 'all';

    // 1. Fetch any synced GeoJSON features from database
    const dbFeatures = await GtaMapFeature.find({
      ...(layer !== 'all' ? { layer } : {}),
    }).lean();

    // 2. Build district features
    let districtFeatures: any[] = [];
    const dbDistricts = dbFeatures.filter((f) => f.layer === 'districts');

    if (dbDistricts.length > 0) {
      districtFeatures = dbDistricts.map((f) => {
        let coords = f.geometry.coordinates;
        // Check if coordinates need game-to-map conversion
        if (Array.isArray(coords) && typeof coords[0]?.[0]?.[0] === 'number') {
          const sample = coords[0][0];
          if (Math.abs(sample[0]) > 180 || Math.abs(sample[1]) > 90) {
            coords = coords.map((ring: any[]) =>
              ring.map((pt: [number, number]) => gameToMap(pt[0], pt[1]))
            );
          }
        }
        return {
          type: 'Feature',
          id: f.featureId,
          properties: f.properties,
          geometry: {
            type: f.geometry.type,
            coordinates: coords,
          },
        };
      });
    } else {
      districtFeatures = BASELINE_DISTRICTS.features;
    }

    // 3. Build landmark features from GtaEntity (businesses, landmarks, locations)
    const landmarks = await GtaEntity.find({
      type: { $in: ['location', 'business'] },
    }).lean();

    const landmarkFeatures = landmarks.map((l) => {
      // If entity has coordinate attributes, map them
      const attr = l.attributes || {};
      const inGameX = attr.coord_x || attr.x;
      const inGameY = attr.coord_y || attr.y;
      let mapCoords = [-80.1918, 25.7617]; // default center

      if (typeof inGameX === 'number' && typeof inGameY === 'number') {
        mapCoords = gameToMap(inGameX, inGameY);
      } else if (l.slug === 'vice-beach' || l.slug?.includes('beach')) {
        mapCoords = [-80.130, 25.790];
      } else if (l.slug === 'port-gellhorn') {
        mapCoords = [-81.231, 25.421];
      } else if (l.slug === 'grassrivers') {
        mapCoords = [-80.650, 25.450];
      } else if (l.slug === 'key-chicas') {
        mapCoords = [-80.450, 24.950];
      }

      return {
        type: 'Feature',
        id: l.externalId,
        properties: {
          name: typeof l.name === 'object' ? l.name.en : l.name,
          slug: l.slug,
          type: l.type,
          kind: attr.kind || l.type,
          area: attr.area || attr.region || 'Leonida',
          summary: typeof l.summary === 'object' ? l.summary?.en : l.summary,
        },
        geometry: {
          type: 'Point',
          coordinates: mapCoords,
        },
      };
    });

    return NextResponse.json({
      type: 'FeatureCollection',
      attribution: 'Map data © gtadb.org (CC BY 4.0) & vice-city.app | VicePulse Recon Engine',
      districts: {
        type: 'FeatureCollection',
        features: districtFeatures,
      },
      landmarks: {
        type: 'FeatureCollection',
        features: landmarkFeatures,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
