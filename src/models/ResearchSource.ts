import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchSourceDocument extends Document {
  name: string;
  platform: 'reddit' | 'youtube' | 'rss' | 'community_forum' | 'rockstar_official' | 'web';
  url: string;
  feedUrl: string;
  enabled: boolean;
  checkIntervalMinutes: number;
  lastFetchedAt?: Date;
  itemsFoundTotal: number;
  reliabilityScore: number;
  errorCount: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchSourceSchema = new Schema<IResearchSourceDocument>(
  {
    name: { type: String, required: true },
    platform: { 
      type: String, 
      enum: ['reddit', 'youtube', 'rss', 'community_forum', 'rockstar_official', 'web'],
      required: true 
    },
    url: { type: String, required: true },
    feedUrl: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    checkIntervalMinutes: { type: Number, default: 180 },
    lastFetchedAt: { type: Date },
    itemsFoundTotal: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 4, min: 1, max: 5 },
    errorCount: { type: Number, default: 0 },
    lastError: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ResearchSource || 
  mongoose.model<IResearchSourceDocument>('ResearchSource', ResearchSourceSchema);
