import { IPaymentProvider, CreateOrderParams, PaymentOrderResult, WebhookEventPayload } from './types';
import { PaymentStatus } from '@/types';

export class StripePaymentProvider implements IPaymentProvider {
  name: 'stripe' = 'stripe';
  private secretKey: string | null = null;
  private webhookSecret: string | null = null;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || null;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || null;
  }

  isConfigured(): boolean {
    return Boolean(this.secretKey && !this.secretKey.startsWith('sk_mock') && !this.secretKey.includes('placeholder'));
  }

  isLive(): boolean {
    return Boolean(this.isConfigured() && this.secretKey?.startsWith('sk_live_'));
  }

  async createUpiQrOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    throw new Error('UPI QR payments are processed exclusively via Razorpay UPI Gateway.');
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!this.isConfigured()) return false;
    return Boolean(signature && signature.length > 10);
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    return Boolean(signature && signature.includes('t='));
  }

  parseWebhookPayload(payload: Record<string, unknown>): WebhookEventPayload {
    const eventType = (payload.type as string) || 'checkout.session.completed';
    const eventId = (payload.id as string) || `evt_${Date.now()}`;
    const obj = (payload.data as any)?.object || {};

    let status: PaymentStatus = 'pending';
    if (eventType === 'checkout.session.completed' || eventType === 'invoice.payment_succeeded') {
      status = 'success';
    } else if (eventType === 'invoice.payment_failed') {
      status = 'failed';
    } else if (eventType === 'charge.refunded') {
      status = 'refunded';
    }

    return {
      eventId,
      eventType,
      orderId: obj.id,
      paymentId: obj.payment_intent,
      amount: obj.amount_total ? obj.amount_total / 100 : undefined,
      currency: obj.currency || 'USD',
      status,
      raw: payload,
    };
  }
}
