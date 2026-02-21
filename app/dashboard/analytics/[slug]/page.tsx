import { redirect, notFound } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import { db } from '../../../../lib/db';
import { mcpServers, reviews, serverTags } from '../../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Nav } from '../../../../components/nav';
import { AnalyticsClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics | ForgeLink' };

export default async function AnalyticsPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/auth/signin?next=/dashboard');

  const servers = await db.select().from(mcpServers)
    .where(eq(mcpServers.slug, params.slug)).limit(1);
  const server = servers[0];
  if (!server) notFound();

  const isOwner =
    server.ownerEmail?.toLowerCase() === user.email.toLowerCase() ||
    server.authorEmail?.toLowerCase() === user.email.toLowerCase();
  if (!isOwner) redirect('/dashboard?error=unauthorized');

  if (!server.isFeatured) redirect(`/dashboard?error=upgrade`);

  // Fetch reviews with timestamps
  const reviewRows = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    reviewerName: reviews.reviewerName,
    createdAt: reviews.createdAt,
  }).from(reviews)
    .where(eq(reviews.serverId, server.id))
    .orderBy(desc(reviews.createdAt))
    .limit(100);

  const tagRows = await db.select().from(serverTags)
    .where(eq(serverTags.serverId, server.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← Dashboard</a>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">{server.name}</span>
        </div>
        <AnalyticsClient
          server={{
            id: server.id,
            name: server.name,
            slug: server.slug,
            tagline: server.tagline,
            category: server.category,
            viewCount: server.viewCount ?? 0,
            installCount: server.installCount ?? 0,
            ratingAvg: server.ratingAvg ?? '0.00',
            ratingCount: server.ratingCount ?? 0,
            weeklyViewSnapshot: server.weeklyViewSnapshot ?? 0,
            createdAt: server.createdAt,
            isVerified: server.isVerified,
            isFeatured: server.isFeatured,
          }}
          reviews={reviewRows.map(r => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
          tags={tagRows.map(t => t.tag)}
        />
      </div>
    </div>
  );
}
