import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/service';
import { RazorpayPaymentProvider } from '@/lib/payments/razorpay';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const [stats, payments, orders, subscriptions, webhooks] = await Promise.all([
      paymentService.getPaymentStats(),
      paymentService.getAllPayments(50),
      paymentService.getAllOrders(50),
      paymentService.getAllSubscriptions(50),
      paymentService.getWebhookLogs(50),
    ]);

    const provider = paymentService.getProvider('razorpay') as RazorpayPaymentProvider;

    return NextResponse.json({
      success: true,
      stats,
      payments,
      orders,
      subscriptions,
      webhooks,
      gatewayInfo: {
        provider: 'razorpay',
        mode: provider.getMode ? provider.getMode() : 'unconfigured',
        isConfigured: provider.isConfigured(),
        isLive: provider.isLive(),
        keyIdMasked: provider.getKeyId() ? provider.getKeyId().substring(0, 8) + '...' : 'Not configured',
        paymentsEnabled: paymentService.isPaymentsEnabled(),
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vicepulse.net'}/api/payments/webhook`,
      },
    });
  } catch (err: any) {
    console.error('[API Admin Payments GET Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch admin payment data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Process genuine gateway refund
    if (action === 'refund') {
      const { paymentId, amount, reason } = body;
      if (!paymentId) {
        return NextResponse.json({ error: 'Payment ID is required for refund' }, { status: 400 });
      }

      const result = await paymentService.processRefund({
        paymentId,
        amount: amount ? Number(amount) : undefined,
        reason: reason || 'Admin initiated refund',
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Refund failed' }, { status: 400 });
      }

      return NextResponse.json({ success: true, refundId: result.refundId });
    }

    // 2. Revoke Premium entitlement (legitimate admin security control)
    if (action === 'revoke') {
      const { userId, reason } = body;
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required to revoke access' }, { status: 400 });
      }

      const result = await paymentService.revokePremium(userId, reason || 'Administrative policy enforcement');
      return NextResponse.json({ success: result.success });
    }

    // 3. Reconcile pending order against provider transaction status
    if (action === 'reconcile') {
      const { orderId } = body;
      if (!orderId) {
        return NextResponse.json({ error: 'Order ID is required to reconcile' }, { status: 400 });
      }

      const statusResult = await paymentService.getOrderStatus(orderId);
      return NextResponse.json({ success: true, status: statusResult });
    }

    return NextResponse.json({ error: 'Invalid or unsupported admin action' }, { status: 400 });
  } catch (err: any) {
    console.error('[API Admin Payments POST Error]', err);
    return NextResponse.json({ error: err.message || 'Admin payment action failed' }, { status: 500 });
  }
}
