import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/service';
import { getPlanConfig } from '@/lib/payments/plans';
import { store } from '@/lib/store';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createOrderSchema = z.object({
  planId: z.enum(['scout_pro', 'syndicate_elite']),
  billingCycle: z.enum(['monthly', 'yearly']),
  provider: z.enum(['razorpay', 'stripe']).optional().default('razorpay'),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!paymentService.isPaymentsEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payments are currently disabled on this server.',
          paymentsEnabled: false,
        },
        { status: 503 }
      );
    }

    const provider = paymentService.getProvider('razorpay');
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          gatewayConfigured: false,
          error:
            'Payment setup incomplete: Real Razorpay merchant keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) must be configured in environment variables to accept real payments.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    const targetUserId = validated.userId || 'usr-1';
    let user: any = await store.getUser(targetUserId);
    if (!user) {
      user = {
        id: targetUserId,
        username: 'Field Scout',
        email: 'scout@vicepulse.net',
        role: 'scout',
      };
    }

    const planConfig = getPlanConfig(validated.planId);
    if (!planConfig) {
      return NextResponse.json({ success: false, error: 'Invalid plan selected' }, { status: 400 });
    }

    const order = await paymentService.createSubscriptionOrder({
      planId: validated.planId,
      billingCycle: validated.billingCycle,
      user,
      provider: validated.provider,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      provider: order.provider,
      keyId: order.keyId,
      qrCodeUrl: order.qrCodeUrl,
      qrCodeData: order.qrCodeData,
      upiIntentUrl: order.upiIntentUrl,
      expiresAt: order.expiresAt,
      planId: validated.planId,
      planName: planConfig.name,
      billingCycle: validated.billingCycle,
      notes: order.notes,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[API create-order error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}
