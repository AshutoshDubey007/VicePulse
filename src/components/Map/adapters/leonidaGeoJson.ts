/**
 * VicePulse Leonida Geographic Vector Dataset
 * 
 * Clean geometric coastlines, terrain boundaries, islands, interior waterways,
 * and district sectors for the State of Leonida / Vice City.
 * Free of any commercial labels, street names, or third-party POIs.
 */

export const leonidaLandmassGeoJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. Mainland Leonida (Greater Vice City, Grassrivers & Western Coast)
    {
      type: 'Feature',
      properties: { name: 'Leonida Mainland', type: 'landmass' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.35, 25.88],
            [-80.32, 25.92],
            [-80.24, 25.95],
            [-80.16, 25.93],
            [-80.12, 25.88],
            [-80.13, 25.82],
            [-80.14, 25.75],
            [-80.13, 25.70],
            [-80.15, 25.64],
            [-80.18, 25.60],
            [-80.23, 25.58],
            [-80.30, 25.59],
            [-80.38, 25.62],
            [-80.44, 25.67],
            [-80.48, 25.73],
            [-80.47, 25.81],
            [-80.42, 25.86],
            [-80.35, 25.88],
          ],
        ],
      },
    },

    // 2. Vice Beach Barrier Island (Ocean Drive, North Beach & Art Deco Sector)
    {
      type: 'Feature',
      properties: { name: 'Vice Beach', type: 'island' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.10, 25.74],
            [-80.11, 25.80],
            [-80.10, 25.86],
            [-80.08, 25.84],
            [-80.07, 25.78],
            [-80.08, 25.73],
            [-80.10, 25.74],
          ],
        ],
      },
    },

    // 3. Key Chicas Archipelago Chain (Southwestern Keys & Tropical Islets)
    {
      type: 'Feature',
      properties: { name: 'Key Chicas Shoals', type: 'archipelago' },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Key 1 (Big Chica)
          [
            [
              [-80.25, 25.54],
              [-80.22, 25.56],
              [-80.20, 25.54],
              [-80.21, 25.52],
              [-80.24, 25.52],
              [-80.25, 25.54],
            ],
          ],
          // Key 2 (Little Chica & Smuggler Reef)
          [
            [
              [-80.29, 25.50],
              [-80.27, 25.52],
              [-80.25, 25.50],
              [-80.27, 25.48],
              [-80.29, 25.50],
            ],
          ],
          // Key 3 (Bonefish Cay)
          [
            [
              [-80.34, 25.46],
              [-80.31, 25.48],
              [-80.30, 25.46],
              [-80.32, 25.44],
              [-80.34, 25.46],
            ],
          ],
        ],
      },
    },

    // 4. Starfish Island (Central Bay Luxury Compound)
    {
      type: 'Feature',
      properties: { name: 'Starfish Island', type: 'island' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.125, 25.775],
            [-80.120, 25.780],
            [-80.116, 25.777],
            [-80.118, 25.772],
            [-80.123, 25.771],
            [-80.125, 25.775],
          ],
        ],
      },
    },

    // 5. Lake Leonida & Grassrivers Interior Wetlands
    {
      type: 'Feature',
      properties: { name: 'Grassrivers Basin', type: 'wetlands' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.36, 25.70],
            [-80.32, 25.72],
            [-80.30, 25.68],
            [-80.34, 25.65],
            [-80.38, 25.66],
            [-80.36, 25.70],
          ],
        ],
      },
    },
  ],
};

export const leonidaWaterwaysGeoJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // Vice Bay Channel (Separates Mainland & Vice Beach)
    {
      type: 'Feature',
      properties: { name: 'Vice Bay Channel' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-80.118, 25.87],
          [-80.116, 25.81],
          [-80.112, 25.76],
          [-80.108, 25.71],
        ],
      },
    },
    // South Canal Shipping Lane
    {
      type: 'Feature',
      properties: { name: 'Port Shipping Channel' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-80.15, 25.66],
          [-80.11, 25.69],
          [-80.05, 25.71],
        ],
      },
    },
    // Grassrivers Runoff Canal
    {
      type: 'Feature',
      properties: { name: 'Grassrivers Canal' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-80.34, 25.68],
          [-80.28, 25.66],
          [-80.20, 25.63],
        ],
      },
    },
  ],
};

export const leonidaSectorsGeoJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { code: 'VB-01', name: 'VICE BEACH', color: '#FF4FA0' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.115, 25.72],
            [-80.115, 25.87],
            [-80.06, 25.87],
            [-80.06, 25.72],
            [-80.115, 25.72],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'DT-02', name: 'DOWNTOWN METRO', color: '#FF7A3D' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.22, 25.73],
            [-80.22, 25.82],
            [-80.13, 25.82],
            [-80.13, 25.73],
            [-80.22, 25.73],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'PG-03', name: 'PORT GELLHORN', color: '#19C7B8' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.45, 25.70],
            [-80.45, 25.85],
            [-80.32, 25.85],
            [-80.32, 25.70],
            [-80.45, 25.70],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'GR-04', name: 'GRASSRIVERS BOGS', color: '#FFE066' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.45, 25.56],
            [-80.45, 25.70],
            [-80.25, 25.70],
            [-80.25, 25.56],
            [-80.45, 25.56],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'KC-05', name: 'KEY CHICAS SHOALS', color: '#FF4FA0' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.38, 25.42],
            [-80.38, 25.56],
            [-80.15, 25.56],
            [-80.15, 25.42],
            [-80.38, 25.42],
          ],
        ],
      },
    },
  ],
};
