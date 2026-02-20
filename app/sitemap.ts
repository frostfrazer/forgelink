import { db } from '../lib/db';
import { mcpServers } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://forgelink-pi.vercel.app';

  const servers = await db.select({
    slug: mcpServers.slug,
    updatedAt: mcpServers.updatedAt,
  }).from(mcpServers).where(eq(mcpServers.status, 'approved'));

  const staticRoutes = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${APP_URL}/browse`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${APP_URL}/submit`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${APP_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  const serverRoutes = servers.map(s => ({
    url: `${APP_URL}/server/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...serverRoutes];
}
