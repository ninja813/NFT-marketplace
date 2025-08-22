import { fetchJSON } from '../../../lib/api';
import Image from 'next/image';
import NFTCard from '../../../components/NFTCard';

export default async function CollectionDetail({
  params,
}: {
  params: { id: string };
}) {
  const data = await fetchJSON(`/collections/${params.id}`, {
    cache: 'no-store',
  });
  const c = data.collection;
  const banner = (c.bannerSeed || '').startsWith('http')
    ? c.bannerSeed
    : `${process.env.NEXT_PUBLIC_API_URL}/image/${encodeURIComponent(
        c.bannerSeed || c.name
      )}.svg?size=1200`;
  return (
    <div className="space-y-6">
      <div className="relative h-48 rounded-2xl overflow-hidden">
        <Image src={banner} alt={c.name} fill className="object-cover" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{c.name}</h1>
          <p className="text-white/70 mt-1">{c.description}</p>
        </div>
        <div className="tag shrink-0">Category: {c.category}</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.nfts?.map((nft: any) => (
          <NFTCard key={nft._id} nft={nft} />
        ))}
      </div>
    </div>
  );
}
