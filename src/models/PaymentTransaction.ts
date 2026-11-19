import mongoose, { Schema, Document } from 'mongoose';

export type TransactionVerificationStatus = 'verified' | 'failed' | 'unverified';

export interface IPaymentTransactionDocument extends Document {
  transactionId: string;
  orderId: string;
  providerPaymentId: string;
  providerTransactionId?: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  verificationStatus: TransactionVerificationStatus;
  webhookEventId?: string;
  verifiedAt?: Date;
  rawResponse?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransactionDocument>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    providerPaymentId: { type: String, required: true, unique: true, index: true },
    providerTransactionId: { type: String, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    paymentMethod: { type: String, default: 'upi' },
    verificationStatus: {
      type: String,
      enum: ['verified', 'failed', 'unverified'],
      required: true,
      default: 'unverified',
      index: true,
    },
    webhookEventId: { type: String, index: true },
    verifiedAt: { type: Date },
    rawResponse: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

PaymentTransactionSchema.index({ orderId: 1, verificationStatus: 1 });

export default mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransactionDocument>('PaymentTransaction', PaymentTransactionSchema);
