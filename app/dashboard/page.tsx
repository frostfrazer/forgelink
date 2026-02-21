import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { db } from '../../lib/db';
import { mcpServers, serverTags } from '../../lib/db/schema';
import { or, eq } from 'drizzle-orm';
import { Nav } from '../../components/nav';
import { DashboardClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Dashboard | ForgeLink',
  description: 'Manage your AI integrations on ForgeLink',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect('/auth/signin?next=/dashboard');
  }

  const email = user.email;

  // Fetch all servers owned by this user (claimed or submitted)
  const servers = await db.select().from(mcpServers)
    .where(
      or(
        eq(mcpServers.ownerEmail, email),
        eq(mcpServers.authorEmail, email),
      )
    );

  // Attach tags
  const allTags = await db.select().from(serverTags);
  const tagMap: Record<string, string[]> = {};
  for (const t of allTags) {
    if (!tagMap[t.serverId]) tagMap[t.serverId] = [];
    tagMap[t.serverId].push(t.tag);
  }

  const enriched = servers.map(s => ({
    ...s,
    tags: tagMap[s.id] ?? [],
    weeklyGrowth: (s.viewCount ?? 0) - (s.weeklyViewSnapshot ?? 0),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <DashboardClient servers={enriched} userEmail={email} />
    </div>
  );
}
