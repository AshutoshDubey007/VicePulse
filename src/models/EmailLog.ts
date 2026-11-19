import mongoose, { Schema, Document } from 'mongoose';

export type EmailDeliveryStatus = 'queued' | 'sending' | 'delivered' | 'failed';
export type EmailCategory = 'account' | 'discovery' | 'news' | 'payment' | 'community' | 'security' | 'transactional' | 'marketing';

export interface IEmailLogDocument extends Document {
  to: string;
  userId?: string;
  subject: string;
  templateName: string;
  category: EmailCategory;
  status: EmailDeliveryStatus;
  provider: string;
  providerMessageId?: string;
  idempotencyKey?: string;
  error?: string;
  retries: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLogDocument>(
  {
    to: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    subject: { type: String, required: true },
    templateName: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['account', 'discovery', 'news', 'payment', 'community', 'security', 'transactional', 'marketing'],
      default: 'transactional',
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sending', 'delivered', 'failed'],
      default: 'queued',
      index: true,
    },
    provider: { type: String, required: true, default: 'resend' },
    providerMessageId: { type: String, index: true },
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },
    error: { type: String },
    retries: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

EmailLogSchema.index({ createdAt: -1 });
EmailLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.EmailLog || mongoose.model<IEmailLogDocument>('EmailLog', EmailLogSchema);
