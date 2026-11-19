import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationSettingsDocument extends Document {
  userId: string;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  discoveryUpdates: boolean;
  commentReplies: boolean;
  securityAndTransactional: boolean; // Always true
  unsubscribeToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingsSchema = new Schema<INotificationSettingsDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    marketingEmails: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
    discoveryUpdates: { type: Boolean, default: true },
    commentReplies: { type: Boolean, default: true },
    securityAndTransactional: { type: Boolean, default: true, immutable: true },
    unsubscribeToken: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.NotificationSettings || mongoose.model<INotificationSettingsDocument>('NotificationSettings', NotificationSettingsSchema);
