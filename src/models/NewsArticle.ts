import mongoose, { Schema, Document } from 'mongoose';
import { NewsCategory } from '@/types';

export interface INewsArticleDocument extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  bannerImage: string;
  sources: Array<{
    title: string;
    url: string;
    platform: string;
    publishedAt?: string;
  }>;
  relatedDiscoveryIds?: mongoose.Types.ObjectId[];
  relatedCharacters?: string[];
  relatedVehicles?: string[];
  relatedLocations?: string[];
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  confidenceScore: number;
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsArticleSchema = new Schema<INewsArticleDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['official', 'community', 'leak', 'analysis'],
      required: true,
      index: true,
    },
    tags: [{ type: String }],
    bannerImage: { type: String, default: '/images/hero/vice-city-hero.webp' },
    sources: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        platform: { type: String, required: true },
        publishedAt: { type: String },
      },
    ],
    relatedDiscoveryIds: [{ type: Schema.Types.ObjectId, ref: 'Discovery' }],
    relatedCharacters: [{ type: String }],
    relatedVehicles: [{ type: String }],
    relatedLocations: [{ type: String }],
    author: {
      name: { type: String, default: 'VicePulse Recon AI' },
      role: { type: String, default: 'Autonomous Intelligence Engine' },
      avatar: { type: String, default: '/images/avatars/ai-recon.webp' },
    },
    confidenceScore: { type: Number, default: 90, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true,
    },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

NewsArticleSchema.index({ publishedAt: -1, status: 1 });
NewsArticleSchema.index({ category: 1, publishedAt: -1 });

export default mongoose.models.NewsArticle || 
  mongoose.model<INewsArticleDocument>('NewsArticle', NewsArticleSchema);
