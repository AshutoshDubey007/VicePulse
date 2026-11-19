import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GtaDbLandmark from '@/models/GtaDbLandmark';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const enterable = searchParams.get('enterable');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 200, 1), 1000);

    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (enterable === 'true') {
      filter.isEnterable = true;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { realWorldName: { $regex: q, $options: 'i' } },
        { gtadbId: { $regex: `^${q}`, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    // Only return landmarks that have valid in-game coordinates
    filter['inGameCoordinates.x'] = { $exists: true, $ne: null };
    filter['inGameCoordinates.y'] = { $exists: true, $ne: null };

    const [landmarks, total] = await Promise.all([
      GtaDbLandmark.find(filter)
        .sort({ 'photos.inGame.url': -1, _id: 1 })
        .select({
          gtadbId: 1,
          name: 1,
          category: 1,
          tags: 1,
          inGameCoordinates: 1,
          mapCoordinates: 1,
          realWorldName: 1,
          realWorldCoordinates: 1,
          photos: 1,
          color: 1,
          isEnterable: 1,
          status: 1,
          attribution: 1,
        })
        .limit(limit)
        .lean(),
      GtaDbLandmark.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      total,
      count: landmarks.length,
      attribution: 'GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org',
      landmarks,
    });
  } catch (error: any) {
    console.error('[GTADB Landmarks API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch GTADB landmarks',
      },
      { status: 500 }
    );
  }
}
