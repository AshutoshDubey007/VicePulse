import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const sources = await store.getSources({ platform, status, search });
    return NextResponse.json(sources);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.originalUrl || !body.contentTitle) {
      return NextResponse.json({ error: 'URL and content title are required' }, { status: 400 });
    }

    const created = await store.createSource(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create source record' }, { status: 500 });
  }
}
