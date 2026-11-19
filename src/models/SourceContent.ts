import mongoose, { Schema, Document } from 'mongoose';
import { SourcePlatform } from '@/types';

export interface ISourceContentDocument extends Document {
  url: string;
  canonicalUrl?: string;
  hash: string;
  title: string;
  platform: SourcePlatform;
  author: string;
  rawContent?: string;
  cleanText?: string;
  transcript?: string;
  transcriptStatus?: 'available' | 'unavailable' | 'pending';
  mediaUrls: string[];
  videoTimestamps?: Array<{ time: string; seconds: number; label: string }>;
  processingStatus: 'pending' | 'processed' | 'discarded' | 'failed';
  extractedDiscoveryId?: mongoose.Types.ObjectId;
  extractedNewsId?: mongoose.Types.ObjectId;
  error?: string;
  ingestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SourceContentSchema = new Schema<ISourceContentDocument>(
  {
    url: { type: String, required: true },
    canonicalUrl: { type: String },
    hash: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    platform: {
      type: String,
      enum: ['reddit', 'youtube', 'tiktok', 'instagram', 'discord', 'gaming-press', 'x-twitter'],
      required: true,
    },
    author: { type: String, default: 'Anonymous' },
    rawContent: { type: String },
    cleanText: { type: String },
    transcript: { type: String },
    transcriptStatus: {
      type: String,
      enum: ['available', 'unavailable', 'pending'],
      default: 'pending',
    },
    mediaUrls: { type: [String], default: [] },
    videoTimestamps: [
      {
        time: { type: String, required: true },
        seconds: { type: Number, required: true },
        label: { type: String, required: true },
      },
    ],
    processingStatus: {
      type: String,
      enum: ['pending', 'processed', 'discarded', 'failed'],
      default: 'pending',
      index: true,
    },
    extractedDiscoveryId: { type: Schema.Types.ObjectId, ref: 'Discovery' },
    extractedNewsId: { type: Schema.Types.ObjectId, ref: 'NewsArticle' },
    error: { type: String },
    ingestedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SourceContent ||
  mongoose.model<ISourceContentDocument>('SourceContent', SourceContentSchema);
