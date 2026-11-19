import mongoose, { Schema, Document } from 'mongoose';
import { Category, VerificationStatus, SourcePlatform } from '@/types';

export interface IDiscoveryDocument extends Document {
  title: string;
  slug: string;
  category: Category;
  subcategory?: string;
  locationName: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
    inGameGrid?: string;
  };
  inGameCoordinates?: {
    x?: number;
    y?: number;
    z?: number;
  };
  coordinateProvenance?: {
    system?: string;
    originalCoords?: number[];
    source?: string;
    importedAt?: string;
  };
  description: string;
  stepsToFind: string[];
  inGameTime?: string;
  weather?: string;
  requirements?: string[];
  evidenceImages: Array<{
    url: string;
    caption?: string;
    type: string;
  }>;
  source: {
    platform: SourcePlatform;
    url: string;
    author: string;
    timestamp?: string;
  };
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  confirmationsCount: number;
  confirmedBy: string[];
  disputeCount: number;
  disputes: Array<{
    id: string;
    reason: string;
    reportedBy: string;
    createdAt: string;
  }>;
  tags: string[];
  relatedEntityIds?: mongoose.Types.ObjectId[];
  relatedVehicles?: string[];
  relatedCharacters?: string[];
  relatedLandmarks?: string[];
  submittedBy: {
    id: string;
    username: string;
    role: string;
    avatar: string;
  };
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscoverySchema = new Schema<IDiscoveryDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['hidden-location', 'rare-vehicle', 'easter-egg', 'encounter', 'unusual-event', 'wildlife'],
      required: true,
    },
    subcategory: { type: String },
    locationName: { type: String, required: true },
    district: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      inGameGrid: { type: String },
    },
    inGameCoordinates: {
      x: { type: Number },
      y: { type: Number },
      z: { type: Number },
    },
    coordinateProvenance: {
      system: { type: String },
      originalCoords: [{ type: Number }],
      source: { type: String },
      importedAt: { type: String },
    },
    description: { type: String, required: true },
    stepsToFind: [{ type: String }],
    inGameTime: { type: String },
    weather: { type: String },
    requirements: [{ type: String }],
    evidenceImages: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        type: { type: String, default: 'screenshot' },
      },
    ],
    source: {
      platform: { type: String, required: true },
      url: { type: String, required: true },
      author: { type: String, required: true },
      timestamp: { type: String },
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'reported', 'under_investigation', 'corroborated', 'community_verified', 'personally_verified', 'disputed'],
      default: 'unverified',
    },
    verificationReason: { type: String },
    confirmationsCount: { type: Number, default: 0 },
    confirmedBy: [{ type: String }],
    disputeCount: { type: Number, default: 0 },
    disputes: [
      {
        id: { type: String },
        reason: { type: String },
        reportedBy: { type: String },
        createdAt: { type: String },
      },
    ],
    tags: [{ type: String }],
    relatedEntityIds: [{ type: Schema.Types.ObjectId, ref: 'GtaEntity' }],
    relatedVehicles: [{ type: String }],
    relatedCharacters: [{ type: String }],
    relatedLandmarks: [{ type: String }],
    submittedBy: {
      id: { type: String, required: true },
      username: { type: String, required: true },
      role: { type: String, default: 'scout' },
      avatar: { type: String },
    },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Discovery || mongoose.model<IDiscoveryDocument>('Discovery', DiscoverySchema);
