'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Eye, Download, Star, TrendingUp, MessageSquare, Calendar, Shield, Zap } from 'lucide-react';

type Review = {
  id: string; rating: number; comment: string | null;
  reviewerName: string | null; createdAt: string;
};

type Server = {
  id: string; name: string; slug: string; tagline: string; category: string;
  viewCount: number; installCount: number; ratingAvg: string; ratingCount: number;
  weeklyViewSnapshot: number; createdAt: Date; isVerified: boolean; isFeatured: boolean;
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 w-4 shrink-0">{star}</span>
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-gray-500 w-6 text-right shrink-0">{count}</span>
    </div>
  );
}

function MiniBarChart({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20 shrink-0 truncate">{d.name}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-8 text-right shrink-0">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function AnalyticsClient({ server, reviews, tags }: {
  server: Server; reviews: Review[]; tags: string[];
}) {
  const weeklyGrowth = server.viewCount - server.weeklyViewSnapshot;
  const conversionRate = server.viewCount > 0
    ? ((server.installCount / server.viewCount) * 100).toFixed(1)
    : '0.0';

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star, count: reviews.filter(r => r.rating === star).length,
  }));

  // Reviews grouped by week (last 8 weeks)
  const reviewsByWeek = useMemo(() => {
    const weeks: { name: string; value: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - i * 7);
      const end = new Date(); end.setDate(end.getDate() - (i - 1) * 7);
      const count = reviews.filter(r => {
        const d = new Date(r.createdAt);
        return d >= start && d < end;
      }).length;
      const label = i === 0 ? 'This wk' : i === 1 ? 'Last wk' : `${i}w ago`;
      weeks.push({ name: label, value: count });
    }
    return weeks;
  }, [reviews]);

  const daysSinceLaunch = Math.floor(
    (Date.now() - new Date(server.createdAt).getTime()) / 86400000
  );
  const avgDailyViews = daysSinceLaunch > 0
    ? (server.viewCount / daysSinceLaunch).toFixed(1)
    : server.viewCount;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">{server.name}</h1>
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Featured Analytics
            </span>
          </div>
          <p className="text-gray-500 text-sm">{server.tagline}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/edit/${server.slug}`}
            className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            ✏️ Edit listing
          </Link>
          <Link href={`/server/${server.slug}`} target="_blank"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            View listing →
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total views" value={server.viewCount.toLocaleString()} sub={`${avgDailyViews}/day avg`} color="bg-blue-100 text-blue-600" />
        <StatCard icon={Download} label="Total installs" value={server.installCount.toLocaleString()} sub={`${conversionRate}% conversion`} color="bg-purple-100 text-purple-600" />
        <StatCard icon={Star} label="Avg rating" value={server.ratingAvg} sub={`${server.ratingCount} reviews`} color="bg-yellow-100 text-yellow-600" />
        <StatCard icon={TrendingUp} label="Views this week" value={weeklyGrowth >= 0 ? `+${weeklyGrowth}` : weeklyGrowth} sub="vs last snapshot" color="bg-green-100 text-green-600" />
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={MessageSquare} label="Total reviews" value={reviews.length} sub={reviews.length > 0 ? `Last: ${timeAgo(reviews[0].createdAt)}` : 'No reviews yet'} color="bg-pink-100 text-pink-600" />
        <StatCard icon={Calendar} label="Days live" value={daysSinceLaunch} sub={`Since ${new Date(server.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`} color="bg-orange-100 text-orange-600" />
        <StatCard icon={Shield} label="Conversion rate" value={`${conversionRate}%`} sub="views → installs" color="bg-teal-100 text-teal-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Rating breakdown</CardTitle></CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-bold text-gray-900">{server.ratingAvg}</span>
                  <div className="pb-1">
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(parseFloat(server.ratingAvg)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">{reviews.length} reviews</span>
                  </div>
                </div>
                {ratingDist.map(d => <RatingBar key={d.star} star={d.star} count={d.count} total={reviews.length} />)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly review activity */}
        <Card>
          <CardHeader><CardTitle className="text-base">Review activity (8 weeks)</CardTitle></CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No reviews yet</p>
            ) : (
              <MiniBarChart data={reviewsByWeek} label="reviews" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent reviews</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {reviews.slice(0, 5).map(r => (
              <div key={r.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(r.reviewerName ?? 'A')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-gray-900">{r.reviewerName ?? 'Anonymous'}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
