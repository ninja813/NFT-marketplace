import { Router } from 'express';
import dayjs from 'dayjs';
import { Transaction } from '../models/Transaction';
import { NFT } from '../models/NFT';
import { Collection } from '../models/Collection';

const router = Router();

router.get('/stats', async (_req, res) => {
  const since = dayjs().subtract(24, 'hour').toDate();

  const sales = await Transaction.aggregate([
    { $match: { type: 'sale', createdAt: { $gte: since } } },
    {
      $lookup: {
        from: 'nfts',
        localField: 'nft',
        foreignField: '_id',
        as: 'nft',
      },
    },
    { $unwind: '$nft' },
    {
      $group: {
        _id: '$nft.collection',
        volume: { $sum: '$price' },
        sales: { $sum: 1 },
      },
    },
    { $sort: { volume: -1 } },
    { $limit: 5 },
  ]);

  const topCollections = await Collection.find({
    _id: { $in: sales.map((s) => s._id).filter(Boolean) },
  }).lean();

  const trendingNfts = await NFT.find({ onSale: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  const featured = await NFT.find({}).sort({ createdAt: -1 }).limit(6).lean();

  res.json({
    timestamp: new Date(),
    totals: {
      sales24h: sales.reduce((a, b) => a + (b.sales || 0), 0),
      volume24h: sales.reduce((a, b) => a + (b.volume || 0), 0),
    },
    topCollections: sales.map((s) => ({
      collectionId: s._id,
      collection: topCollections.find(
        (c) => c._id.toString() === (s._id || '').toString()
      ),
      volume: s.volume,
      sales: s.sales,
    })),
    trendingNfts,
    featured,
  });
});

export default router;
