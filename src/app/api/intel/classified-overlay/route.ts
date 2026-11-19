import { NextRequest, NextResponse } from 'next/server';
import { hasProAccess } from '@/lib/payments/entitlements';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-1';

    const isAuthorized = await hasProAccess(userId);

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: 'Restricted Access: Classified satellite overlays require an active Leonida Syndicate Pro membership.',
          upgradeRequired: true,
          upgradeUrl: '/billing',
        },
        { status: 403 }
      );
    }

    // Pro-exclusive classified telemetry
    return NextResponse.json({
      accessGranted: true,
      clearanceLevel: 'LEVEL_4_SYNDICATE',
      satelliteLayers: [
        {
          id: 'sat-infrared-grassrivers',
          name: 'Grassrivers Infrared Thermal Density',
          type: 'heatmap',
          opacity: 0.75,
          activePointsCount: 42,
          sensorReadout: 'High bi-pedal acoustic signature near Ambrosia Sugar Mill',
        },
        {
          id: 'sat-maritime-submersibles',
          name: 'Biscayne / Keys Hydrophone Sonar Siphon',
          type: 'sonar_vector',
          opacity: 0.85,
          activePointsCount: 18,
          sensorReadout: 'Unmarked submersible acoustic cavitation at Waning Sands Grotto',
        },
      ],
      radarScanPeriodSeconds: 15,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing classified telemetry' }, { status: 500 });
  }
}
