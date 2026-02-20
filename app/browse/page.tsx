import { db } from '../../lib/db';
import { mcpServers } from '../../lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { BrowseClient } from './client-page';
import { Nav } from '../../components/nav';
import { Suspense } from 'react';

async function getServers() {
  return await db.select().from(mcpServers)
    .where(eq(mcpServers.status, 'approved'))
    .orderBy(desc(mcpServers.viewCount))
    .limit(100);
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const servers = await getServers();
  const initialCategory = searchParams.category ?? 'all';

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
        <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
          <BrowseClient servers={servers} initialCategory={initialCategory} />
        </Suspense>
      </div>
    </div>
  );
}
