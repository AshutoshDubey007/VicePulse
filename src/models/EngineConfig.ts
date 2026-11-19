import mongoose, { Schema, Document } from 'mongoose';

export interface IEngineConfigDocument extends Document {
  key: string; // 'global_engine_settings'
  researchEnginePaused: boolean;
  autoPublishEnabled: boolean;
  discoverySearchIntervalHours: number;
  redditMonitoringIntervalHours: number;
  queryExpansionIntervalHours: number;
  corroborationIntervalHours: number;
  apiSyncIntervalHours: number;
  newsSearchIntervalHours: number;
  lastApiSyncRun?: Date;
  lastNewsResearchRun?: Date;
  lastDiscoveryResearchRun?: Date;
  dailyBudgetCapUSD: number;
  totalTokensUsedToday: number;
  estimatedCostTodayUSD: number;
  lastBudgetResetDate: string;
  enabledConnectors: {
    youtube: boolean;
    reddit: boolean;
    rss: boolean;
    social: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EngineConfigSchema = new Schema<IEngineConfigDocument>(
  {
    key: { type: String, required: true, unique: true, default: 'global_engine_settings' },
    researchEnginePaused: { type: Boolean, default: false },
    autoPublishEnabled: { type: Boolean, default: true },
    discoverySearchIntervalHours: { type: Number, default: 3, min: 1, max: 24 },
    redditMonitoringIntervalHours: { type: Number, default: 4, min: 1, max: 24 },
    queryExpansionIntervalHours: { type: Number, default: 6, min: 1, max: 48 },
    corroborationIntervalHours: { type: Number, default: 12, min: 1, max: 72 },
    apiSyncIntervalHours: { type: Number, default: 12, min: 1, max: 48 },
    newsSearchIntervalHours: { type: Number, default: 2, min: 1, max: 24 },
    lastApiSyncRun: { type: Date },
    lastNewsResearchRun: { type: Date },
    lastDiscoveryResearchRun: { type: Date },
    dailyBudgetCapUSD: { type: Number, default: 5.0 },
    totalTokensUsedToday: { type: Number, default: 0 },
    estimatedCostTodayUSD: { type: Number, default: 0.0 },
    lastBudgetResetDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    enabledConnectors: {
      youtube: { type: Boolean, default: true },
      reddit: { type: Boolean, default: true },
      rss: { type: Boolean, default: true },
      social: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export async function getEngineConfig(): Promise<IEngineConfigDocument> {
  const existing = await (mongoose.models.EngineConfig || mongoose.model<IEngineConfigDocument>('EngineConfig', EngineConfigSchema)).findOne({ key: 'global_engine_settings' });
  if (existing) return existing;

  const Model = mongoose.models.EngineConfig || mongoose.model<IEngineConfigDocument>('EngineConfig', EngineConfigSchema);
  return Model.create({ key: 'global_engine_settings' });
}

export default mongoose.models.EngineConfig ||
  mongoose.model<IEngineConfigDocument>('EngineConfig', EngineConfigSchema);
