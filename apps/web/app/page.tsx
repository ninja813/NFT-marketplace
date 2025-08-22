import Image from 'next/image';
import Link from 'next/link';
import { fetchJSON } from '../lib/api';
import LiveTicker from '../components/LiveTicker';
import NFTCard from '../components/NFTCard';

export default async function HomePage() {
  const stats = await fetchJSON('/market/stats', { next: { revalidate: 10 } });
  return (
    <div className="space-y-10">
      <Hero />
      <section className="glass rounded-2xl p-4 md:p-6">
        <LiveTicker />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Featured NFTs</h2>
          <Link href="/market" className="text-teal hover:underline">
            Explore all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.featured?.map((nft: any) => (
            <NFTCard key={nft._id} nft={nft} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          Trending Collections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.topCollections?.map((row: any) => {
            const src = (row.collection?.bannerSeed || '').startsWith('http')
              ? row.collection?.bannerSeed
              : `${process.env.NEXT_PUBLIC_API_URL}/image/${encodeURIComponent(
                  row.collection?.bannerSeed ||
                    row.collection?.name ||
                    'Collection'
                )}.svg?size=800`;
            return (
              <Link
                key={row.collectionId}
                className="card hover:scale-[1.01] transition group sheen"
                href={`/collections/${row.collectionId}`}
              >
                <div className="h-36 md:h-40 rounded-xl overflow-hidden relative">
                  <Image
                    src={src}
                    alt={row.collection?.name || 'Collection'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium group-hover:text-white">
                      {row.collection?.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {row.sales} sales • {row.volume?.toFixed(2)} ETH vol.
                    </div>
                  </div>
                  <span className="tag">Trending</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">Hot Listings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.trendingNfts?.map((nft: any) => (
            <NFTCard key={nft._id} nft={nft} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl p-6 md:p-10 glass">
      <div className="max-w-xl">
        <h1 className="hero-title">
          Discover, Mint & Collect Premium Digital Art
        </h1>
        <p className="hero-sub">
          Curated collections, real-time trends, and a seamless experience.
          Designed with luxurious gradients and glassmorphism.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/market" className="btn btn-primary">
            Explore Market
          </Link>
          <Link href="/create" className="btn btn-ghost">
            Create NFT
          </Link>
        </div>
      </div>
      <div className="absolute right-4 bottom-4 w-40 h-40 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br from-primary/30 via-teal/30 to-gold/30 blur-2xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal/20 blur-3xl" />
    </section>
  );
}
