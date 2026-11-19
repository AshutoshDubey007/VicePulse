import mongoose, { Schema, Document } from 'mongoose';
import type { GtaEntityType } from '@/types';

export interface IGtaEntityDocument extends Document {
  source: 'vice-city.app';
  externalId: string; // e.g. 'vehicle.airboat'
  type: GtaEntityType;
  slug: string;
  name: {
    en: string;
    fr?: string;
  };
  summary?: {
    en?: string;
    fr?: string;
  } | null;
  attributes: Record<string, any>;
  relations: Array<{
    id: string;
    type: string;
    role?: string;
  }>;
  reliability?: string;
  spoiler?: boolean;
  verifiedInGame?: boolean;
  sources: Array<{
    url: string;
    site?: string;
  }>;
  // User enrichment & linking (kept separate from source attributes)
  vicepulseEnrichment?: {
    notes?: string;
    relatedDiscoveryIds?: mongoose.Types.ObjectId[];
    featured?: boolean;
    tags?: string[];
  };
  syncStatus: 'synced' | 'pending' | 'deprecated';
  lastSyncedAt: Date;
  sourceUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GtaEntitySchema = new Schema<IGtaEntityDocument>(
  {
    source: { type: String, required: true, default: 'vice-city.app', index: true },
    externalId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'location',
        'business',
        'character',
        'manufacturer',
        'vehicle',
        'weapon',
        'activity',
        'radio-station',
        'trailer',
        'edition',
        'event',
      ],
      index: true,
    },
    slug: { type: String, required: true, index: true },
    name: {
      en: { type: String, required: true },
      fr: { type: String },
    },
    summary: {
      en: { type: String },
      fr: { type: String },
    },
    attributes: { type: Schema.Types.Mixed, default: {} },
    relations: [
      {
        id: { type: String },
        type: { type: String },
        role: { type: String },
      },
    ],
    reliability: { type: String, default: 'official' },
    spoiler: { type: Boolean, default: false },
    verifiedInGame: { type: Boolean, default: false },
    sources: [
      {
        url: { type: String },
        site: { type: String },
      },
    ],
    vicepulseEnrichment: {
      notes: { type: String },
      relatedDiscoveryIds: [{ type: Schema.Types.ObjectId, ref: 'Discovery' }],
      featured: { type: Boolean, default: false },
      tags: [{ type: String }],
    },
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'deprecated'],
      default: 'synced',
      index: true,
    },
    lastSyncedAt: { type: Date, default: Date.now },
    sourceUpdatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
GtaEntitySchema.index({ type: 1, slug: 1 }, { unique: true });
GtaEntitySchema.index({ type: 1, 'name.en': 1 });
GtaEntitySchema.index({ 'name.en': 'text', 'summary.en': 'text' });

export default mongoose.models.GtaEntity ||
  mongoose.model<IGtaEntityDocument>('GtaEntity', GtaEntitySchema);
