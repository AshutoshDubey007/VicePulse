import mongoose, { Schema, Document } from 'mongoose';
import { PaymentProviderType } from '@/types';

export interface IWebhookLogDocument extends Document {
  eventId: string;
  provider: PaymentProviderType;
  eventType: string;
  status: 'processed' | 'failed' | 'ignored';
  payload: Record<string, unknown>;
  error?: string;
  createdAt: Date;
}

const WebhookLogSchema = new Schema<IWebhookLogDocument>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, enum: ['razorpay', 'stripe'], required: true },
    eventType: { type: String, required: true, index: true },
    status: { type: String, enum: ['processed', 'failed', 'ignored'], required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

WebhookLogSchema.index({ provider: 1, createdAt: -1 });

export default mongoose.models.WebhookLog || mongoose.model<IWebhookLogDocument>('WebhookLog', WebhookLogSchema);
