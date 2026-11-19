import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || 'usr-1';

    const result = await paymentService.cancelSubscription(userId);
    if (!result.success) {
      return NextResponse.json({ error: 'No active subscription found to cancel.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
      message: 'Subscription marked to cancel at end of current billing period.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error cancelling subscription' }, { status: 500 });
  }
}
