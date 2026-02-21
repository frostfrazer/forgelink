import { db } from '../../lib/db';
import { mcpServers, serverTags } from '../../lib/db/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';
import { BrowseClient } from './client-page';
import { Nav } from '../../components/nav';
import type { Metadata } from 'next';

const PAGE_SIZE = 12;

const CATEGORY_LABELS: Record<string, string> = {
  'Database':      'Database MCP Servers',
  'Development':   'Development AI Integrations',
  'Communication': 'Communication AI Integrations',
  'Productivity':  'Productivity MCP Servers',
  'Cloud':         'Cloud AI Integrations',
  'Finance':       'Finance AI Integrations',
  'AI & ML':       'AI & ML Integrations',
  'Analytics':     'Analytics MCP Servers',
};

export async function generateMetadata({
  searchParams,
}: { searchParams: { category?: string; q?: string } }): Promise<Metadata> {
  const category = searchParams.category;
  const q = searchParams.q;
  let title = 'Browse AI Agent Integrations | ForgeLink';
  let description = 'Discover production-ready MCP servers, GPT Actions, and LangChain tools for AI agents.';
  if (category && CATEGORY_LABELS[category]) {
    title = `${CATEGORY_LABELS[category]} | ForgeLink`;
    description = `Browse the best ${category} integrations for AI agents.`;
  } else if (q) {
    title = `Search: "${q}" — AI Integrations | ForgeLink`;
    description = `Search results for "${q}" on ForgeLink.`;
  }
  return { title, description, openGraph: { title, description }, twitter: { card: 'summary', title, description } };
}

async function getInitialServers() {
  // First page — featured first, then verified, then by views
  const rows = await db.select().from(mcpServers)
    .where(eq(mcpServers.status, 'approved'))
    .orderBy(desc(mcpServers.isFeatured), desc(mcpServers.isVerified), desc(mcpServers.viewCount))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const pageRows = rows.slice(0, PAGE_SIZE);

  const ids = pageRows.map(r => r.id);
  const tagRows = ids.length > 0
    ? await db.select().from(serverTags).where(inArray(serverTags.serverId, ids))
    : [];
  const tagMap: Record<string, string[]> = {};
  for (const t of tagRows) {
    if (!tagMap[t.serverId]) tagMap[t.serverId] = [];
    tagMap[t.serverId].push(t.tag);
  }

  // Also get total count and category counts for filter UI
  const allApproved = await db.select({
    id: mcpServers.id,
    category: mcpServers.category,
  }).from(mcpServers).where(eq(mcpServers.status, 'approved'));

  const totalCount = allApproved.length;
  const categoryCounts: Record<string, number> = {};
  for (const s of allApproved) {
    categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1;
  }

  // All unique tags for the tag pill filter
  const allTags = await db.select({ tag: serverTags.tag }).from(serverTags);
  const uniqueTags = Array.from(new Set(allTags.map(t => t.tag))).sort();

  return {
    servers: pageRows.map(s => ({ ...s, tags: tagMap[s.id] ?? [] })),
    hasMore,
    totalCount,
    categoryCounts,
    uniqueTags,
  };
}

export default async function BrowsePage({
  searchParams,
}: { searchParams: { category?: string; q?: string; protocol?: string; tag?: string } }) {
  const { servers, hasMore, totalCount, categoryCounts, uniqueTags } = await getInitialServers();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold mb-2">Browse AI Agent Integrations</h1>
          <p className="text-gray-600">Discover production-ready integrations for GPT, Claude, LangChain, AutoGPT and more</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BrowseClient
          initialServers={servers}
          initialHasMore={hasMore}
          totalCount={totalCount}
          categoryCounts={categoryCounts}
          allTags={uniqueTags}
          initialCategory={searchParams.category ?? 'all'}
          initialQuery={searchParams.q ?? ''}
          initialProtocol={searchParams.protocol ?? 'all'}
          initialTag={searchParams.tag ?? ''}
        />
      </div>
    </div>
  );
}
