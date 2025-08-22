import { Schema, model, Types, Document } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  creator: Types.ObjectId;
  category?: string;
  bannerSeed?: string;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, index: true },
    bannerSeed: { type: String },
  },
  { timestamps: true }
);

collectionSchema.index({ name: 'text', description: 'text' });

export const Collection = model<ICollection>('Collection', collectionSchema);
