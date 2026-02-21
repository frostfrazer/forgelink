'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { CheckCircle, Loader2 } from 'lucide-react';

type ServerData = {
  id: string; slug: string; name: string; tagline: string;
  description: string; category: string; protocol: string;
  githubUrl: string | null; npmPackage: string | null;
  installCommand: string | null; tags: string[];
};

const CATEGORIES = ['Database','Communication','Development','Finance','Cloud','Analytics','AI & ML','Productivity'];
const PROTOCOLS = ['MCP','OpenAI','LangChain','AutoGPT','Custom API'];

export function EditForm({ server }: { server: ServerData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    tagline: server.tagline,
    description: server.description,
    category: server.category,
    protocol: server.protocol,
    githubUrl: server.githubUrl ?? '',
    npmPackage: server.npmPackage ?? '',
    installCommand: server.installCommand ?? '',
    tags: server.tags.join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch(`/api/listing/${server.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Save failed.'); return; }
      setSaved(true);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-5 pt-6">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" /> Saved successfully!
            </div>
          )}

          <div><Label>Tagline *</Label>
            <Input name="tagline" value={form.tagline} onChange={handleChange} placeholder="Connect AI agents to PostgreSQL" required />
            <p className="text-xs text-gray-400 mt-1">60 characters max</p>
          </div>

          <div><Label>Description *</Label>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={5} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><Label>Protocol</Label>
              <select name="protocol" value={form.protocol} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                {PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div><Label>Install Command</Label>
            <Input name="installCommand" value={form.installCommand} onChange={handleChange} placeholder="npm install @mcp/postgresql" />
          </div>

          <div><Label>GitHub URL</Label>
            <Input name="githubUrl" value={form.githubUrl} onChange={handleChange} placeholder="https://github.com/user/repo" type="url" />
          </div>

          <div><Label>NPM / PyPI Package</Label>
            <Input name="npmPackage" value={form.npmPackage} onChange={handleChange} placeholder="@mcp/postgresql" />
          </div>

          <div><Label>Tags</Label>
            <Input name="tags" value={form.tags} onChange={handleChange} placeholder="postgres, database, sql" />
            <p className="text-xs text-gray-400 mt-1">Comma-separated, e.g. "postgres, database, sql"</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
