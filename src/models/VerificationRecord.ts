import mongoose, { Schema, Document } from 'mongoose';
import { VerificationStatus } from '@/types';

export interface IVerificationRecordDocument extends Document {
  discoveryId: mongoose.Types.ObjectId;
  claimsCorroborated: string[];
  corroboratingSources: Array<{
    sourceUrl: string;
    platform: string;
    corroboratedAt: Date;
    reliabilityWeight: number;
  }>;
  statusAssigned: VerificationStatus;
  previousStatus: VerificationStatus;
  confidenceScore: number;
  reasoning: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationRecordSchema = new Schema<IVerificationRecordDocument>(
  {
    discoveryId: { type: Schema.Types.ObjectId, ref: 'Discovery', required: true, index: true },
    claimsCorroborated: [{ type: String }],
    corroboratingSources: [
      {
        sourceUrl: { type: String, required: true },
        platform: { type: String, required: true },
        corroboratedAt: { type: Date, default: Date.now },
        reliabilityWeight: { type: Number, default: 1 },
      },
    ],
    statusAssigned: {
      type: String,
      enum: ['unverified', 'reported', 'under_investigation', 'corroborated', 'community_verified', 'personally_verified', 'disputed'],
      default: 'corroborated',
    },
    previousStatus: {
      type: String,
      enum: ['unverified', 'reported', 'under_investigation', 'corroborated', 'community_verified', 'personally_verified', 'disputed'],
      default: 'unverified',
    },
    confidenceScore: { type: Number, default: 50 },
    reasoning: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.VerificationRecord ||
  mongoose.model<IVerificationRecordDocument>('VerificationRecord', VerificationRecordSchema);
