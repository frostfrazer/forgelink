'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Star, Download, Search, Database, Cloud, MessageSquare, Code2, BarChart2, DollarSign, Bot, Package, X, Tag } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Database':      <Database className="w-5 h-5 text-white" />,
  'Cloud':         <Cloud className="w-5 h-5 text-white" />,
  'Communication': <MessageSquare className="w-5 h-5 text-white" />,
  'Development':   <Code2 className="w-5 h-5 text-white" />,
  'Analytics':     <BarChart2 className="w-5 h-5 text-white" />,
  'Finance':       <DollarSign className="w-5 h-5 text-white" />,
  'AI & ML':       <Bot className="w-5 h-5 text-white" />,
  'Productivity':  <Package className="w-5 h-5 text-white" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Database':      'from-blue-500 to-blue-700',
  'Cloud':         'from-purple-500 to-purple-700',
  'Communication': 'from-green-500 to-green-700',
  'Development':   'from-gray-600 to-gray-800',
  'Analytics':     'from-orange-500 to-orange-700',
  'Finance':       'from-emerald-500 to-emerald-700',
  'AI & ML':       'from-pink-500 to-pink-700',
  'Productivity':  'from-yellow-500 to-yellow-700',
};

const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-emerald-100 text-emerald-700',
];
function tagColor(tag: string) {
  let h = 0; for (const c of tag) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return TAG_COLORS[h % TAG_COLORS.length];
}

type Server = {
  id: string; name: string; slug: string; tagline: string;
  description: string; category: string; protocol: string;
  ratingAvg: string | null; installCount: number | null;
  isVerified: boolean | null; tags?: string[];
};

const CATEGORIES = ['Database', 'Development', 'Communication', 'Productivity', 'Cloud', 'Finance', 'AI & ML', 'Analytics'];
const PROTOCOLS = ['all', 'MCP', 'OpenAI', 'LangChain', 'AutoGPT', 'Custom API'];

export function BrowseClient({
  servers,
  initialCategory = 'all',
  initialQuery = '',
  initialProtocol = 'all',
  initialTag = '',
}: {
  servers: Server[];
  initialCategory?: string;
  initialQuery?: string;
  initialProtocol?: string;
  initialTag?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedProtocol, setSelectedProtocol] = useState(initialProtocol);
  const [selectedTag, setSelectedTag] = useState(initialTag);

  const pushUrl = useCallback((q: string, cat: string, proto: string, tag: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat !== 'all') params.set('category', cat);
    if (proto !== 'all') params.set('protocol', proto);
    if (tag) params.set('tag', tag);
    const search = params.toString();
    router.replace(`${pathname}${search ? '?' + search : ''}`, { scroll: false });
  }, [router, pathname]);

  const handleSearch = (val: string) => { setSearchQuery(val); pushUrl(val, selectedCategory, selectedProtocol, selectedTag); };
  const handleCategory = (cat: string) => { const next = selectedCategory === cat ? 'all' : cat; setSelectedCategory(next); pushUrl(searchQuery, next, selectedProtocol, selectedTag); };
  const handleProtocol = (proto: string) => { setSelectedProtocol(proto); pushUrl(searchQuery, selectedCategory, proto, selectedTag); };
  const handleTag = (tag: string) => { const next = selectedTag === tag ? '' : tag; setSelectedTag(next); pushUrl(searchQuery, selectedCategory, selectedProtocol, next); };

  const clearAll = () => {
    setSearchQuery(''); setSelectedCategory('all'); setSelectedProtocol('all'); setSelectedTag('');
    router.replace(pathname, { scroll: false });
  };

  const categoryCounts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = servers.filter(s => s.category === cat).length;
    return acc;
  }, {});

  // Collect all unique tags across servers
  const allTags = Array.from(new Set(servers.flatMap(s => s.tags ?? []))).sort();

  const filteredServers = servers.filter(server => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      server.name.toLowerCase().includes(q) ||
      server.tagline.toLowerCase().includes(q) ||
      server.description.toLowerCase().includes(q) ||
      server.category.toLowerCase().includes(q) ||
      (server.tags ?? []).some(t => t.includes(q));
    const matchesCategory = selectedCategory === 'all' || server.category === selectedCategory;
    const matchesProtocol = selectedProtocol === 'all' || server.protocol === selectedProtocol;
    const matchesTag = !selectedTag || (server.tags ?? []).includes(selectedTag);
    return matchesSearch && matchesCategory && matchesProtocol && matchesTag;
  });

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedProtocol !== 'all' || selectedTag;

  return (
    <>
      {/* Category pills */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => handleCategory('all')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
            All
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{servers.length}</span>
          </button>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button key={cat} onClick={() => handleCategory(cat)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${active ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${CATEGORY_COLORS[cat]} flex items-center justify-center flex-shrink-0`}>{CATEGORY_ICONS[cat]}</span>
                {cat}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{categoryCounts[cat] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {/* Tag filter row */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-1"><Tag className="w-3 h-3" /> Tags:</span>
            {allTags.map(tag => (
              <button key={tag} onClick={() => handleTag(tag)} className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors border ${selectedTag === tag ? 'ring-2 ring-offset-1 ring-blue-400 ' + tagColor(tag) : tagColor(tag) + ' border-transparent hover:border-gray-300'}`}>
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Search + protocol */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input type="text" placeholder="Search integrations..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="pl-9 pr-9" />
            {searchQuery && (
              <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            )}
          </div>
          <select value={selectedProtocol} onChange={(e) => handleProtocol(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm">
            {PROTOCOLS.map(proto => <option key={proto} value={proto}>{proto === 'all' ? 'All Protocols' : proto}</option>)}
          </select>
          {hasActiveFilters && (
            <button onClick={clearAll} className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-md hover:border-red-300 hover:text-red-500 transition-colors bg-white">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-gray-500">
            Showing <strong>{filteredServers.length}</strong> of <strong>{servers.length}</strong>
            {selectedCategory !== 'all' && <> in <strong>{selectedCategory}</strong></>}
            {selectedTag && <> tagged <strong>#{selectedTag}</strong></>}
            {searchQuery && <> matching <strong>&quot;{searchQuery}&quot;</strong></>}
          </p>
          {hasActiveFilters && (
            <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2">
              Copy shareable link
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServers.map((server) => (
          <Link key={server.id} href={`/server/${server.slug}`}>
            <Card className="h-full hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[server.category] ?? 'from-blue-500 to-blue-700'} flex items-center justify-center`}>
                    {CATEGORY_ICONS[server.category] ?? <Code2 className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {server.isVerified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                    <Badge variant="outline" className="text-xs">{server.protocol}</Badge>
                  </div>
                </div>
                <CardTitle className="line-clamp-1 group-hover:text-blue-600 transition-colors">{server.name}</CardTitle>
                <CardDescription className="line-clamp-1">{server.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{server.description}</p>
                {(server.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(server.tags ?? []).slice(0, 4).map(tag => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag)}`}>#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{server.ratingAvg || '0.0'}</span>
                  <span className="flex items-center gap-1"><Download className="w-4 h-4" />{(server.installCount ?? 0).toLocaleString()}</span>
                  <Badge variant="outline" className="text-xs">{server.category}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredServers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg mb-1">No integrations found.</p>
          <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters.</p>
          <button onClick={clearAll} className="text-blue-600 hover:underline text-sm">Clear all filters</button>
        </div>
      )}
    </>
  );
}
