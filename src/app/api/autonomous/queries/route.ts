import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ResearchQuery from '@/models/ResearchQuery';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const queries = await ResearchQuery.find().sort({ priority: 1, lastRunAt: -1 }).limit(100).lean();
    return NextResponse.json({ success: true, data: queries });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { query, category = 'all', priority = 'normal' } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Query text must be at least 3 characters' }, { status: 400 });
    }

    const doc = await ResearchQuery.create({
      query: query.trim(),
      category,
      priority,
      origin: 'community',
      enabled: true,
      relevanceScore: 90,
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Query ID is required' }, { status: 400 });
    }

    await ResearchQuery.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Query deleted successfully' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
