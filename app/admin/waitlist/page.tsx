import { db } from '../../../lib/db';
import { waitlist } from '../../../lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { WaitlistActions } from './actions';

async function getWaitlist() {
  return db.select().from(waitlist).orderBy(desc(waitlist.createdAt));
}

function formatDate(d: Date | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));
}

const SOURCE_COLORS: Record<string, string> = {
  'homepage-footer':  'bg-blue-100 text-blue-700',
  'homepage':         'bg-green-100 text-green-700',
  'browse':           'bg-purple-100 text-purple-700',
  'pricing':          'bg-orange-100 text-orange-700',
};

export default async function WaitlistAdminPage() {
  const entries = await getWaitlist();

  // Group by source
  const bySource: Record<string, number> = {};
  for (const e of entries) {
    const src = e.source ?? 'unknown';
    bySource[src] = (bySource[src] ?? 0) + 1;
  }

  // Group by day (last 7 days)
  const now = Date.now();
  const last7 = entries.filter(e => e.createdAt && now - new Date(e.createdAt).getTime() < 7 * 86400000).length;
  const last30 = entries.filter(e => e.createdAt && now - new Date(e.createdAt).getTime() < 30 * 86400000).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Waitlist</h1>
              <p className="text-gray-500 text-sm">{entries.length} total signups</p>
            </div>
          </div>
          <WaitlistActions total={entries.length} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: entries.length, color: 'text-gray-900' },
            { label: 'Last 7 days', value: last7, color: 'text-blue-600' },
            { label: 'Last 30 days', value: last30, color: 'text-green-600' },
            { label: 'Sources', value: Object.keys(bySource).length, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Source breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Signups by Source</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([src, cnt]) => (
              <div key={src} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${SOURCE_COLORS[src] ?? 'bg-gray-100 text-gray-700'}`}>
                <span>{src}</span>
                <span className="font-bold">{cnt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emails table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">All Signups</h2>
            <span className="text-xs text-gray-400">Newest first</span>
          </div>
          <div className="divide-y divide-gray-50">
            {entries.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-400">No signups yet.</div>
            )}
            {entries.map((e, i) => (
              <div key={e.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-xs text-gray-300 w-6 shrink-0 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{e.email}</p>
                </div>
                <div className="shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[e.source ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                    {e.source ?? 'unknown'}
                  </span>
                </div>
                <div className="shrink-0 text-xs text-gray-400 hidden sm:block">
                  {formatDate(e.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
