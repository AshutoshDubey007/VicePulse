import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'discovery_status' | 'confirmation' | 'comment' | 'payment' | 'system';
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['discovery_status', 'confirmation', 'comment', 'payment', 'system'],
      required: true,
      index: true,
    },
    link: { type: String },
    read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);
