import mongoose, { Schema, Document } from 'mongoose';

export type PaymentOrderStatus = 'pending' | 'success' | 'failed' | 'expired' | 'cancelled';

export interface IPaymentOrderDocument extends Document {
  orderId: string;
  userId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  provider: 'razorpay' | 'cashfree' | 'phonepe';
  providerOrderId?: string;
  qrCodeData?: string;
  qrCodeUrl?: string;
  status: PaymentOrderStatus;
  createdAt: Date;
  expiresAt: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  metadata?: Record<string, unknown>;
  updatedAt: Date;
}

const PaymentOrderSchema = new Schema<IPaymentOrderDocument>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    provider: { type: String, enum: ['razorpay', 'cashfree', 'phonepe'], required: true, default: 'razorpay' },
    providerOrderId: { type: String, index: true },
    qrCodeData: { type: String },
    qrCodeUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'expired', 'cancelled'],
      default: 'pending',
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    paidAt: { type: Date },
    cancelledAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user history & expiration reconciliation
PaymentOrderSchema.index({ userId: 1, createdAt: -1 });
PaymentOrderSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.models.PaymentOrder ||
  mongoose.model<IPaymentOrderDocument>('PaymentOrder', PaymentOrderSchema);
