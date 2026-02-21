'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Eye, Download, Star, TrendingUp, Shield, Zap,
  ExternalLink, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

type Server = {
  id: string; name: string; slug: string; tagline: string;
  category: string; status: string | null;
  viewCount: number; installCount: number;
  ratingAvg: string | null; ratingCount: number;
  isVerified: boolean; isFeatured: boolean;
  weeklyGrowth: number;
  tags: string[];
  createdAt: Date;
  featuredExpiresAt: Date | null;
};

function StatusBadge({ status }: { status: string | null }) {
  if (status === 'approved') return (
    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <CheckCircle className="w-3 h-3" /> Live
    </span>
  );
  if (status === 'pending') return (
    <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" /> Pending review
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" /> Rejected
    </span>
  );
}

function TierBadge({ isVerified, isFeatured }: { isVerified: boolean; isFeatured: boolean }) {
  if (isFeatured) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-full">
      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Featured
    </span>
  );
  if (isVerified) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
      <Shield className="w-3 h-3" /> Verified
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      <Zap className="w-3 h-3" /> Free
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardClient({ servers, userEmail }: { servers: Server[]; userEmail: string }) {
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get('error') === 'unauthorized';
  const approved = servers.filter(s => s.status === 'approved');
  const totalViews = servers.reduce((a, s) => a + (s.viewCount ?? 0), 0);
  const totalInstalls = servers.reduce((a, s) => a + (s.installCount ?? 0), 0);
  const totalWeeklyGrowth = servers.reduce((a, s) => a + (s.weeklyGrowth ?? 0), 0);
  const avgRating = approved.length
    ? (approved.reduce((a, s) => a + parseFloat(s.ratingAvg ?? '0'), 0) / approved.length).toFixed(1)
    : '—';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Unauthorized banner */}
      {isUnauthorized && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            Access denied — your account doesn't have admin privileges.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Dashboard</h1>
          <p className="text-gray-500 text-sm">{userEmail}</p>
        </div>
        <Link href="/submit">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Zap className="w-4 h-4" /> Submit new integration
          </Button>
        </Link>
      </div>

      {/* Top stats */}
      {servers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Eye} label="Total views" value={totalViews.toLocaleString()} color="bg-blue-100 text-blue-600" />
          <StatCard icon={Download} label="Total installs" value={totalInstalls.toLocaleString()} color="bg-purple-100 text-purple-600" />
          <StatCard icon={Star} label="Avg rating" value={avgRating} sub={`across ${approved.length} live listing${approved.length !== 1 ? 's' : ''}`} color="bg-yellow-100 text-yellow-600" />
          <StatCard icon={TrendingUp} label="Views this week" value={totalWeeklyGrowth >= 0 ? `+${totalWeeklyGrowth}` : totalWeeklyGrowth} color="bg-green-100 text-green-600" />
        </div>
      )}

      {/* Empty state */}
      {servers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No integrations yet</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
            Submit your first MCP server or AI integration to start tracking performance.
          </p>
          <Link href="/submit">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Submit an integration →</Button>
          </Link>
        </div>
      )}

      {/* Server cards */}
      {servers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your integrations ({servers.length})</h2>
          {servers.map(server => (
            <div key={server.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">

              {/* Top row */}
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{server.name}</h3>
                    <StatusBadge status={server.status} />
                    <TierBadge isVerified={server.isVerified} isFeatured={server.isFeatured} />
                  </div>
                  <p className="text-sm text-gray-500 truncate">{server.tagline}</p>
                </div>
                {server.status === 'approved' && (
                  <div className="flex gap-2 shrink-0">
                    {server.isFeatured && (
                      <Link href={`/dashboard/analytics/${server.slug}`}>
                        <Button size="sm" variant="outline" className="gap-1 shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                          <TrendingUp className="w-3.5 h-3.5" /> Analytics
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/edit/${server.slug}`}>
                      <Button size="sm" variant="outline" className="gap-1 shrink-0">
                        ✏️ Edit
                      </Button>
                    </Link>
                    <Link href={`/server/${server.slug}`} target="_blank">
                      <Button size="sm" variant="outline" className="gap-1 shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: Eye, label: 'Views', value: (server.viewCount ?? 0).toLocaleString() },
                  { icon: Download, label: 'Installs', value: (server.installCount ?? 0).toLocaleString() },
                  { icon: Star, label: 'Rating', value: `${server.ratingAvg ?? '0.0'} (${server.ratingCount})` },
                  {
                    icon: TrendingUp,
                    label: 'This week',
                    value: server.weeklyGrowth >= 0 ? `+${server.weeklyGrowth}` : `${server.weeklyGrowth}`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400">{label}</span>
                    </div>
                    <p className="text-base font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {/* Upgrade CTA if not featured */}
              {!server.isFeatured && server.status === 'approved' && (
                <div className={`rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap ${server.isVerified ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 shrink-0 ${server.isVerified ? 'text-yellow-600' : 'text-blue-600'}`} />
                    <p className="text-sm font-medium text-gray-800">
                      {server.isVerified
                        ? 'Upgrade to Featured — get homepage carousel + top browse placement'
                        : 'Get Verified — add a trust badge + priority in search results'}
                    </p>
                  </div>
                  <Link href={`/pricing?serverId=${server.slug}`}>
                    <Button size="sm" className={server.isVerified ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}>
                      {server.isVerified ? 'Go Featured →' : 'Get Verified →'}
                    </Button>
                  </Link>
                </div>
              )}

              {server.isFeatured && (
                <div className="rounded-xl p-3 bg-green-50 border border-green-200 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-sm text-green-800 font-medium">Featured listing active — homepage carousel + top of browse.</p>
                  </div>
                  {server.featuredExpiresAt && (() => {
                    const daysLeft = Math.ceil((new Date(server.featuredExpiresAt!).getTime() - Date.now()) / 86400000);
                    const urgent = daysLeft <= 7;
                    return (
                      <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${urgent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {daysLeft > 0 ? `${daysLeft}d left` : 'Expiring today'}
                        {urgent && (
                          <Link href={`/pricing?serverId=${server.slug}`} className="underline ml-1">Renew →</Link>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 mt-10">
        Missing a listing? Make sure you submitted with <strong>{userEmail}</strong> or claimed it with this email.{' '}
        <a href="mailto:support@forgelink.io" className="text-blue-500 hover:underline">Contact support</a>
      </p>

    </div>
  );
}
