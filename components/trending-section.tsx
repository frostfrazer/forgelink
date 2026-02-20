import Link from 'next/link';
import { TrendingUp, Star, ArrowRight } from 'lucide-react';

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

type TrendingServer = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  ratingAvg: string | null;
  isVerified: boolean | null;
  weeklyGrowth: number;
};

function TrendBadge({ growth }: { growth: number }) {
  if (growth === 0) return <span className="text-xs text-gray-400">New</span>;
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
      <TrendingUp className="w-3 h-3" />
      +{growth}
    </span>
  );
}

export function TrendingSection({ servers }: { servers: TrendingServer[] }) {
  if (!servers.length) return null;

  return (
    <section className="py-14 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Trending This Week</h2>
            </div>
            <p className="text-gray-500 text-sm">Most-viewed integrations in the last 7 days</p>
          </div>
          <Link href="/browse" className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700 text-sm">
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((server, i) => (
            <Link key={server.id} href={`/server/${server.slug}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-emerald-200 transition-all group flex gap-4 items-start">
                {/* Rank */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br ${
                  i === 0 ? 'from-yellow-400 to-orange-500' :
                  i === 1 ? 'from-gray-400 to-gray-600' :
                  i === 2 ? 'from-amber-600 to-amber-800' :
                  CATEGORY_COLORS[server.category] ?? 'from-blue-500 to-blue-700'
                }`}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors leading-tight truncate">
                      {server.name}
                    </h3>
                    <TrendBadge growth={server.weeklyGrowth} />
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{server.tagline}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {server.ratingAvg}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${CATEGORY_COLORS[server.category] ?? 'from-blue-500 to-blue-700'} text-white opacity-80`}>
                      {server.category}
                    </span>
                    {server.isVerified && <span className="text-blue-500 font-medium">✓</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
