import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const servers = await db.select().from(mcpServers).where(eq(mcpServers.slug, params.slug));
    const server = servers[0];
    if (!server) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      name: server.name,
      tagline: server.tagline,
      category: server.category,
      protocol: server.protocol,
      ratingAvg: server.ratingAvg,
      installCount: server.installCount,
      isVerified: server.isVerified,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
