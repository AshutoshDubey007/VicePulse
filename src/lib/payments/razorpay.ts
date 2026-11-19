import crypto from 'crypto';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';
import { IPaymentProvider, CreateOrderParams, PaymentOrderResult, WebhookEventPayload } from './types';
import { PaymentStatus } from '@/types';

export class RazorpayPaymentProvider implements IPaymentProvider {
  name: 'razorpay' = 'razorpay';
  private instance: Razorpay | null = null;
  private keyId: string | null = null;
  private keySecret: string | null = null;
  private webhookSecret: string | null = null;
  private merchantVpa: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || null;
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || null;
    this.merchantVpa = process.env.RAZORPAY_UPI_VPA || 'vicepulse@icici';

    if (
      this.keyId &&
      this.keySecret &&
      !this.keyId.startsWith('rzp_mock') &&
      !this.keyId.startsWith('rzp_test_placeholder')
    ) {
      try {
        this.instance = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
      } catch (err) {
        console.warn('[Razorpay] Initialization warning:', err);
      }
    }
  }

  isConfigured(): boolean {
    return Boolean(
      this.instance &&
      this.keyId &&
      this.keySecret &&
      !this.keyId.includes('placeholder') &&
      !this.keyId.includes('mock')
    );
  }

  isLive(): boolean {
    return Boolean(this.isConfigured() && this.keyId?.startsWith('rzp_live_'));
  }

  getMode(): 'live' | 'test' | 'unconfigured' {
    if (!this.isConfigured()) return 'unconfigured';
    if (this.keyId && this.keyId.startsWith('rzp_live_')) return 'live';
    return 'test';
  }

  getKeyId(): string {
    return this.keyId || '';
  }

  async createUpiQrOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    if (!this.isConfigured() || !this.instance) {
      throw new Error(
        'Payment provider credentials not configured. Please set real RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to generate live payment orders.'
      );
    }

    // Amount in Razorpay is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(params.amount * 100);
    const receipt = `vp_${params.planId}_${Date.now().toString(36)}`;
    const expiresAtTimestamp = Math.floor(params.expiresAt.getTime() / 1000);

    try {
      // 1. Create native Razorpay Order
      const order = await this.instance.orders.create({
        amount: amountInPaise,
        currency: params.currency || 'INR',
        receipt,
        notes: {
          userId: params.userId,
          planId: params.planId,
          billingCycle: params.billingCycle,
          userEmail: params.userEmail,
          userName: params.userName,
          expiresAt: params.expiresAt.toISOString(),
        },
      });

      // 2. Build standard compliant UPI intent URI
      // Form: upi://pay?pa=<vpa>&pn=VicePulse&am=<amount>&tr=<order_id>&cu=INR&tn=VicePulse_<planId>
      const upiString = `upi://pay?pa=${encodeURIComponent(this.merchantVpa)}&pn=${encodeURIComponent(
        'VicePulse Intel'
      )}&am=${params.amount.toFixed(2)}&tr=${encodeURIComponent(order.id)}&cu=INR&tn=${encodeURIComponent(
        `VP_${params.planId}`
      )}`;

      // 3. Try to create official Dynamic UPI QR code via Razorpay QR Code API
      let providerQrImageUrl: string | null = null;
      try {
        if ((this.instance as any).qrCode) {
          const qrResponse = await (this.instance as any).qrCode.create({
            type: 'upi_qr',
            name: 'VicePulse Intel',
            usage: 'single_use',
            fixed_amount: true,
            payment_amount: amountInPaise,
            description: `VicePulse ${params.planId} (${params.billingCycle})`,
            close_by: expiresAtTimestamp, // strictly 5 minutes!
            notes: {
              orderId: order.id,
              userId: params.userId,
              planId: params.planId,
              billingCycle: params.billingCycle,
            },
          });

          if (qrResponse?.image_url) {
            providerQrImageUrl = qrResponse.image_url;
          }
        }
      } catch (qrApiErr: any) {
        console.warn(
          '[Razorpay] qrCode.create endpoint not available or merchant QR permission pending. Falling back to dynamic UPI string QR generation:',
          qrApiErr.message
        );
      }

      // 4. Generate high-contrast crisp DataURL QR code (offline-capable, zero external CDN latency)
      const qrDataUrl = await QRCode.toDataURL(upiString, {
        width: 380,
        margin: 2,
        color: {
          dark: '#111114',
          light: '#F4F0E8',
        },
        errorCorrectionLevel: 'M',
      });

      return {
        orderId: order.id,
        providerOrderId: order.id,
        amount: params.amount,
        currency: params.currency || 'INR',
        provider: 'razorpay',
        keyId: this.keyId || undefined,
        qrCodeUrl: providerQrImageUrl || qrDataUrl,
        qrCodeData: qrDataUrl,
        upiIntentUrl: upiString,
        expiresAt: params.expiresAt.toISOString(),
        notes: {
          planId: params.planId,
          billingCycle: params.billingCycle,
        },
      };
    } catch (err: any) {
      console.error('[Razorpay Order Creation Failed]', err);
      throw new Error(err.error?.description || err.message || 'Razorpay order creation failed');
    }
  }

  // Cryptographic HMAC-SHA256 verification of Razorpay payment signature
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!signature || signature.trim() === '' || !this.keySecret) {
      return false;
    }

    try {
      const generated = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generated.length !== signature.length) {
        return false;
      }

      return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
    } catch (err) {
      console.error('[Razorpay Signature Verification Error]', err);
      return false;
    }
  }

  // Cryptographic HMAC-SHA256 verification of webhook payload
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature || signature.trim() === '' || !this.webhookSecret) {
      return false;
    }

    try {
      const generated = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (generated.length !== signature.length) {
        return false;
      }

      return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
    } catch (err) {
      console.error('[Razorpay Webhook Signature Verification Error]', err);
      return false;
    }
  }

  parseWebhookPayload(payload: Record<string, unknown>): WebhookEventPayload {
    const event = (payload.event as string) || 'unknown';
    const eventId = (payload.id as string) || (payload.event_id as string) || `wh_${Date.now()}`;
    const entity =
      (payload.payload as any)?.payment?.entity ||
      (payload.payload as any)?.order?.entity ||
      (payload.payload as any)?.refund?.entity ||
      {};

    let status: PaymentStatus = 'pending';
    if (event === 'payment.captured' || event === 'order.paid') {
      status = 'success';
    } else if (event === 'payment.failed') {
      status = 'failed';
    } else if (event === 'refund.created' || event === 'refund.processed') {
      status = 'refunded';
    } else if (event === 'subscription.cancelled') {
      status = 'cancelled';
    }

    const refundEntity = (payload.payload as any)?.refund?.entity;

    return {
      eventId,
      eventType: event,
      orderId: entity.order_id || refundEntity?.order_id,
      paymentId: entity.id || refundEntity?.payment_id,
      amount: entity.amount ? entity.amount / 100 : refundEntity?.amount ? refundEntity.amount / 100 : undefined,
      currency: entity.currency || refundEntity?.currency || 'INR',
      paymentMethod: entity.method || 'upi',
      refundId: refundEntity?.id,
      refundAmount: refundEntity?.amount ? refundEntity.amount / 100 : undefined,
      status,
      raw: payload,
    };
  }

  // Server-side fallback: Query Razorpay API directly for order payment status
  async fetchOrderStatus(orderId: string): Promise<{
    paid: boolean;
    paymentId?: string;
    amount?: number;
    status: string;
    paymentMethod?: string;
  }> {
    if (!this.instance) {
      return { paid: false, status: 'unconfigured' };
    }

    try {
      const payments = await this.instance.orders.fetchPayments(orderId);
      if (payments && Array.isArray(payments.items) && payments.items.length > 0) {
        // Look for captured payment
        const captured: any = payments.items.find((p: any) => p.status === 'captured');
        if (captured) {
          return {
            paid: true,
            paymentId: captured.id,
            amount: Number(captured.amount) / 100,
            status: 'success',
            paymentMethod: captured.method || 'upi',
          };
        }
        const last: any = payments.items[0];
        return {
          paid: false,
          paymentId: last.id,
          amount: Number(last.amount) / 100,
          status: last.status,
          paymentMethod: last.method,
        };
      }

      // Check order status directly
      const order: any = await this.instance.orders.fetch(orderId);
      if (order.status === 'paid') {
        return {
          paid: true,
          amount: order.amount_paid ? Number(order.amount_paid) / 100 : undefined,
          status: 'success',
        };
      }

      return {
        paid: false,
        status: order.status || 'created',
      };
    } catch (err: any) {
      console.warn('[Razorpay fetchOrderStatus Warning]', err.message);
      return { paid: false, status: 'unknown' };
    }
  }

  async processRefund(params: {
    paymentId: string;
    amount?: number;
    reason?: string;
  }): Promise<{ success: boolean; refundId: string; amount: number; error?: string }> {
    if (!this.instance) {
      return {
        success: false,
        refundId: '',
        amount: 0,
        error: 'Razorpay gateway not configured for live refunds',
      };
    }

    const amountInPaise = params.amount ? Math.round(params.amount * 100) : undefined;

    try {
      const refund = await this.instance.payments.refund(params.paymentId, {
        ...(amountInPaise ? { amount: amountInPaise } : {}),
        notes: {
          reason: params.reason || 'User requested refund via support',
        },
      });
      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount ? Number(refund.amount) / 100 : params.amount || 0,
      };
    } catch (err: any) {
      console.error('[Razorpay Refund Error]', err);
      return {
        success: false,
        refundId: '',
        amount: 0,
        error: err.error?.description || err.message || 'Refund processing failed',
      };
    }
  }
}
