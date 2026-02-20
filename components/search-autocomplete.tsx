'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Star, X } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Database':      'bg-blue-100 text-blue-700',
  'Cloud':         'bg-purple-100 text-purple-700',
  'Communication': 'bg-green-100 text-green-700',
  'Development':   'bg-gray-100 text-gray-700',
  'Analytics':     'bg-orange-100 text-orange-700',
  'Finance':       'bg-emerald-100 text-emerald-700',
  'AI & ML':       'bg-pink-100 text-pink-700',
  'Productivity':  'bg-yellow-100 text-yellow-700',
};

type Result = {
  id: string; name: string; slug: string;
  tagline: string; category: string;
  isVerified: boolean | null; ratingAvg: string | null;
  installCount: number | null;
};

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-800 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node) &&
          !inputRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || !results.length) {
      if (e.key === 'Enter' && query) {
        router.push(`/browse?q=${encodeURIComponent(query)}`);
        setOpen(false);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        router.push(`/server/${results[activeIdx].slug}`);
        setOpen(false); setQuery('');
      } else {
        router.push(`/browse?q=${encodeURIComponent(query)}`);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false); setActiveIdx(-1);
    }
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus(); };

  return (
    <div className="relative w-full max-w-sm">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length && setOpen(true)}
          placeholder="Search integrations..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-2.5 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {loading && (
          <div className="absolute right-8 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          {results.map((r, i) => (
            <Link
              key={r.id}
              href={`/server/${r.slug}`}
              onClick={() => { setOpen(false); setQuery(''); }}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${
                i === activeIdx ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {highlight(r.name, query)}
                  </span>
                  {r.isVerified && (
                    <span className="text-xs text-blue-600 font-medium shrink-0">✓</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_COLORS[r.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {r.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{r.tagline}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400 mt-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{r.ratingAvg}</span>
              </div>
            </Link>
          ))}

          {/* See all results footer */}
          <button
            onMouseDown={e => { e.preventDefault(); router.push(`/browse?q=${encodeURIComponent(query)}`); setOpen(false); }}
            className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-2.5 bg-gray-50 hover:bg-blue-50 transition-colors"
          >
            See all results for &quot;{query}&quot; →
          </button>
        </div>
      )}

      {/* No results */}
      {open && !loading && query.length >= 2 && results.length === 0 && (
        <div ref={dropdownRef} className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 px-4 py-3 text-sm text-gray-500">
          No results for &ldquo;{query}&rdquo; —{' '}
          <button
            onMouseDown={() => { router.push(`/browse?q=${encodeURIComponent(query)}`); setOpen(false); }}
            className="text-blue-600 hover:underline"
          >
            browse all →
          </button>
        </div>
      )}
    </div>
  );
}
