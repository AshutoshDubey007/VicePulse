import mongoose, { Schema, Document } from 'mongoose';
import { SourcePlatform, SourceStatus } from '@/types';

export interface ISourceDocument extends Document {
  originalUrl: string;
  platform: SourcePlatform;
  author: string;
  contentTitle: string;
  dateDiscovered: string;
  datePublished?: string;
  extractedDiscoveries: string[];
  status: SourceStatus;
  reliabilityNotes: string;
  reliabilityScore: number;
}

const SourceSchema = new Schema<ISourceDocument>(
  {
    originalUrl: { type: String, required: true },
    platform: { type: String, required: true },
    author: { type: String, required: true },
    contentTitle: { type: String, required: true },
    dateDiscovered: { type: String, required: true },
    datePublished: { type: String },
    extractedDiscoveries: [{ type: String }],
    status: {
      type: String,
      enum: ['new', 'processing', 'extracted', 'duplicate', 'needs_review', 'published', 'rejected'],
      default: 'new',
    },
    reliabilityNotes: { type: String, default: '' },
    reliabilityScore: { type: Number, default: 3, min: 1, max: 5 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Source || mongoose.model<ISourceDocument>('Source', SourceSchema);
