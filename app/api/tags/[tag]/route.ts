import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { serverTags, mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_req: Request, { params }: { params: { tag: string } }) {
  const rows = await db
    .select({ server: mcpServers })
    .from(serverTags)
    .innerJoin(mcpServers, eq(serverTags.serverId, mcpServers.id))
    .where(eq(serverTags.tag, params.tag.toLowerCase()));

  return NextResponse.json({ servers: rows.map(r => r.server) });
}
