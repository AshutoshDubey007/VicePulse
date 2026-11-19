import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = body.username || 'FieldScout_' + Math.floor(1000 + Math.random() * 9000);

    const result = await store.confirmDiscovery(params.id, username);
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to confirm discovery or not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing confirmation' }, { status: 500 });
  }
}
