'use client';
import useSWR from 'swr';
import { fetcher } from '../../lib/api';
import NFTCard from '../../components/NFTCard';
import { useMemo, useState } from 'react';
import Select from '../../components/Select';
import Toggle from '../../components/Toggle';

export default function MarketPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [rarity, setRarity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onSale, setOnSale] = useState(true);
  const [sort, setSort] = useState('new');

  const query = new URLSearchParams({
    q,
    category,
    rarity,
    minPrice,
    maxPrice,
    onSale: String(onSale),
    sort,
  });

  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/nfts?${query.toString()}`,
    fetcher
  );

  const categoryOptions = useMemo(
    () => [
      { label: 'All Categories', value: '' },
      { label: 'Art', value: 'Art' },
      { label: 'Photography', value: 'Photography' },
      { label: 'Gaming', value: 'Gaming' },
      { label: 'Music', value: 'Music' },
    ],
    []
  );

  const rarityOptions = useMemo(
    () => [
      { label: 'Any Rarity', value: '' },
      { label: 'Common', value: 'Common' },
      { label: 'Uncommon', value: 'Uncommon' },
      { label: 'Rare', value: 'Rare' },
      { label: 'Epic', value: 'Epic' },
      { label: 'Legendary', value: 'Legendary' },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { label: 'Newest', value: 'new' },
      { label: 'Price ↑', value: 'price_asc' },
      { label: 'Price ↓', value: 'price_desc' },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="card p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-semibold">Market</h1>
          <div className="hidden md:block text-sm text-white/60">
            Browse curated digital assets
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-12 gap-3">
          <input
            className="col-span-2 md:col-span-4"
            placeholder="Search NFTs"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search NFTs"
          />

          <Select
            className="col-span-1 md:col-span-2"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            ariaLabel="Category"
          />

          <Select
            className="col-span-1 md:col-span-2"
            value={rarity}
            onChange={setRarity}
            options={rarityOptions}
            ariaLabel="Rarity"
          />

          <div className="col-span-2 md:col-span-3 glass rounded-2xl border border-white/10 p-2.5 flex items-center gap-2">
            <div className="flex-1">
              <input
                className="w-full bg-transparent border-0 focus:ring-0 px-2 py-1"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                inputMode="decimal"
                aria-label="Minimum price"
              />
            </div>
            <div className="text-white/30">--</div>
            <div className="flex-1">
              <input
                className="w-full bg-transparent border-0 focus:ring-0 px-2 py-1"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                inputMode="decimal"
                aria-label="Maximum price"
              />
            </div>
            <div className="ml-2 text-xs text-white/50">ETH</div>
          </div>

          <div className="col-span-1 md:col-span-1 flex items-center">
            <Toggle
              checked={onSale}
              onChange={setOnSale}
              label="On sale"
              id="sale"
            />
          </div>

          <Select
            className="col-span-1 md:col-span-2"
            value={sort}
            onChange={setSort}
            options={sortOptions}
            ariaLabel="Sort"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {data?.items?.map((nft: any) => (
          <NFTCard key={nft._id} nft={nft} />
        ))}
        {!data?.items?.length && (
          <div className="col-span-full glass rounded-2xl p-6 text-center text-white/70">
            No items found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}
