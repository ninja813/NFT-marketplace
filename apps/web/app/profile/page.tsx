'use client';
import { useAuth } from '../../components/AuthProvider';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setBio(user?.bio || '');
  }, [user]);

  const save = async () => {
    setMessage('');
    setSaving(true);
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ bio }),
      });

      if (!res.ok) {
        let errorMsg = `Request failed: ${res.status}`;
        try {
          const data = await res.json();
          if (data?.error) errorMsg = data.error;
        } catch {}
        throw new Error(errorMsg);
      }

      await refresh();
      setMessage('Profile updated');
    } catch (e: any) {
      setMessage(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-6">
        <h1 className="text-xl md:text-2xl font-semibold">Your Profile</h1>
        <p className="text-white/70 mt-2">
          Please sign in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="card p-6">
        <h1 className="text-xl md:text-2xl font-semibold">Your Profile</h1>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4">
          <div className="flex items-start">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/50 via-teal/40 to-gold/40 text-white/90 text-lg font-bold border border-white/10">
              {getInitials(user.username || 'U')}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-white/60">Username</div>
              <div className="tag mt-1">{user.username}</div>
            </div>

            <div>
              <div className="text-sm text-white/60">Bio</div>
              <textarea
                className="w-full mt-1"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself to collectors..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-white/60 text-sm">
                Balance:{' '}
                <span className="text-white">
                  {user.balance?.toFixed?.(2) ?? user.balance} ETH
                </span>
              </div>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {message && (
              <div
                className={`text-sm ${
                  message.includes('failed') ? 'text-red-400' : 'text-teal'
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
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
