import { Schema, model, Types, Document } from 'mongoose';

export type TransactionType = 'mint' | 'sale' | 'transfer' | 'list';

export interface ITransaction extends Document {
  type: TransactionType;
  nft: Types.ObjectId;
  from?: Types.ObjectId;
  to?: Types.ObjectId;
  price?: number;
  createdAt: Date;
}

const txSchema = new Schema<ITransaction>(
  {
    type: { type: String, required: true },
    nft: {
      type: Schema.Types.ObjectId,
      ref: 'NFT',
      required: true,
      index: true,
    },
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    to: { type: Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

txSchema.index({ createdAt: -1 });

export const Transaction = model<ITransaction>('Transaction', txSchema);
