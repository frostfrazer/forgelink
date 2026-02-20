import { db } from '../../lib/db';
import { mcpServers, waitlist } from '../../lib/db/schema';
import { desc, sum, eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
  'Database':      'bg-blue-500',
  'Cloud':         'bg-purple-500',
  'Communication': 'bg-green-500',
  'Development':   'bg-gray-600',
  'Analytics':     'bg-orange-500',
  'Finance':       'bg-emerald-500',
  'AI & ML':       'bg-pink-500',
  'Productivity':  'bg-yellow-500',
};

async function getDashboardData() {
  const all = await db.select().from(mcpServers);
  const waitlistEntries = await db.select().from(waitlist);
  const approved = all.filter(s => s.status === 'approved');

  // Category breakdown
  const categoryMap: Record<string, { count: number; views: number; installs: number }> = {};
  for (const s of approved) {
    if (!categoryMap[s.category]) categoryMap[s.category] = { count: 0, views: 0, installs: 0 };
    categoryMap[s.category].count++;
    categoryMap[s.category].views += s.viewCount ?? 0;
    categoryMap[s.category].installs += s.installCount ?? 0;
  }
  const categories = Object.entries(categoryMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  // Top servers by views
  const topByViews = [...approved]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);

  // Top servers by installs
  const topByInstalls = [...approved]
    .sort((a, b) => (b.installCount ?? 0) - (a.installCount ?? 0))
    .slice(0, 5);

  // Totals
  const totalViews = approved.reduce((acc, s) => acc + (s.viewCount ?? 0), 0);
  const totalInstalls = approved.reduce((acc, s) => acc + (s.installCount ?? 0), 0);
  const totalRatings = approved.reduce((acc, s) => acc + (s.ratingCount ?? 0), 0);
  const avgRating = approved.length
    ? (approved.reduce((acc, s) => acc + parseFloat(s.ratingAvg ?? '0'), 0) / approved.length).toFixed(1)
    : '0.0';

  // Pending submissions
  const pending = all.filter(s => s.status === 'pending')
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  return {
    stats: {
      total: all.length,
      approved: approved.length,
      pending: pending.length,
      rejected: all.filter(s => s.status === 'rejected').length,
      verified: all.filter(s => s.isVerified).length,
      featured: all.filter(s => s.isFeatured).length,
      totalViews,
      totalInstalls,
      totalRatings,
      avgRating,
      waitlistCount: waitlistEntries.length,
    },
    categories,
    topByViews,
    topByInstalls,
    pending,
    allServers: all.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
  };
}

export default async function AdminPage() {
  const { stats, categories, topByViews, topByInstalls, pending, allServers } = await getDashboardData();

  const maxCategoryCount = Math.max(...categories.map(c => c.count), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">ForgeLink marketplace analytics</p>
          </div>
          <Link href="/browse">
            <Button variant="outline" size="sm">View Marketplace</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Listings', value: stats.total, color: 'text-gray-900' },
            { label: 'Approved', value: stats.approved, color: 'text-green-600' },
            { label: 'Pending Review', value: stats.pending, color: stats.pending > 0 ? 'text-yellow-600' : 'text-gray-400' },
            { label: 'Verified', value: stats.verified, color: 'text-blue-600' },
            { label: 'Featured', value: stats.featured, color: 'text-purple-600' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Engagement KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: '👁' },
            { label: 'Total Installs', value: stats.totalInstalls.toLocaleString(), icon: '⬇️' },
            { label: 'Total Reviews', value: stats.totalRatings.toLocaleString(), icon: '⭐' },
            { label: 'Avg Rating', value: stats.avgRating, icon: '📊' },
            { label: 'Waitlist', value: stats.waitlistCount.toLocaleString(), icon: '📧' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-gray-500 mb-1">{s.icon} {s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category breakdown + Top by views */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Category breakdown */}
          <Card>
            <CardHeader><CardTitle>Listings by Category</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {categories.map(cat => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{cat.name}</span>
                    <span className="text-gray-500">{cat.count} · {cat.views.toLocaleString()} views · {cat.installs.toLocaleString()} installs</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${CATEGORY_COLORS[cat.name] ?? 'bg-blue-500'}`}
                      style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top by views */}
          <Card>
            <CardHeader><CardTitle>Top 5 by Views</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topByViews.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/server/${s.slug}`} className="font-medium text-sm text-gray-900 hover:text-blue-600 truncate block">
                        {s.name}
                      </Link>
                      <p className="text-xs text-gray-500">{s.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{(s.viewCount ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top by installs */}
        <Card>
          <CardHeader><CardTitle>Top 5 by Installs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topByInstalls.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/server/${s.slug}`} className="font-medium text-gray-900 hover:text-blue-600 truncate block">
                      {s.name}
                    </Link>
                    <p className="text-xs text-gray-500">{s.category} · by {s.authorName}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>⬇️ {(s.installCount ?? 0).toLocaleString()}</span>
                    <span>👁 {(s.viewCount ?? 0).toLocaleString()}</span>
                    <span>⭐ {s.ratingAvg}</span>
                  </div>
                  <Link href={`/admin/server/${s.id}`}>
                    <Button size="sm" variant="outline">Edit</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending submissions */}
        {pending.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">
                Pending Review ({pending.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pending.map(s => (
                  <div key={s.id} className="bg-white border border-yellow-200 rounded-lg p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.category} · by {s.authorName} ({s.authorEmail})</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{s.tagline}</p>
                    </div>
                    <Link href={`/admin/server/${s.id}`}>
                      <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">Review</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All servers table */}
        <Card>
          <CardHeader>
            <CardTitle>All Listings ({allServers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allServers.map(server => (
                <div key={server.id} className="border rounded-lg p-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{server.name}</span>
                      <Badge variant={
                        server.status === 'approved' ? 'default' :
                        server.status === 'pending' ? 'secondary' : 'destructive'
                      } className="text-xs">
                        {server.status}
                      </Badge>
                      {server.isVerified && <Badge variant="outline" className="text-xs">Verified</Badge>}
                      {server.isFeatured && <Badge className="bg-purple-100 text-purple-700 text-xs">Featured</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>{server.category}</span>
                      <span>·</span>
                      <span>{server.authorName}</span>
                      <span>·</span>
                      <span>👁 {server.viewCount ?? 0}</span>
                      <span>·</span>
                      <span>⬇️ {server.installCount ?? 0}</span>
                      <span>·</span>
                      <span>⭐ {server.ratingAvg}</span>
                    </div>
                  </div>
                  <Link href={`/admin/server/${server.id}`}>
                    <Button size="sm" variant="outline">Edit</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
