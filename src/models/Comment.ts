import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentDocument extends Document {
  discoveryId: string;
  username: string;
  userRole: string;
  avatar: string;
  content: string;
  isFieldScoutNote: boolean;
  evidenceUrl?: string;
  createdAt: Date;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    discoveryId: { type: String, required: true },
    username: { type: String, required: true },
    userRole: { type: String, default: 'scout' },
    avatar: { type: String, default: '' },
    content: { type: String, required: true },
    isFieldScoutNote: { type: Boolean, default: false },
    evidenceUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Comment || mongoose.model<ICommentDocument>('Comment', CommentSchema);
