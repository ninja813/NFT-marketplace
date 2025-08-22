import { Schema, model, Types, Document } from 'mongoose';

export interface IAttribute {
  trait_type: string;
  value: string;
  rarity?: string;
}

export interface INFT extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  imageSeed?: string;
  creator: Types.ObjectId;
  owner: Types.ObjectId;
  collectionId?: Types.ObjectId;
  attributes: IAttribute[];
  price?: number;
  onSale: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attributeSchema = new Schema<IAttribute>(
  {
    trait_type: { type: String },
    value: { type: String },
    rarity: { type: String },
  },
  { _id: false }
);

const nftSchema = new Schema<INFT>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    imageUrl: { type: String },
    imageSeed: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection' },
    attributes: { type: [attributeSchema], default: [] },
    price: { type: Number },
    onSale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

nftSchema.index({ name: 'text', description: 'text' });
nftSchema.index({ onSale: 1, price: 1 });
nftSchema.index({ 'attributes.trait_type': 1, 'attributes.value': 1 });

export const NFT = model<INFT>('NFT', nftSchema);
