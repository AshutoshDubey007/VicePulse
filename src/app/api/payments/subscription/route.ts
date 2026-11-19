import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/service';
import { SUBSCRIPTION_PLANS, getPlanConfig } from '@/lib/payments/plans';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-1';

    const subscription = await paymentService.getSubscription(userId);
    const planConfig = subscription ? getPlanConfig(subscription.planId) : getPlanConfig('free');

    return NextResponse.json({
      subscription: subscription || {
        planId: 'free',
        status: 'active',
        billingCycle: 'monthly',
        features: planConfig?.features || [],
      },
      planConfig,
      allPlans: SUBSCRIPTION_PLANS,
      isPaymentsEnabled: paymentService.isPaymentsEnabled(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch subscription' }, { status: 500 });
  }
}
