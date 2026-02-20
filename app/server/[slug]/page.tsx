import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { eq, sql, and, ne, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Star, Download, Github, ExternalLink } from 'lucide-react';
import { Nav } from '../../../components/nav';
import { ReviewSection } from '../../../components/review-section';
import { CopyButton } from '../../../components/copy-button';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const servers = await db.select().from(mcpServers).where(eq(mcpServers.slug, params.slug));
  const server = servers[0];
  if (!server) return { title: 'Not Found' };
  const url = `https://forgelink-pi.vercel.app/server/${server.slug}`;
  return {
    title: `${server.name} — ${server.category} Integration | ForgeLink`,
    description: server.tagline,
    openGraph: {
      title: `${server.name} | ForgeLink`,
      description: server.tagline,
      type: 'website',
      url,
      siteName: 'ForgeLink',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${server.name} | ForgeLink`,
      description: server.tagline,
      site: '@forgelink',
    },
  };
}

async function getServer(slug: string) {
  const servers = await db.select().from(mcpServers).where(eq(mcpServers.slug, slug));
  return servers[0] || null;
}

async function getRelated(category: string, currentId: string) {
  return db.select().from(mcpServers)
    .where(and(
      eq(mcpServers.status, 'approved'),
      eq(mcpServers.category, category),
      ne(mcpServers.id, currentId),
    ))
    .orderBy(desc(mcpServers.installCount))
    .limit(3);
}

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

export default async function ServerPage({ params }: { params: { slug: string } }) {
  const server = await getServer(params.slug);
  if (!server) notFound();

  const [related] = await Promise.all([
    getRelated(server.category, server.id),
    db.update(mcpServers)
      .set({ viewCount: sql`${mcpServers.viewCount} + 1` })
      .where(eq(mcpServers.id, server.id))
      .catch(() => {}),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-start gap-5">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[server.category] ?? 'from-blue-500 to-blue-700'} flex items-center justify-center flex-shrink-0 text-3xl`}>
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900">{server.name}</h1>
                {server.isVerified && <Badge className="bg-blue-100 text-blue-700 border-blue-200">Verified</Badge>}
                {server.isFeatured && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Featured</Badge>}
                <Badge variant="outline">{server.protocol}</Badge>
              </div>
              <p className="text-lg text-gray-500 mb-3">{server.tagline}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <strong className="text-gray-900">{server.ratingAvg}</strong>
                  <span>({server.ratingCount} reviews)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {(server.installCount ?? 0).toLocaleString()} installs
                </span>
                <Link href={`/browse?category=${encodeURIComponent(server.category)}`}>
                  <Badge variant="outline" className="hover:border-blue-400 hover:text-blue-600 cursor-pointer transition-colors">
                    {server.category}
                  </Badge>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{server.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Installation</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs"># Install command</p>
                    <CopyButton text={server.installCommand ?? ''} />
                  </div>
                  <code className="text-green-400">{server.installCommand}</code>
                </div>
              </CardContent>
            </Card>

            <ReviewSection serverId={server.id} />

            {/* Related integrations */}
            {related.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">More in {server.category}</h2>
                  <Link
                    href={`/browse?category=${encodeURIComponent(server.category)}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(rel => (
                    <Link key={rel.id} href={`/server/${rel.slug}`}>
                      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all group h-full">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[rel.category] ?? 'from-blue-500 to-blue-700'} flex items-center justify-center mb-3 text-sm`}>
                          ⚡
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                          {rel.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{rel.tagline}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {rel.ratingAvg}
                          <span>·</span>
                          <Download className="w-3 h-3" />
                          {(rel.installCount ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {server.githubUrl && (
              <Card>
                <CardHeader><CardTitle>Links</CardTitle></CardHeader>
                <CardContent>
                  <a
                    href={server.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                    <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                  </a>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  ['Author', server.authorName],
                  ['Category', server.category],
                  ['Protocol', server.protocol],
                  ...(server.npmPackage ? [['Package', server.npmPackage]] : []),
                  ['Views', (server.viewCount ?? 0).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {!server.isFeatured && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
                <p className="font-semibold text-blue-900 mb-1 text-sm">Is this your integration?</p>
                <p className="text-xs text-blue-700 mb-3">Upgrade to Featured for top placement and homepage visibility.</p>
                <a
                  href="/pricing"
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  View Plans →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
