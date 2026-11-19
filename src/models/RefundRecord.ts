import mongoose, { Schema, Document } from 'mongoose';

export type RefundStatus = 'pending' | 'processed' | 'failed';

export interface IRefundRecordDocument extends Document {
  refundId: string;
  paymentId: string;
  orderId?: string;
  userId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason?: string;
  provider: 'razorpay' | 'stripe';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const RefundRecordSchema = new Schema<IRefundRecordDocument>(
  {
    refundId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, required: true, index: true },
    orderId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'processed',
      index: true,
    },
    reason: { type: String },
    provider: { type: String, enum: ['razorpay', 'stripe'], default: 'razorpay' },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

RefundRecordSchema.index({ createdAt: -1 });

export default mongoose.models.RefundRecord || mongoose.model<IRefundRecordDocument>('RefundRecord', RefundRecordSchema);
