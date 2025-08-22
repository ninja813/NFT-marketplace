import { connectDB } from '../db';
import { User } from '../models/User';
import { Collection } from '../models/Collection';
import { NFT } from '../models/NFT';
import { Transaction } from '../models/Transaction';

function img(id: number, size = 1200) {
  return `https://picsum.photos/id/${(id % 1000) + 1}/${size}/${size}`;
}

async function main() {
  const conn = await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Collection.deleteMany({}),
    NFT.deleteMany({}),
    Transaction.deleteMany({}),
  ]);

  const [alice, bob, charlie] = await User.create(
    [
      {
        email: 'alice@example.com',
        username: 'alice',
        passwordHash:
          '$2a$10$uM7p3nRWsxZ.ZKqXUSY1qOj0e7r1PMyAo4vu1cWJrd19IP5KgiVEa',
        balance: 500,
        avatarSeed: 'alice',
      },
      {
        email: 'bob@example.com',
        username: 'bob',
        passwordHash:
          '$2a$10$uM7p3nRWsxZ.ZKqXUSY1qOj0e7r1PMyAo4vu1cWJrd19IP5KgiVEa',
        balance: 200,
        avatarSeed: 'bob',
      },
      {
        email: 'charlie@example.com',
        username: 'charlie',
        passwordHash:
          '$2a$10$uM7p3nRWsxZ.ZKqXUSY1qOj0e7r1PMyAo4vu1cWJrd19IP5KgiVEa',
        balance: 300,
        avatarSeed: 'charlie',
      },
    ],
    { ordered: true }
  );

  const [col1, col2, col3] = await Collection.create([
    {
      name: 'Neon Dreams',
      description: 'Futuristic neon vibes',
      creator: alice._id,
      category: 'Art',
      bannerSeed: 'Neon Dreams',
    },
    {
      name: 'Aqua Echo',
      description: 'Fluid forms and teal tones',
      creator: bob._id,
      category: 'Photography',
      bannerSeed: 'Aqua Echo',
    },
    {
      name: 'Golden Hour',
      description: 'Warm gold accents and light',
      creator: charlie._id,
      category: 'Art',
      bannerSeed: 'Golden Hour',
    },
  ]);

  const owners = [alice, bob, charlie];
  const cols = [col1, col2, col3];

  const nfts = [];
  for (let i = 1; i <= 24; i++) {
    const owner = owners[i % owners.length];
    const creator = owners[(i + 1) % owners.length];
    const col = cols[i % cols.length];
    const price = Math.round((Math.random() * 4 + 0.5) * 100) / 100;
    const onSale = Math.random() > 0.4;
    const nft = await NFT.create({
      name: `Spectra #${i}`,
      description: 'Curated visual from open placeholder photography',
      imageSeed: `Spectra ${i}`,
      imageUrl: img(100 + i, 1200),
      creator: creator._id,
      owner: owner._id,
      collectionId: col._id,
      attributes: [
        {
          trait_type: 'Background',
          value: ['Purple', 'Teal', 'Gold'][i % 3],
          rarity: ['Common', 'Uncommon', 'Rare'][i % 3],
        },
        {
          trait_type: 'Aura',
          value: ['Soft', 'Vivid', 'Sharp'][i % 3],
          rarity: ['Common', 'Uncommon', 'Epic'][i % 3],
        },
        {
          trait_type: 'Element',
          value: ['Fire', 'Water', 'Air', 'Earth'][i % 4],
          rarity: ['Common', 'Uncommon', 'Rare', 'Legendary'][i % 4],
        },
      ],
      price: onSale ? price : undefined,
      onSale,
    });
    await Transaction.create({ type: 'mint', nft: nft._id, to: owner._id });
    nfts.push(nft);
  }

  const banners = [img(60, 1600), img(80, 1600), img(100, 1600)];
  await Collection.findByIdAndUpdate(col1._id, { bannerSeed: banners[0] });
  await Collection.findByIdAndUpdate(col2._id, { bannerSeed: banners[1] });
  await Collection.findByIdAndUpdate(col3._id, { bannerSeed: banners[2] });

  if (nfts[0].price) {
    await Transaction.create({
      type: 'sale',
      nft: nfts[0]._id,
      from: nfts[0].owner,
      to: alice._id,
      price: nfts[0].price,
    });
  }

  await conn.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
