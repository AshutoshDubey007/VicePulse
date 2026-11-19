import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { runViceCityApiSync } from '@/lib/viceCityApi/syncService';
import ApiSyncState, { getOrCreateSyncState } from '@/models/ApiSyncState';
import GtaEntity from '@/models/GtaEntity';
import GtaMapFeature from '@/models/GtaMapFeature';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const syncState = await getOrCreateSyncState();

    const collectionBreakdown: Record<string, number> = {};
    const types = [
      'location',
      'business',
      'character',
      'manufacturer',
      'vehicle',
      'weapon',
      'activity',
      'radio-station',
      'trailer',
      'edition',
      'event',
    ];

    for (const t of types) {
      collectionBreakdown[t] = await GtaEntity.countDocuments({ type: t });
    }

    const mapFeaturesCount = await GtaMapFeature.countDocuments();

    return NextResponse.json({
      success: true,
      service: syncState.service,
      status: syncState.status,
      plan: syncState.plan,
      lastSuccessfulSync: syncState.lastSuccessfulSync,
      nextScheduledSync: syncState.nextScheduledSync,
      totalApiRecords: await GtaEntity.countDocuments({ source: 'vice-city.app' }),
      mapFeaturesCount,
      collectionBreakdown,
      lastError: syncState.lastError,
      syncDurationMs: syncState.syncDurationMs,
      history: syncState.history?.slice(0, 5) || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    console.log('[API] Triggering manual vice-city.app API synchronization...');
    const report = await runViceCityApiSync();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
