import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchJobDocument extends Document {
  jobId: string;
  trigger: 'scheduled' | 'manual' | 'webhook';
  jobType: 'recon_sweep' | 'query_expansion' | 'corroboration' | 'source_audit';
  status: 'running' | 'completed' | 'failed';
  currentStage: string;
  sourcesChecked: number;
  itemsIngested: number;
  discoveriesCreated: number;
  discoveriesUpdated: number;
  newsArticlesCreated: number;
  tokenUsage?: number;
  estimatedCostUSD?: number;
  durationMs?: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchJobSchema = new Schema<IResearchJobDocument>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    trigger: {
      type: String,
      enum: ['scheduled', 'manual', 'webhook'],
      default: 'manual',
    },
    jobType: {
      type: String,
      enum: ['recon_sweep', 'query_expansion', 'corroboration', 'source_audit'],
      default: 'recon_sweep',
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      default: 'running',
      index: true,
    },
    currentStage: { type: String, default: 'init' },
    sourcesChecked: { type: Number, default: 0 },
    itemsIngested: { type: Number, default: 0 },
    discoveriesCreated: { type: Number, default: 0 },
    discoveriesUpdated: { type: Number, default: 0 },
    newsArticlesCreated: { type: Number, default: 0 },
    tokenUsage: { type: Number, default: 0 },
    estimatedCostUSD: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

ResearchJobSchema.index({ startedAt: -1 });

export default mongoose.models.ResearchJob ||
  mongoose.model<IResearchJobDocument>('ResearchJob', ResearchJobSchema);
