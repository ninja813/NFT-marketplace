'use client';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../components/AuthProvider';
import { useState } from 'react';

export default function BuyButton({
  id,
  price,
  ownerId,
}: {
  id: string;
  price?: number;
  ownerId: string;
}) {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!price) return null;
  if (!user)
    return <div className="text-white/60 text-sm">Sign in to buy.</div>;
  if (user.id === ownerId)
    return <div className="text-white/60 text-sm">You own this NFT.</div>;

  const buy = async () => {
    setLoading(true);
    const res = await apiFetch(`/nfts/${id}/buy`, { method: 'POST' });
    setLoading(false);
    if (res.ok) {
      await refresh();
      window.location.reload();
    } else {
      const data = await res.json();
      alert(data.error || 'Purchase failed');
    }
  };

  return (
    <button disabled={loading} onClick={buy} className="btn btn-primary w-full">
      {loading ? 'Processing...' : `Buy for ${price} ETH`}
    </button>
  );
}
