import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discovery = await store.getDiscoveryById(params.id);
    if (!discovery) {
      return NextResponse.json({ error: 'Discovery dossier not found' }, { status: 404 });
    }
    return NextResponse.json(discovery);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await store.updateDiscovery(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Discovery not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update discovery' }, { status: 500 });
  }
}
