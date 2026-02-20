import { db } from '../../lib/db';
import { mcpServers } from '../../lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { BrowseClient } from './client-page';
import { Nav } from '../../components/nav';
import type { Metadata } from 'next';

const CATEGORY_LABELS: Record<string, string> = {
  'Database': 'Database MCP Servers',
  'Development': 'Development AI Integrations',
  'Communication': 'Communication AI Integrations',
  'Productivity': 'Productivity MCP Servers',
  'Cloud': 'Cloud AI Integrations',
  'Finance': 'Finance AI Integrations',
  'AI & ML': 'AI & ML Integrations',
  'Analytics': 'Analytics MCP Servers',
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}): Promise<Metadata> {
  const category = searchParams.category;
  const q = searchParams.q;

  let title = 'Browse AI Agent Integrations | ForgeLink';
  let description = 'Discover production-ready MCP servers, GPT Actions, and LangChain tools for AI agents.';

  if (category && CATEGORY_LABELS[category]) {
    title = `${CATEGORY_LABELS[category]} | ForgeLink`;
    description = `Browse the best ${category} integrations for AI agents. MCP servers, GPT Actions, and more.`;
  } else if (q) {
    title = `Search: "${q}" — AI Integrations | ForgeLink`;
    description = `Search results for "${q}" on ForgeLink — the AI agent integration marketplace.`;
  }

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary', title, description },
  };
}

async function getServers() {
  return await db.select().from(mcpServers)
    .where(eq(mcpServers.status, 'approved'))
    .orderBy(desc(mcpServers.viewCount))
    .limit(100);
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; protocol?: string };
}) {
  const servers = await getServers();
  const initialCategory = searchParams.category ?? 'all';
  const initialQuery = searchParams.q ?? '';
  const initialProtocol = searchParams.protocol ?? 'all';

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
          servers={servers}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
          initialProtocol={initialProtocol}
        />
      </div>
    </div>
  );
}
