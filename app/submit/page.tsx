import { db } from '../../lib/db';
import { mcpServers } from '../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { SubmitForm } from './form';
import { Nav } from '../../components/nav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Your Integration | ForgeLink',
  description: 'Share your MCP server or AI integration with thousands of developers.',
};

const EARLY_BIRD_LIMIT = 10;

export default async function SubmitPage() {
  // Count how many verified listings already exist (early bird slots used)
  const result = await db.select().from(mcpServers)
    .where(and(eq(mcpServers.isVerified, true), eq(mcpServers.status, 'approved')));
  const earlyBirdLeft = Math.max(0, EARLY_BIRD_LIMIT - result.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">Submit Your Integration</h1>
          <p className="text-gray-600">Share your AI agent integration with thousands of developers</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SubmitForm earlyBirdLeft={earlyBirdLeft} />
      </div>
    </div>
  );
}
