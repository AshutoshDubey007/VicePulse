import mongoose, { Schema, Document } from 'mongoose';

export type EntitlementStatus = 'active' | 'expired' | 'revoked' | 'cancelled';

export interface IPremiumEntitlementDocument extends Document {
  userId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  status: EntitlementStatus;
  startedAt: Date;
  expiresAt: Date;
  paymentOrderId: string;
  features: string[];
  revokedAt?: Date;
  revocationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PremiumEntitlementSchema = new Schema<IPremiumEntitlementDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    planId: { type: String, required: true, index: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true, default: 'monthly' },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked', 'cancelled'],
      required: true,
      default: 'active',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    paymentOrderId: { type: String, required: true, index: true },
    features: [{ type: String }],
    revokedAt: { type: Date },
    revocationReason: { type: String },
  },
  {
    timestamps: true,
  }
);

PremiumEntitlementSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.models.PremiumEntitlement ||
  mongoose.model<IPremiumEntitlementDocument>('PremiumEntitlement', PremiumEntitlementSchema);
