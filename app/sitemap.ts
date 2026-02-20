import { db } from '../lib/db';
import { mcpServers } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://forgelink-pi.vercel.app';

  const servers = await db.select({
    slug: mcpServers.slug,
    category: mcpServers.category,
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

  // Compare pages: every pair within the same category
  const compareRoutes: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = [];
  const byCategory: Record<string, typeof servers> = {};
  for (const s of servers) {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  }
  for (const group of Object.values(byCategory)) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        compareRoutes.push({
          url: `${APP_URL}/compare/${group[i].slug}-vs-${group[j].slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  }

  return [...staticRoutes, ...serverRoutes, ...compareRoutes];
}
