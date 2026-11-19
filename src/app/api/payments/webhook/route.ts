import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/service';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || request.headers.get('stripe-signature') || '';

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const provider = request.headers.get('x-razorpay-signature') ? 'razorpay' : 'stripe';

    const result = await paymentService.processWebhook(provider, rawBody, signature, payload);

    if (!result.handled) {
      return NextResponse.json(
        { error: result.error || 'Failed to process webhook event' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      received: true,
      eventType: result.eventType,
    });
  } catch (error: any) {
    console.error('[API Webhook Exception]', error);
    return NextResponse.json({ error: error.message || 'Webhook processing error' }, { status: 500 });
  }
}
