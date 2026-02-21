import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers, serverTags } from '../../../lib/db/schema';
import { eq, desc, ilike, or, and, inArray } from 'drizzle-orm';

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const q      = searchParams.get('q')?.trim() ?? '';
  const cat    = searchParams.get('category') ?? '';
  const proto  = searchParams.get('protocol') ?? '';
  const tag    = searchParams.get('tag') ?? '';

  const offset = (page - 1) * PAGE_SIZE;

  // Build base conditions
  const conditions = [eq(mcpServers.status, 'approved')];
  if (cat)   conditions.push(eq(mcpServers.category, cat));
  if (proto) conditions.push(eq(mcpServers.protocol, proto));
  if (q) {
    conditions.push(or(
      ilike(mcpServers.name,        `%${q}%`),
      ilike(mcpServers.tagline,     `%${q}%`),
      ilike(mcpServers.description, `%${q}%`),
    )!);
  }

  // If tag filter — get matching serverIds first
  let tagServerIds: string[] | null = null;
  if (tag) {
    const tagRows = await db.select({ serverId: serverTags.serverId })
      .from(serverTags)
      .where(eq(serverTags.tag, tag));
    tagServerIds = tagRows.map(r => r.serverId);
    if (tagServerIds.length === 0) {
      return NextResponse.json({ servers: [], hasMore: false });
    }
    conditions.push(inArray(mcpServers.id, tagServerIds));
  }

  const rows = await db.select().from(mcpServers)
    .where(and(...conditions))
    .orderBy(desc(mcpServers.isFeatured), desc(mcpServers.isVerified), desc(mcpServers.viewCount))
    .limit(PAGE_SIZE + 1)   // fetch one extra to know if there's more
    .offset(offset);

  const hasMore = rows.length > PAGE_SIZE;
  const pageRows = rows.slice(0, PAGE_SIZE);

  // Attach tags
  if (pageRows.length === 0) return NextResponse.json({ servers: [], hasMore: false });

  const ids = pageRows.map(r => r.id);
  const tagRows = await db.select().from(serverTags).where(inArray(serverTags.serverId, ids));
  const tagMap: Record<string, string[]> = {};
  for (const t of tagRows) {
    if (!tagMap[t.serverId]) tagMap[t.serverId] = [];
    tagMap[t.serverId].push(t.tag);
  }

  const servers = pageRows.map(s => ({ ...s, tags: tagMap[s.id] ?? [] }));
  return NextResponse.json({ servers, hasMore, page });
}
