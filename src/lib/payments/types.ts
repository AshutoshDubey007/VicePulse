import { SubscriptionPlanId, SubscriptionBillingCycle, PaymentProviderType, SubscriptionStatus, PaymentStatus } from '@/types';

export interface CreateOrderParams {
  planId: SubscriptionPlanId;
  billingCycle: SubscriptionBillingCycle;
  amount: number;
  currency: string;
  userId: string;
  userEmail: string;
  userName: string;
  expiresAt: Date;
}

export interface PaymentOrderResult {
  orderId: string;
  providerOrderId?: string;
  amount: number;
  currency: string;
  provider: PaymentProviderType;
  keyId?: string;
  qrCodeUrl?: string;
  qrCodeData?: string;
  upiIntentUrl?: string;
  expiresAt: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
  userId: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  orderId: string;
  paymentId: string;
  error?: string;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: string;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  status: PaymentStatus;
  paymentMethod?: string;
  refundId?: string;
  refundAmount?: number;
  raw: Record<string, unknown>;
}

export interface IPaymentProvider {
  name: PaymentProviderType;
  isConfigured(): boolean;
  isLive(): boolean;
  createUpiQrOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  parseWebhookPayload(payload: Record<string, unknown>): WebhookEventPayload;
  fetchOrderStatus?(orderId: string): Promise<{
    paid: boolean;
    paymentId?: string;
    amount?: number;
    status: string;
    paymentMethod?: string;
  }>;
}
