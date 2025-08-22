'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  username: string;
  balance: number;
  bio?: string;
  walletAddress?: string;
};

type EthereumProvider = {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: any[] | object }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

const Ctx = createContext<{
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  walletLogin: () => Promise<void>;
}>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refresh: async () => {},
  walletLogin: async () => {},
});

function pickMetaMaskProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  const anyWin = window as any;
  const ethereum: EthereumProvider | undefined = anyWin.ethereum;

  if (!ethereum) return null;
  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    const metamask = ethereum.providers.find(
      (p: EthereumProvider) => p.isMetaMask
    );
    if (metamask) return metamask;
    return ethereum.providers[0];
  }
  return ethereum;
}

async function getMetaMask(): Promise<EthereumProvider | null> {
  const provider = pickMetaMaskProvider();
  return provider || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const refresh = async () => {
    try {
      const res = await apiFetch('/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
    }
    await refresh();
    router.push('/');
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Registration failed');
    }
    await refresh();
    router.push('/');
  };

  const logout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const walletLogin = async () => {
    const provider = await getMetaMask();

    if (!provider) {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const msg = isMobile
        ? 'MetaMask not detected. On mobile, open this site inside the MetaMask in-app browser.'
        : 'MetaMask not detected. Please install MetaMask for Chrome and reload.';
      throw new Error(msg);
    }

    let accounts: string[] = [];
    try {
      accounts = await provider.request({ method: 'eth_requestAccounts' });
    } catch (err: any) {
      if (err?.code === 4001)
        throw new Error('User rejected connection request');
      throw new Error(err?.message || 'Failed to request accounts');
    }

    const address = (accounts?.[0] || '').toLowerCase();
    if (!address) throw new Error('No account selected');

    let chainIdHex = '0x1';
    try {
      chainIdHex = await provider.request({ method: 'eth_chainId' });
    } catch {}
    const chainId = parseInt(chainIdHex, 16) || 1;

    const nonceRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/nonce?address=${address}`,
      { credentials: 'include' }
    );
    if (!nonceRes.ok) {
      const data = await nonceRes.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to get nonce');
    }
    const { message } = await nonceRes.json();

    let signature: string;
    try {
      signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      });
    } catch (err: any) {
      if (err?.code === 4001)
        throw new Error('User rejected signature request');
      throw new Error(err?.message || 'Failed to sign message');
    }

    const loginRes = await apiFetch('/auth/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature }),
    });
    if (!loginRes.ok) {
      const data = await loginRes.json().catch(() => ({}));
      throw new Error(data.error || 'Wallet login failed');
    }

    await refresh();
    router.push('/');
  };

  return (
    <Ctx.Provider
      value={{ user, login, register, logout, refresh, walletLogin }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
