import { Router } from 'express';
import { Collection } from '../models/Collection';
import { NFT } from '../models/NFT';
import { User } from '../models/User';

const router = Router();

router.get('/', async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 48);
  const q = (req.query.q as string) || '';
  const category = (req.query.category as string) || undefined;

  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;

  const [items, total] = await Promise.all([
    Collection.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Collection.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.get('/:id', async (req, res) => {
  const col = await Collection.findById(req.params.id).lean();
  if (!col) return res.status(404).json({ error: 'Not found' });
  const creator = await (col?.creator
    ? User.findById(col.creator).lean()
    : null);
  const nfts = await NFT.find({ collectionId: col._id })
    .sort({ createdAt: -1 })
    .limit(24)
    .lean();
  res.json({ collection: col, creator, nfts });
});

export default router;
