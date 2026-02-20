import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { serverTags } from '../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/tags?serverId=xxx  — fetch tags for a server
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get('serverId');
  if (!serverId) return NextResponse.json({ tags: [] });
  const rows = await db.select().from(serverTags).where(eq(serverTags.serverId, serverId));
  return NextResponse.json({ tags: rows.map(r => r.tag) });
}

// POST /api/tags  — add a tag { serverId, tag }
export async function POST(req: Request) {
  const { serverId, tag } = await req.json();
  if (!serverId || !tag) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const clean = tag.toLowerCase().trim().replace(/[^a-z0-9-+#.]/g, '').slice(0, 30);
  if (!clean) return NextResponse.json({ error: 'Invalid tag' }, { status: 400 });
  await db.insert(serverTags).values({ serverId, tag: clean }).onConflictDoNothing();
  return NextResponse.json({ ok: true, tag: clean });
}

// DELETE /api/tags  — remove a tag { serverId, tag }
export async function DELETE(req: Request) {
  const { serverId, tag } = await req.json();
  if (!serverId || !tag) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  await db.delete(serverTags).where(and(eq(serverTags.serverId, serverId), eq(serverTags.tag, tag)));
  return NextResponse.json({ ok: true });
}
