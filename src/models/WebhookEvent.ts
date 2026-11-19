import mongoose, { Schema, Document } from 'mongoose';

export type WebhookProcessingStatus = 'processed' | 'failed' | 'ignored';

export interface IWebhookEventDocument extends Document {
  provider: string;
  eventId: string;
  eventType: string;
  signatureVerified: boolean;
  processingStatus: WebhookProcessingStatus;
  receivedAt: Date;
  processedAt?: Date;
  payload: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEventDocument>(
  {
    provider: { type: String, required: true, default: 'razorpay', index: true },
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true, index: true },
    signatureVerified: { type: Boolean, required: true, default: false },
    processingStatus: {
      type: String,
      enum: ['processed', 'failed', 'ignored'],
      required: true,
      default: 'processed',
      index: true,
    },
    receivedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    payload: { type: Schema.Types.Mixed, required: true },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

WebhookEventSchema.index({ provider: 1, receivedAt: -1 });

export default mongoose.models.WebhookEvent ||
  mongoose.model<IWebhookEventDocument>('WebhookEvent', WebhookEventSchema);
