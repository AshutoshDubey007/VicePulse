import mongoose, { Schema, Document } from 'mongoose';
import { SubscriptionPlanId, SubscriptionBillingCycle, SubscriptionStatus, PaymentProviderType } from '@/types';

export interface ISubscriptionDocument extends Document {
  userId: string;
  planId: SubscriptionPlanId;
  billingCycle: SubscriptionBillingCycle;
  status: SubscriptionStatus;
  provider: PaymentProviderType;
  providerSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    planId: {
      type: String,
      enum: ['free', 'scout_pro', 'syndicate_elite'],
      required: true,
      default: 'free',
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
      default: 'monthly',
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'cancelled', 'expired', 'trialing'],
      required: true,
      default: 'active',
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay', 'stripe'],
      required: true,
      default: 'razorpay',
    },
    providerSubscriptionId: { type: String },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    features: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

export default mongoose.models.Subscription || mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);
