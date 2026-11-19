import mongoose, { Schema, Document } from 'mongoose';

export interface IGtaDbLandmarkPhoto {
  filename: string;
  url: string;
  width?: number;
  height?: number;
}

export interface IGtaDbLandmarkDocument extends Document {
  gtadbId: string;
  name: string;
  category: string;
  tags: string[];
  inGameCoordinates: {
    x: number;
    y: number;
    z?: number;
  } | null;
  mapCoordinates: {
    lng: number;
    lat: number;
  } | null;
  realWorldName?: string;
  realWorldCoordinates?: {
    lat: number;
    lng: number;
  } | null;
  photos: {
    inGame?: IGtaDbLandmarkPhoto | null;
    realWorld?: IGtaDbLandmarkPhoto | null;
  };
  color?: string;
  edited?: number[];
  attribution: string;
  isEnterable: boolean;
  status: 'confirmed' | 'unconfirmed' | 'unknown';
  createdAt: Date;
  updatedAt: Date;
}

const GtaDbLandmarkSchema = new Schema<IGtaDbLandmarkDocument>(
  {
    gtadbId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    inGameCoordinates: {
      x: { type: Number },
      y: { type: Number },
      z: { type: Number },
    },
    mapCoordinates: {
      lng: { type: Number, index: true },
      lat: { type: Number, index: true },
    },
    realWorldName: { type: String },
    realWorldCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    photos: {
      inGame: {
        filename: { type: String },
        url: { type: String },
        width: { type: Number },
        height: { type: Number },
      },
      realWorld: {
        filename: { type: String },
        url: { type: String },
        width: { type: Number },
        height: { type: Number },
      },
    },
    color: { type: String },
    edited: [{ type: Number }],
    attribution: {
      type: String,
      default: 'GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org',
    },
    isEnterable: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['confirmed', 'unconfirmed', 'unknown'],
      default: 'confirmed',
      index: true,
    },
  },
  {
    collection: 'gtadblandmarks',
    timestamps: true,
  }
);

GtaDbLandmarkSchema.index({ 'mapCoordinates.lng': 1, 'mapCoordinates.lat': 1 });
GtaDbLandmarkSchema.index({ category: 1, isEnterable: 1 });

export default mongoose.models.GtaDbLandmark ||
  mongoose.model<IGtaDbLandmarkDocument>('GtaDbLandmark', GtaDbLandmarkSchema);
