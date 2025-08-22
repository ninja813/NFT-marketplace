'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import WalletConnectButton from './WalletConnectButton';

export default function AuthControls() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  if (!user) {
    return (
      <>
        <WalletConnectButton size="sm" />
        <Link
          className="btn-ghost text-sm nav-link !bg-transparent hover:!bg-white/10"
          href="/auth/login"
        >
          Sign in
        </Link>
        <Link className="btn btn-primary text-sm" href="/auth/register">
          Register
        </Link>
      </>
    );
  }

  const displayName = user.username || user.email || 'Account';

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/10 transition border border-white/10"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/50 via-teal/40 to-gold/40 text-white/90 text-xs font-bold border border-white/10">
          {getInitials(displayName)}
        </span>
        <span className="hidden sm:inline text-sm md:text-base font-medium">
          {displayName}
        </span>
        <svg
          className={`h-4 w-4 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.24 3.83a.75.75 0 01-1.02 0l-4.24-3.83a.75.75 0 01.02-1.1z" />
        </svg>
      </button>

      {open && (
        <div className="menu" role="menu" aria-label="User menu">
          <div className="px-3 py-2">
            <div className="text-xs uppercase tracking-wide text-white/60">
              Signed in as
            </div>
            <div className="font-medium">{displayName}</div>
            {user.walletAddress && (
              <div className="text-xs text-white/50 mt-0.5">
                {short(user.walletAddress)}
              </div>
            )}
          </div>
          <div className="menu-sep" />
          <Link
            href="/profile"
            className="menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <div className="menu-sep" />
          <button
            className="menu-item text-red-300 hover:text-red-200 w-full"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('') || 'U'
  );
}
function short(a: string) {
  return a.slice(0, 6) + '…' + a.slice(-4);
}
