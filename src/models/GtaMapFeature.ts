import mongoose, { Schema, Document } from 'mongoose';

export interface IGtaMapFeatureDocument extends Document {
  layer: 'districts' | 'landmarks' | 'boundaries';
  featureId: string;
  source: 'vice-city.app' | 'gtadb.org';
  properties: {
    name?: string;
    slug?: string;
    kind?: string;
    region?: string;
    tag?: string;
    description?: string;
    color?: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon' | 'LineString';
    coordinates: any;
  };
  bbox?: number[];
  attribution: string;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GtaMapFeatureSchema = new Schema<IGtaMapFeatureDocument>(
  {
    layer: {
      type: String,
      required: true,
      enum: ['districts', 'landmarks', 'boundaries'],
      index: true,
    },
    featureId: { type: String, required: true, index: true },
    source: { type: String, default: 'vice-city.app' },
    properties: { type: Schema.Types.Mixed, default: {} },
    geometry: {
      type: {
        type: String,
        enum: ['Point', 'Polygon', 'MultiPolygon', 'LineString'],
        required: true,
      },
      coordinates: { type: Schema.Types.Mixed, required: true },
    },
    bbox: [{ type: Number }],
    attribution: {
      type: String,
      default: 'Map data © gtadb.org (CC BY 4.0) & vice-city.app',
    },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

GtaMapFeatureSchema.index({ layer: 1, featureId: 1 }, { unique: true });
GtaMapFeatureSchema.index({ layer: 1, 'properties.slug': 1 });

export default mongoose.models.GtaMapFeature ||
  mongoose.model<IGtaMapFeatureDocument>('GtaMapFeature', GtaMapFeatureSchema);
