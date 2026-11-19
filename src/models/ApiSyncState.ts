import mongoose, { Schema, Document } from 'mongoose';

export interface IApiSyncStateDocument extends Document {
  service: 'vice-city.app';
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  plan: 'demo' | 'developer';
  lastSuccessfulSync?: Date;
  nextScheduledSync?: Date;
  totalApiRecords: number;
  importedRecords: number;
  updatedRecords: number;
  deprecatedRecords: number;
  collectionCounts: Record<string, number>;
  rateLimitLimit?: number;
  rateLimitRemaining?: number;
  lastError?: string;
  syncDurationMs?: number;
  history: Array<{
    startedAt: Date;
    completedAt?: Date;
    status: 'completed' | 'failed';
    recordsProcessed: number;
    error?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ApiSyncStateSchema = new Schema<IApiSyncStateDocument>(
  {
    service: { type: String, required: true, unique: true, default: 'vice-city.app' },
    status: {
      type: String,
      enum: ['idle', 'syncing', 'completed', 'failed'],
      default: 'idle',
      index: true,
    },
    plan: { type: String, enum: ['demo', 'developer'], default: 'demo' },
    lastSuccessfulSync: { type: Date },
    nextScheduledSync: { type: Date },
    totalApiRecords: { type: Number, default: 0 },
    importedRecords: { type: Number, default: 0 },
    updatedRecords: { type: Number, default: 0 },
    deprecatedRecords: { type: Number, default: 0 },
    collectionCounts: { type: Schema.Types.Mixed, default: {} },
    rateLimitLimit: { type: Number },
    rateLimitRemaining: { type: Number },
    lastError: { type: String },
    syncDurationMs: { type: Number },
    history: [
      {
        startedAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
        status: { type: String, enum: ['completed', 'failed'] },
        recordsProcessed: { type: Number, default: 0 },
        error: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export async function getOrCreateSyncState(): Promise<IApiSyncStateDocument> {
  const existing = await (
    mongoose.models.ApiSyncState ||
    mongoose.model<IApiSyncStateDocument>('ApiSyncState', ApiSyncStateSchema)
  ).findOne({ service: 'vice-city.app' });

  if (existing) return existing;

  const Model =
    mongoose.models.ApiSyncState ||
    mongoose.model<IApiSyncStateDocument>('ApiSyncState', ApiSyncStateSchema);
  return Model.create({ service: 'vice-city.app' });
}

export default mongoose.models.ApiSyncState ||
  mongoose.model<IApiSyncStateDocument>('ApiSyncState', ApiSyncStateSchema);
