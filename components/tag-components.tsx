'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Tag } from 'lucide-react';

const TAG_COLORS = [
  'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'bg-purple-100 text-purple-700 hover:bg-purple-200',
  'bg-green-100 text-green-700 hover:bg-green-200',
  'bg-orange-100 text-orange-700 hover:bg-orange-200',
  'bg-pink-100 text-pink-700 hover:bg-pink-200',
  'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
];

function tagColor(tag: string) {
  let hash = 0;
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

// Read-only pills shown on server page
export function TagPills({ tags, linkable = true }: { tags: string[]; linkable?: boolean }) {
  const router = useRouter();
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => linkable && router.push(`/browse?tag=${encodeURIComponent(tag)}`)}
          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${tagColor(tag)} ${linkable ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Tag className="w-2.5 h-2.5" />
          {tag}
        </button>
      ))}
    </div>
  );
}

// Admin tag editor
export function TagEditor({ serverId }: { serverId: string }) {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/tags?serverId=${serverId}`)
      .then(r => r.json())
      .then(d => { setTags(d.tags ?? []); setLoading(false); });
  }, [serverId]);

  const addTag = async (raw: string) => {
    const tag = raw.toLowerCase().trim().replace(/[^a-z0-9-+#.]/g, '').slice(0, 30);
    if (!tag || tags.includes(tag)) { setInput(''); return; }
    setSaving(true);
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId, tag }),
    });
    const data = await res.json();
    if (data.ok) setTags(prev => [...prev, data.tag]);
    setInput('');
    setSaving(false);
  };

  const removeTag = async (tag: string) => {
    setSaving(true);
    await fetch('/api/tags', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId, tag }),
    });
    setTags(prev => prev.filter(t => t !== tag));
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  if (loading) return <div className="text-xs text-gray-400 py-2">Loading tags...</div>;

  return (
    <div className="space-y-3">
      {/* Current tags */}
      <div className="flex flex-wrap gap-2 min-h-[28px]">
        {tags.length === 0 && <span className="text-xs text-gray-400 italic">No tags yet</span>}
        {tags.map(tag => (
          <span key={tag} className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tagColor(tag)}`}>
            <Tag className="w-2.5 h-2.5" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              disabled={saving}
              className="ml-0.5 hover:opacity-70 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag (Enter or comma)"
          disabled={saving}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
        />
        <button
          onClick={() => addTag(input)}
          disabled={!input || saving}
          className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
      <p className="text-xs text-gray-400">Lowercase, letters/numbers/hyphens. Press Enter or comma to add.</p>
    </div>
  );
}
