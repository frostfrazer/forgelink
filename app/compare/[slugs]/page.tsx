import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Nav } from '../../../components/nav';
import { Star, Download, Check, X, ExternalLink, Github } from 'lucide-react';

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

type Server = typeof mcpServers.$inferSelect;

export async function generateMetadata({ params }: { params: { slugs: string } }): Promise<Metadata> {
  const parts = params.slugs.split('-vs-');
  if (parts.length !== 2) return { title: 'Compare | ForgeLink' };
  const [a, b] = await Promise.all([
    db.select().from(mcpServers).where(eq(mcpServers.slug, parts[0])).then(r => r[0]),
    db.select().from(mcpServers).where(eq(mcpServers.slug, parts[1])).then(r => r[0]),
  ]);
  if (!a || !b) return { title: 'Compare | ForgeLink' };
  const title = `${a.name} vs ${b.name} — Compare AI Integrations | ForgeLink`;
  const description = `Compare ${a.name} and ${b.name} — ratings, installs, features, and more. Find the best ${a.category} integration for your AI agent.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function Winner({ a, b, field, label, format = (v: any) => String(v ?? '—'), higher = true }: {
  a: Server; b: Server; field: keyof Server; label: string;
  format?: (v: any) => string; higher?: boolean;
}) {
  const va = a[field] as any;
  const vb = b[field] as any;
  const na = parseFloat(String(va ?? 0));
  const nb = parseFloat(String(vb ?? 0));
  const aWins = higher ? na > nb : na < nb;
  const bWins = higher ? nb > na : nb < na;

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className={`py-3 px-4 text-sm font-medium ${aWins ? 'text-green-700 bg-green-50' : 'text-gray-700'} rounded-l-lg`}>
        <div className="flex items-center gap-2">
          {format(va)}
          {aWins && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Better</span>}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500 text-center font-medium">{label}</td>
      <td className={`py-3 px-4 text-sm font-medium ${bWins ? 'text-green-700 bg-green-50' : 'text-gray-700'} rounded-r-lg text-right`}>
        <div className="flex items-center gap-2 justify-end">
          {bWins && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Better</span>}
          {format(vb)}
        </div>
      </td>
    </tr>
  );
}

function BoolRow({ a, b, field, label }: { a: Server; b: Server; field: keyof Server; label: string }) {
  const va = Boolean(a[field]);
  const vb = Boolean(b[field]);
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-4 text-center">
        {va ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
      </td>
      <td className="py-3 px-4 text-sm text-gray-500 text-center font-medium">{label}</td>
      <td className="py-3 px-4 text-center">
        {vb ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
      </td>
    </tr>
  );
}

export default async function ComparePage({ params }: { params: { slugs: string } }) {
  const parts = params.slugs.split('-vs-');
  if (parts.length !== 2) notFound();

  const [serversA, serversB] = await Promise.all([
    db.select().from(mcpServers).where(eq(mcpServers.slug, parts[0])),
    db.select().from(mcpServers).where(eq(mcpServers.slug, parts[1])),
  ]);

  const a = serversA[0];
  const b = serversB[0];
  if (!a || !b) notFound();

  // Score: weighted sum of rating (40%), installs (40%), verified (20%)
  const maxInstalls = Math.max(a.installCount ?? 0, b.installCount ?? 0, 1);
  const scoreA = (parseFloat(a.ratingAvg ?? '0') / 5) * 40 +
    ((a.installCount ?? 0) / maxInstalls) * 40 +
    (a.isVerified ? 20 : 0);
  const scoreB = (parseFloat(b.ratingAvg ?? '0') / 5) * 40 +
    ((b.installCount ?? 0) / maxInstalls) * 40 +
    (b.isVerified ? 20 : 0);

  const winner = scoreA > scoreB ? a : scoreB > scoreA ? b : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-3">Side-by-side comparison</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {a.name} <span className="text-gray-400 font-normal">vs</span> {b.name}
          </h1>
          <p className="text-gray-500">
            Comparing two {a.category === b.category ? a.category : `${a.category} & ${b.category}`} integrations
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Hero cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[a, b].map((server, i) => (
            <div key={server.id} className={`bg-white rounded-2xl border-2 p-6 ${winner?.id === server.id ? 'border-green-400 shadow-lg' : 'border-gray-200'}`}>
              {winner?.id === server.id && (
                <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                  ⭐ Recommended
                </div>
              )}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[server.category] ?? 'from-blue-500 to-blue-700'} flex items-center justify-center text-2xl flex-shrink-0`}>
                  ⚡
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900">{server.name}</h2>
                  <p className="text-sm text-gray-500 line-clamp-1">{server.tagline}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{server.category}</Badge>
                <Badge variant="outline">{server.protocol}</Badge>
                {server.isVerified && <Badge className="bg-blue-100 text-blue-700 border-blue-200">✓ Verified</Badge>}
                {server.isFeatured && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">★ Featured</Badge>}
              </div>
              <div className="flex gap-5 text-sm text-gray-600 mb-5">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <strong>{server.ratingAvg}</strong>
                  <span className="text-gray-400">({server.ratingCount})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4 text-gray-400" />
                  {(server.installCount ?? 0).toLocaleString()}
                </span>
              </div>
              <Link
                href={`/server/${server.slug}`}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                View {server.name} →
              </Link>
            </div>
          ))}
        </div>

        {/* Stats comparison table */}
        <Card>
          <CardHeader><CardTitle>Stats Comparison</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="px-4 pb-2">
              {/* Column headers */}
              <div className="grid grid-cols-3 text-sm font-semibold text-gray-500 pb-2 pt-3 border-b border-gray-100">
                <span>{a.name}</span>
                <span className="text-center">Metric</span>
                <span className="text-right">{b.name}</span>
              </div>
              <table className="w-full mt-1">
                <tbody>
                  <Winner a={a} b={b} field="ratingAvg" label="Rating" format={v => `⭐ ${v ?? '0.0'}`} />
                  <Winner a={a} b={b} field="ratingCount" label="Reviews" format={v => `${(v ?? 0).toLocaleString()} reviews`} />
                  <Winner a={a} b={b} field="installCount" label="Installs" format={v => `${(v ?? 0).toLocaleString()} installs`} />
                  <Winner a={a} b={b} field="viewCount" label="Views" format={v => `${(v ?? 0).toLocaleString()} views`} />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Feature comparison */}
        <Card>
          <CardHeader><CardTitle>Features</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="px-4 pb-2">
              <div className="grid grid-cols-3 text-sm font-semibold text-gray-500 pb-2 pt-3 border-b border-gray-100">
                <span className="text-center">{a.name}</span>
                <span className="text-center">Feature</span>
                <span className="text-center">{b.name}</span>
              </div>
              <table className="w-full mt-1">
                <tbody>
                  <BoolRow a={a} b={b} field="isVerified" label="Verified" />
                  <BoolRow a={a} b={b} field="isFeatured" label="Featured" />
                  <BoolRow a={a} b={b} field="githubUrl" label="Open Source" />
                  <BoolRow a={a} b={b} field="npmPackage" label="NPM Package" />
                  <BoolRow a={a} b={b} field="installCommand" label="Install Command" />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Description comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[a, b].map(server => (
            <Card key={server.id}>
              <CardHeader><CardTitle className="text-base">About {server.name}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{server.description}</p>
                <div className="flex flex-col gap-2">
                  {server.githubUrl && (
                    <a href={server.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
                      <Github className="w-4 h-4" /> GitHub
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {server.installCommand && (
                    <div className="bg-gray-900 rounded-lg px-3 py-2 text-xs font-mono text-green-400 truncate">
                      {server.installCommand}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verdict */}
        {winner && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-2">Our Verdict</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{winner.name} wins</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Based on rating, install count, and verified status, {winner.name} edges ahead as the stronger choice for {winner.category.toLowerCase()} use cases.
            </p>
            <Link
              href={`/server/${winner.slug}`}
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              View {winner.name} →
            </Link>
          </div>
        )}

        {/* Browse more */}
        <div className="text-center text-sm text-gray-500">
          <Link href={`/browse?category=${encodeURIComponent(a.category)}`} className="text-blue-600 hover:underline">
            Browse all {a.category} integrations →
          </Link>
        </div>

      </div>
    </div>
  );
}
