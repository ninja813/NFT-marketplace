'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../../components/AuthProvider';

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, username, password);
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="text-xl md:text-2xl font-semibold">
          Create your account
        </h1>
        <p className="text-white/70 mt-1">Start collecting and minting.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
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
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-label="Username"
            required
          />
          <input
            className="w-full"
            placeholder="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
            required
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button className="btn btn-primary w-full" type="submit">
            Register
          </button>
        </form>
        <p className="text-sm text-white/60 mt-3">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
