'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// UI imports using relative paths as fallback
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Star, Download, Search, Database, Cloud, MessageSquare, Code2, BarChart2, DollarSign, Bot, Package } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Database':      <Database className="w-6 h-6 text-white" />,
  'Cloud':         <Cloud className="w-6 h-6 text-white" />,
  'Communication': <MessageSquare className="w-6 h-6 text-white" />,
  'Development':   <Code2 className="w-6 h-6 text-white" />,
  'Analytics':     <BarChart2 className="w-6 h-6 text-white" />,
  'Finance':       <DollarSign className="w-6 h-6 text-white" />,
  'AI & ML':       <Bot className="w-6 h-6 text-white" />,
  'Productivity':  <Package className="w-6 h-6 text-white" />,
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

type Server = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  protocol: string;
  ratingAvg: string | null;
  installCount: number | null;
  isVerified: boolean | null;
};

export function BrowseClient({ servers, initialCategory }: { servers: Server[]; initialCategory?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? 'all');
  const [selectedProtocol, setSelectedProtocol] = useState('all');

  const categories = ['all', 'Database', 'Communication', 'Development', 'Finance', 'Cloud', 'Analytics', 'AI & ML', 'Productivity'];
  const protocols = ['all', 'MCP', 'OpenAI', 'LangChain', 'AutoGPT', 'Custom API'];

  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || server.category === selectedCategory;
    const matchesProtocol = selectedProtocol === 'all' || server.protocol === selectedProtocol;
    return matchesSearch && matchesCategory && matchesProtocol;
  });

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            {protocols.map(proto => (
              <option key={proto} value={proto}>{proto === 'all' ? 'All Protocols' : proto}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-600">Showing {filteredServers.length} of {servers.length} integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServers.map((server) => (
          <Link key={server.id} href={`/server/${server.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[server.category] ?? 'from-blue-500 to-blue-700'} flex items-center justify-center`}>
                    {CATEGORY_ICONS[server.category] ?? <Code2 className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {server.isVerified && <Badge variant="secondary" className="text-xs">✓ Verified</Badge>}
                    <Badge variant="outline" className="text-xs">{server.protocol}</Badge>
                  </div>
                </div>
                <CardTitle className="line-clamp-1">{server.name}</CardTitle>
                <CardDescription className="line-clamp-1">{server.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{server.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{server.ratingAvg || '0.0'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{(server.installCount ?? 0).toLocaleString()}</span>
                  </div>
                  <Badge variant="outline">{server.category}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredServers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No integrations found matching your criteria.</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </>
  );
}
