import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessingLogDocument extends Document {
  level: 'info' | 'warn' | 'error';
  phase: 'ingest' | 'extract' | 'resolve' | 'verify' | 'publish' | 'notify';
  message: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ProcessingLogSchema = new Schema<IProcessingLogDocument>(
  {
    level: {
      type: String,
      enum: ['info', 'warn', 'error'],
      default: 'info',
      index: true,
    },
    phase: {
      type: String,
      enum: ['ingest', 'extract', 'resolve', 'verify', 'publish', 'notify'],
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    sourceUrl: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ProcessingLogSchema.index({ createdAt: -1 });

export default mongoose.models.ProcessingLog ||
  mongoose.model<IProcessingLogDocument>('ProcessingLog', ProcessingLogSchema);
