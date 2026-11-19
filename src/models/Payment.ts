import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus, PaymentProviderType, SubscriptionPlanId, SubscriptionBillingCycle } from '@/types';

export interface IPaymentDocument extends Document {
  orderId: string;
  paymentId?: string;
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProviderType;
  status: PaymentStatus;
  planId: SubscriptionPlanId;
  billingCycle: SubscriptionBillingCycle;
  signatureVerified: boolean;
  paymentMethod?: string;
  receiptUrl?: string;
  failureReason?: string;
  webhookEventId?: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    provider: { type: String, enum: ['razorpay', 'stripe'], required: true, default: 'razorpay' },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    planId: { type: String, required: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    signatureVerified: { type: Boolean, default: false },
    paymentMethod: { type: String },
    receiptUrl: { type: String },
    failureReason: { type: String },
    webhookEventId: { type: String, index: true },
    refundId: { type: String, index: true },
    refundAmount: { type: Number },
    refundStatus: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user history queries & audit filters
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ provider: 1, status: 1 });

export default mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
