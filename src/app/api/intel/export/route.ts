import { NextRequest, NextResponse } from 'next/server';
import { hasProAccess } from '@/lib/payments/entitlements';
import { store } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-1';

    const isAuthorized = await hasProAccess(userId);

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: 'Forbidden: Direct GPX/GeoJSON export requires an active Leonida Syndicate Pro membership.',
          upgradeRequired: true,
          upgradeUrl: '/billing',
        },
        { status: 403 }
      );
    }

    const discoveries = await store.getDiscoveries({ limit: 100 });

    const geoJson = {
      type: 'FeatureCollection',
      metadata: {
        network: 'VicePulse Surveillance Matrix',
        exportedAt: new Date().toISOString(),
        totalFeatures: discoveries.items.length,
      },
      features: discoveries.items.map((d) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [d.coordinates.lng, d.coordinates.lat],
        },
        properties: {
          id: d.id,
          title: d.title,
          category: d.category,
          district: d.district,
          gridCode: d.coordinates.inGameGrid,
          verificationStatus: d.verificationStatus,
          confirmationsCount: d.confirmationsCount,
        },
      })),
    };

    return new NextResponse(JSON.stringify(geoJson, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="vicepulse_leonida_recon.geojson"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export error' }, { status: 500 });
  }
}
