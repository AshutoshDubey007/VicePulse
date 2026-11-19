import { NextRequest, NextResponse } from 'next/server';
import { getUserEntitlements } from '@/lib/payments/entitlements';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-1';

    const entitlements = await getUserEntitlements(userId);
    return NextResponse.json(entitlements);
  } catch (err: any) {
    console.error('[API Entitlements Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch user entitlements' }, { status: 500 });
  }
}
