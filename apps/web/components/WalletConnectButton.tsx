'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function WalletConnectButton({
  size = 'md',
}: {
  size?: 'sm' | 'md';
}) {
  const { walletLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const cls =
    size === 'sm'
      ? 'px-3 py-2 rounded-xl text-sm'
      : 'px-4 py-2.5 rounded-2xl text-base';
  return (
    <button
      className={`inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white transition ${cls}`}
      onClick={async () => {
        try {
          setLoading(true);
          await walletLogin();
        } catch (e: any) {
          alert(e.message || 'Wallet connect failed');
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      aria-label="Connect wallet"
      title="Connect wallet"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        className="opacity-80"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7zm4-2a2 2 0 0 0-2 2v1h14V7a2 2 0 0 0-2-2H7zm12 6H5v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6zm-2 2h-3a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2z" />
      </svg>
      {loading ? 'Connecting…' : 'Connect'}
    </button>
  );
}
