import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { eq, ilike, or, desc, and } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) return NextResponse.json({ results: [] });

  const pattern = `%${q}%`;

  const results = await db.select({
    id: mcpServers.id,
    name: mcpServers.name,
    slug: mcpServers.slug,
    tagline: mcpServers.tagline,
    category: mcpServers.category,
    isVerified: mcpServers.isVerified,
    ratingAvg: mcpServers.ratingAvg,
    installCount: mcpServers.installCount,
  })
    .from(mcpServers)
    .where(
      and(
        eq(mcpServers.status, 'approved'),
        or(
          ilike(mcpServers.name, pattern),
          ilike(mcpServers.tagline, pattern),
          ilike(mcpServers.category, pattern),
        )
      ) as any
    )
    .orderBy(desc(mcpServers.installCount))
    .limit(6);

  return NextResponse.json({ results }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
