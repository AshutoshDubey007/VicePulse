import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    if (!body.reason || body.reason.trim().length < 5) {
      return NextResponse.json({ error: 'Please provide a clear reason for disputing this discovery.' }, { status: 400 });
    }

    const reportedBy = body.reportedBy || 'Scout_FieldInquirer';
    const result = await store.disputeDiscovery(params.id, body.reason, reportedBy);

    if (!result.success) {
      return NextResponse.json({ error: 'Discovery not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, disputeCount: result.disputeCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing dispute' }, { status: 500 });
  }
}
