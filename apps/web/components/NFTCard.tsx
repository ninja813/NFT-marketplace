'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

export default function NFTCard({ nft }: { nft: any }) {
  const img = useMemo(() => {
    return (
      nft.imageUrl ||
      `${process.env.NEXT_PUBLIC_API_URL}/image/${encodeURIComponent(
        nft.imageSeed || nft.name
      )}.svg?size=800`
    );
  }, [nft]);

  return (
    <Link
      href={`/nft/${nft._id}`}
      className="group card p-2 hover:scale-[1.01] transition tilt sheen"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden">
        <Image
          src={img}
          alt={nft.name}
          fill
          className="object-cover transition-transform group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="px-2 py-3">
        <div className="text-sm font-medium truncate">{nft.name}</div>
        <div className="flex items-center justify-between mt-1">
          {nft.onSale && nft.price ? (
            <div className="text-gold text-sm">{nft.price} ETH</div>
          ) : (
            <div className="text-white/60 text-xs">Not for sale</div>
          )}
          <div className="text-xs text-white/60">
            {nft.collection?.name || '--'}
          </div>
        </div>
      </div>
    </Link>
  );
}
