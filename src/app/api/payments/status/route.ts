import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const userId = searchParams.get('userId') || undefined;

    if (!orderId || !orderId.trim()) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const result = await paymentService.getOrderStatus(orderId.trim(), userId);

    if (!result.found) {
      return NextResponse.json({ success: false, error: result.error || 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      orderId: result.orderId,
      amount: result.amount,
      currency: result.currency,
      planId: result.planId,
      expiresAt: result.expiresAt,
      secondsRemaining: result.secondsRemaining,
      qrCodeData: result.qrCodeData,
      qrCodeUrl: result.qrCodeUrl,
      paidAt: result.paidAt,
      error: result.error,
    });
  } catch (err: any) {
    console.error('[API payments/status error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check order status' },
      { status: 500 }
    );
  }
}
