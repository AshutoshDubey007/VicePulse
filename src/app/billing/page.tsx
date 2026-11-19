import React from 'react';
import { paymentService } from '@/lib/payments/service';
import { SUBSCRIPTION_PLANS } from '@/lib/payments/plans';
import { BillingClient } from './BillingClient';

export const revalidate = 0;

export default async function BillingPage() {
  const [subscription, paymentHistory] = await Promise.all([
    paymentService.getSubscription('usr-1'),
    paymentService.getUserPayments('usr-1'),
  ]);

  return (
    <BillingClient
      initialSubscription={subscription}
      plans={SUBSCRIPTION_PLANS}
      paymentHistory={paymentHistory}
      isPaymentsEnabled={paymentService.isPaymentsEnabled()}
    />
  );
}
