'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import WalletConnectButton from '../../../components/WalletConnectButton';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="text-xl md:text-2xl font-semibold">Sign in</h1>
        <p className="text-white/70 mt-1">Welcome back to Spectra.</p>

        <div className="mt-4">
          <WalletConnectButton />
        </div>

        <div className="text-white/40 text-xs mt-2">or sign in with email</div>

        <form onSubmit={submit} className="mt-3 space-y-3">
          <input
            className="w-full"
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
            required
          />
          <input
            className="w-full"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
            required
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button className="btn btn-primary w-full" type="submit">
            Sign in
          </button>
        </form>
        <p className="text-sm text-white/60 mt-3">
          No account?{' '}
          <Link href="/auth/register" className="text-teal hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
