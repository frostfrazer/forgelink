import { redirect, notFound } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import { db } from '../../../../lib/db';
import { mcpServers, serverTags } from '../../../../lib/db/schema';
import { or, eq } from 'drizzle-orm';
import { Nav } from '../../../../components/nav';
import { EditForm } from './form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Listing | ForgeLink' };

export default async function EditPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) redirect('/auth/signin?next=/dashboard');

  const servers = await db.select().from(mcpServers)
    .where(eq(mcpServers.slug, params.slug))
    .limit(1);

  const server = servers[0];
  if (!server) notFound();

  // Only owner can edit
  const isOwner =
    server.ownerEmail?.toLowerCase() === user.email.toLowerCase() ||
    server.authorEmail?.toLowerCase() === user.email.toLowerCase();

  if (!isOwner) redirect('/dashboard?error=unauthorized');

  // Fetch tags
  const tagRows = await db.select().from(serverTags).where(eq(serverTags.serverId, server.id));
  const tags = tagRows.map(t => t.tag);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← Back to dashboard</a>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Edit listing</h1>
        <p className="text-gray-500 text-sm mb-8">{server.name}</p>
        <EditForm server={{ ...server, tags }} />
      </div>
    </div>
  );
}
