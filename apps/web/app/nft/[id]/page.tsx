import Image from 'next/image';
import { fetchJSON } from '../../../lib/api';
import BuyButton from './BuyButton';

export default async function NFTDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await fetchJSON(`/nfts/${params.id}`, { cache: 'no-store' });
  const nft = data.nft;
  const history = data.history || [];
  const img =
    nft.imageUrl ||
    `${process.env.NEXT_PUBLIC_API_URL}/image/${encodeURIComponent(
      nft.imageSeed || nft.name
    )}.svg?size=1200`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="card p-2 overflow-hidden">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
          <Image src={img} alt={nft.name} fill className="object-cover" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="text-2xl md:text-3xl font-semibold">{nft.name}</h1>
          <div className="text-white/70 mt-2">{nft.description}</div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="tag">Owner: {nft.owner?.username || 'Unknown'}</div>
            <div className="tag">
              Creator: {nft.creator?.username || 'Unknown'}
            </div>
            {nft.collection && (
              <div className="tag">Collection: {nft.collection?.name}</div>
            )}
            {nft.onSale ? (
              <div className="tag bg-teal/20">On Sale</div>
            ) : (
              <div className="tag">Not for sale</div>
            )}
          </div>

          <div className="mt-5">
            <BuyButton
              id={nft._id}
              price={nft.price}
              ownerId={nft.owner?._id || nft.owner}
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">Attributes</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
            {nft.attributes?.map((a: any, i: number) => (
              <div key={i} className="glass rounded-xl p-3">
                <div className="text-xs text-white/60">{a.trait_type}</div>
                <div className="font-medium">{a.value}</div>
                {a.rarity && (
                  <div className="text-xs text-gold mt-1">{a.rarity}</div>
                )}
              </div>
            ))}
            {!nft.attributes?.length && (
              <div className="text-white/60 text-sm">No attributes</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-2">
            {history.map((h: any) => (
              <div
                key={h._id}
                className="flex items-center justify-between text-sm glass rounded-xl px-3 py-2"
              >
                <div className="text-white/80">{h.type.toUpperCase()}</div>
                <div className="text-white/60">
                  {new Date(h.createdAt).toLocaleString()}
                </div>
                <div className="text-white">
                  {h.price ? `${h.price} ETH` : '-'}
                </div>
              </div>
            ))}
            {!history.length && (
              <div className="text-white/60 text-sm">No history</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
