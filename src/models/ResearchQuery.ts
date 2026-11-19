import mongoose, { Schema, Document } from 'mongoose';
import { Category } from '@/types';

export interface IResearchQueryDocument extends Document {
  query: string;
  category: Category | 'all';
  origin: 'initial' | 'ai_generated' | 'corroboration' | 'community';
  createdFrom?: string;
  priority: 'high' | 'normal' | 'low';
  frequencyHours: number;
  enabled: boolean;
  lastRunAt?: Date;
  itemsFoundCount: number;
  relevanceScore: number; // 0-100 score based on yielding relevant GTA discoveries
  createdAt: Date;
  updatedAt: Date;
}

const ResearchQuerySchema = new Schema<IResearchQueryDocument>(
  {
    query: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['hidden-location', 'rare-vehicle', 'easter-egg', 'encounter', 'unusual-event', 'wildlife', 'all'],
      default: 'all',
    },
    origin: {
      type: String,
      enum: ['initial', 'ai_generated', 'corroboration', 'community'],
      default: 'initial',
    },
    createdFrom: { type: String },
    priority: {
      type: String,
      enum: ['high', 'normal', 'low'],
      default: 'normal',
    },
    frequencyHours: { type: Number, default: 4 },
    enabled: { type: Boolean, default: true },
    lastRunAt: { type: Date },
    itemsFoundCount: { type: Number, default: 0 },
    relevanceScore: { type: Number, default: 85, min: 0, max: 100 },
  },
  {
    timestamps: true,
  }
);

ResearchQuerySchema.index({ priority: 1, lastRunAt: 1 });

export default mongoose.models.ResearchQuery ||
  mongoose.model<IResearchQueryDocument>('ResearchQuery', ResearchQuerySchema);
