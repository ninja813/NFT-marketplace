import { Router } from 'express';
import { NFT } from '../models/NFT';
import { User } from '../models/User';
import { Collection } from '../models/Collection';
import { Transaction } from '../models/Transaction';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.get('/', async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 48);
  const q = (req.query.q as string) || '';
  const category = (req.query.category as string) || undefined;
  const rarity = (req.query.rarity as string) || undefined;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const onSale =
    req.query.onSale !== undefined ? req.query.onSale === 'true' : undefined;
  const sort = (req.query.sort as string) || 'new';

  const filter: any = {};
  if (q) filter.$text = { $search: q };
  if (onSale !== undefined) filter.onSale = onSale;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  if (category) {
    const colls = await Collection.find({ category }).select('_id').lean();
    filter.collectionId = { $in: colls.map((c) => c._id) };
  }
  if (rarity) {
    filter['attributes.rarity'] = rarity;
  }

  const sortMap: any = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    new: { createdAt: -1 },
  };

  const cursor = NFT.find(filter)
    .populate('creator owner collectionId')
    .skip((page - 1) * limit)
    .limit(limit);
  const [items, total] = await Promise.all([
    cursor.sort(sortMap[sort] || sortMap['new']).lean(),
    NFT.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.get('/:id', async (req, res) => {
  const nft = await NFT.findById(req.params.id)
    .populate('creator owner collectionId')
    .lean();
  if (!nft) return res.status(404).json({ error: 'Not found' });

  const history = await Transaction.find({ nft: nft._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  res.json({ nft, history });
});

const MintSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  collectionId: z.string().optional(),
  price: z.number().optional(),
  attributes: z
    .array(
      z.object({
        trait_type: z.string(),
        value: z.string(),
        rarity: z.string().optional(),
      })
    )
    .optional(),
  imageSeed: z.string().optional(),
  imageUrl: z.string().optional(),
});

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const data = MintSchema.parse(req.body);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let collection = undefined;
    if (data.collectionId) {
      collection = await Collection.findById(data.collectionId);
    }

    const nft = await NFT.create({
      name: data.name,
      description: data.description,
      imageSeed: data.imageSeed || data.name,
      imageUrl: data.imageUrl,
      creator: user._id,
      owner: user._id,
      collectionId: collection?._id,
      attributes: data.attributes || [],
      price: data.price,
      onSale: Boolean(data.price),
    });

    await Transaction.create({
      type: 'mint',
      nft: nft._id,
      to: user._id,
    });

    res.status(201).json(nft);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Invalid input' });
  }
});

router.post('/:id/list', requireAuth, async (req: any, res) => {
  const price = Number(req.body.price);
  if (!price || price <= 0)
    return res.status(400).json({ error: 'Invalid price' });
  const nft = await NFT.findById(req.params.id);
  if (!nft) return res.status(404).json({ error: 'Not found' });
  if (nft.owner.toString() !== req.user.id)
    return res.status(403).json({ error: 'Not owner' });

  nft.price = price;
  nft.onSale = true;
  await nft.save();

  await Transaction.create({
    type: 'list',
    nft: nft._id,
    from: nft.owner,
    price,
  });
  res.json(nft);
});

router.post('/:id/buy', requireAuth, async (req: any, res) => {
  const buyer = await User.findById(req.user.id);
  const nft = await NFT.findById(req.params.id);
  if (!buyer || !nft) return res.status(404).json({ error: 'Not found' });
  if (!nft.onSale || !nft.price)
    return res.status(400).json({ error: 'NFT is not for sale' });
  if (buyer._id.toString() === nft.owner.toString())
    return res.status(400).json({ error: 'You own this NFT' });

  const seller = await User.findById(nft.owner);
  if (!seller) return res.status(400).json({ error: 'Seller missing' });

  if (buyer.balance < nft.price)
    return res.status(400).json({ error: 'Insufficient balance' });

  buyer.balance -= nft.price;
  seller.balance += nft.price;
  await buyer.save();
  await seller.save();

  nft.owner = buyer._id as typeof nft.owner;
  nft.onSale = false;
  await nft.save();

  await Transaction.create({
    type: 'sale',
    nft: nft._id,
    from: seller._id,
    to: buyer._id,
    price: nft.price,
  });

  res.json({ ok: true });
});

router.get('/:id/transactions', async (req, res) => {
  const items = await Transaction.find({ nft: req.params.id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(items);
});

export default router;
