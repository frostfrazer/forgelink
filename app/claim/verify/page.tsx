'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Nav } from '../../../components/nav';

type ServerData = {
  id: string; name: string; slug: string;
  tagline: string; description: string;
  githubUrl: string | null; npmPackage: string | null;
  installCommand: string | null;
};

export default function ClaimVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'saving' | 'saved'>('loading');
  const [error, setError] = useState('');
  const [server, setServer] = useState<ServerData | null>(null);
  const [form, setForm] = useState({ tagline: '', description: '', githubUrl: '', npmPackage: '', installCommand: '' });

  useEffect(() => {
    if (!token || !id) { setStatus('invalid'); setError('Invalid link.'); return; }
    fetch(`/api/claim/verify?token=${token}&id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setServer(data.server);
          setForm({
            tagline: data.server.tagline ?? '',
            description: data.server.description ?? '',
            githubUrl: data.server.githubUrl ?? '',
            npmPackage: data.server.npmPackage ?? '',
            installCommand: data.server.installCommand ?? '',
          });
          setStatus('valid');
        } else {
          setStatus('invalid');
          setError(data.error ?? 'This link is invalid or has expired.');
        }
      })
      .catch(() => { setStatus('invalid'); setError('Something went wrong.'); });
  }, [token, id]);

  const handleSave = async () => {
    setStatus('saving');
    const res = await fetch(`/api/claim/verify?token=${token}&id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setStatus('saved');
      setTimeout(() => router.push('/dashboard'), 2000);
    } else {
      setStatus('valid');
      setError(data.error ?? 'Save failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-2xl mx-auto px-4 py-16">
        {status === 'loading' && (
          <div className="text-center py-16 text-gray-500">Verifying your link...</div>
        )}

        {status === 'invalid' && (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {status === 'saved' && (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Claimed!</h1>
            <p className="text-gray-500">You now own this listing. Redirecting to your dashboard...</p>
          </div>
        )}

        {(status === 'valid' || status === 'saving') && server && (
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full mb-4">
                <span>✓</span> Verified — you own this listing
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Edit: {server.name}</h1>
              <p className="text-gray-500 text-sm mt-1">Update your listing details. Name and category changes require admin review.</p>
            </div>

            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NPM Package</label>
                <input
                  type="text"
                  value={form.npmPackage}
                  onChange={e => setForm(f => ({ ...f, npmPackage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Install Command</label>
                <input
                  type="text"
                  value={form.installCommand}
                  onChange={e => setForm(f => ({ ...f, installCommand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="npm install @your/package"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={status === 'saving'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {status === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => router.push(`/server/${server.slug}`)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2">
                <p className="text-sm font-semibold text-blue-800 mb-1">Want a Verified badge?</p>
                <p className="text-xs text-blue-700">Upgrade your listing to stand out with priority placement and a verified checkmark.</p>
                <a href="/pricing" className="text-xs text-blue-600 font-semibold hover:underline">View pricing →</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
