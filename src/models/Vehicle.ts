import mongoose, { Schema, Document } from 'mongoose';
import { VerificationStatus } from '@/types';

export interface IVehicleDocument extends Document {
  name: string;
  modelName: string;
  vehicleClass: string;
  description: string;
  reportedLocation: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
    inGameGrid?: string;
  };
  spawnConditions: {
    time?: string;
    weather?: string;
    storyProgression?: string;
  };
  evidenceImage: string;
  verificationStatus: VerificationStatus;
  confirmationsCount: number;
  rarity: string;
  speedRating?: number;
  accelerationRating?: number;
  gtaEntityId?: mongoose.Types.ObjectId;
  apiSlug?: string;
  manufacturer?: string;
  realInspiration?: string;
}

const VehicleSchema = new Schema<IVehicleDocument>(
  {
    name: { type: String, required: true },
    modelName: { type: String, required: true },
    vehicleClass: { type: String, required: true },
    description: { type: String, required: true },
    reportedLocation: { type: String, required: true },
    district: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      inGameGrid: { type: String },
    },
    spawnConditions: {
      time: { type: String },
      weather: { type: String },
      storyProgression: { type: String },
    },
    evidenceImage: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'under_investigation', 'community_verified', 'personally_verified', 'disputed'],
      default: 'unverified',
    },
    confirmationsCount: { type: Number, default: 0 },
    rarity: { type: String, default: 'Rare' },
    speedRating: { type: Number },
    accelerationRating: { type: Number },
    gtaEntityId: { type: Schema.Types.ObjectId, ref: 'GtaEntity' },
    apiSlug: { type: String, index: true },
    manufacturer: { type: String },
    realInspiration: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Vehicle || mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema);
