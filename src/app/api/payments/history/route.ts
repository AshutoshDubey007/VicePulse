import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-1';

    const payments = await paymentService.getUserPayments(userId);
    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payment history' }, { status: 500 });
  }
}
