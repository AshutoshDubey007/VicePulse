import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import connectDB from '@/lib/mongodb';
import GtaEntity from '@/models/GtaEntity';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleClass = searchParams.get('class') || undefined;
    const search = searchParams.get('search') || undefined;
    const mode = searchParams.get('mode'); // 'spawns' | 'catalogue' | 'all'

    if (mode === 'catalogue') {
      await connectDB();
      const query: any = { type: 'vehicle' };
      if (search) {
        query.$or = [
          { 'name.en': { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } },
          { 'attributes.class.en': { $regex: search, $options: 'i' } },
          { 'attributes.manufacturer.en': { $regex: search, $options: 'i' } },
        ];
      }
      const catalogue = await GtaEntity.find(query).sort({ 'name.en': 1 }).lean();
      return NextResponse.json(catalogue);
    }

    if (mode === 'all') {
      await connectDB();
      const spawns = await store.getVehicles({ class: vehicleClass, search });
      const catalogue = await GtaEntity.find({ type: 'vehicle' }).lean();
      return NextResponse.json({ spawns, catalogue });
    }

    // Default: preserves existing contract returning rare spawn vehicles
    const vehicles = await store.getVehicles({ class: vehicleClass, search });
    return NextResponse.json(vehicles);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}
