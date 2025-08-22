'use client';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';
import Image from 'next/image';
import Select from '../../components/Select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<any[]>([]);
  const [name, setName] = useState('My Spectra');
  const [description, setDescription] = useState('A new generative piece.');
  const [price, setPrice] = useState<string>('1.25');
  const [imageSeed, setImageSeed] = useState('My Spectra');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections`);
      const json = await res.json();
      setCollections(json.items || []);
    })();
  }, []);

  const collectionOptions = useMemo(
    () =>
      [{ label: 'No collection', value: '' }].concat(
        collections.map((c) => ({ label: c.name, value: c._id }))
      ),
    [collections]
  );

  if (!user) {
    return (
      <div className="card p-6">
        <h1 className="text-xl md:text-2xl font-semibold">Create / Mint NFT</h1>
        <p className="text-white/70 mt-2">Please sign in to mint your NFT.</p>
        <div className="mt-4 flex gap-2">
          <Link className="btn btn-primary" href="/auth/login">
            Sign in
          </Link>
          <Link className="btn btn-ghost" href="/auth/register">
            Register
          </Link>
        </div>
      </div>
    );
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    const res = await apiFetch('/upload', { method: 'POST', body: form });
    const data = await res.json();
    setImageUrl(`${process.env.NEXT_PUBLIC_API_URL}${data.url}`);
    setUploading(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      name,
      description,
      attributes: [],
      imageSeed,
      collectionId: collectionId || undefined,
    };
    if (price) payload.price = Number(price);
    if (imageUrl) {
      payload.imageUrl = imageUrl;
      payload.imageSeed = undefined;
    }
    const res = await apiFetch('/nfts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/nft/${data._id}`);
    } else {
      alert(data.error || 'Failed to mint');
    }
  }

  const preview =
    imageUrl ||
    `${process.env.NEXT_PUBLIC_API_URL}/image/${encodeURIComponent(
      imageSeed || name
    )}.svg?size=800`;

  return (
    <div className="max-w-4xl">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold">
            Create / Mint NFT
          </h1>
          <div className="text-sm text-white/60">Gasless test environment</div>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Name</label>
              <input
                className="w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Aurora #001"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                Description
              </label>
              <textarea
                className="w-full"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the story behind this piece..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                Collection
              </label>
              <Select
                className="w-full"
                value={collectionId}
                onChange={setCollectionId}
                options={collectionOptions}
                ariaLabel="Collection"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                List Price (ETH)
              </label>
              <input
                className="w-full"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
              />
              <p className="text-xs text-white/50 mt-1">
                You can list now and change it later.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-white/70">
                Upload image or use generated seed
              </div>
              <div className="flex items-center gap-3">
                <label className="btn btn-ghost cursor-pointer">
                  <input
                    type="file"
                    className="sr-only"
                    onChange={onUpload}
                    disabled={uploading}
                    accept="image/*"
                  />
                  {uploading ? 'Uploading…' : 'Choose file'}
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    className="text-sm text-white/70 hover:text-white underline"
                    onClick={() => setImageUrl('')}
                  >
                    Remove upload
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Image Seed
                </label>
                <input
                  className="w-full"
                  value={imageSeed}
                  onChange={(e) => setImageSeed(e.target.value)}
                  disabled={!!imageUrl}
                  placeholder="If no upload, a unique image will be generated"
                />
              </div>
            </div>

            <button
              className="btn btn-primary w-full mt-2"
              type="submit"
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Mint NFT'}
            </button>
          </div>

          <div className="space-y-2">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden glass">
              <Image src={preview} alt={name} fill className="object-cover" />
            </div>
            <div className="text-sm text-white/60">Preview</div>
          </div>
        </form>
      </div>
    </div>
  );
}
