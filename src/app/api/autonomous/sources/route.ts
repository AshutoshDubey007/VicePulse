import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ResearchSource from '@/models/ResearchSource';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const sources = await ResearchSource.find().sort({ itemsFoundTotal: -1 }).lean();
    return NextResponse.json({ success: true, data: sources });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, enabled, checkIntervalMinutes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Source ID is required' }, { status: 400 });
    }

    const updated = await ResearchSource.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(typeof enabled === 'boolean' ? { enabled } : {}),
          ...(typeof checkIntervalMinutes === 'number' ? { checkIntervalMinutes } : {}),
        },
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
