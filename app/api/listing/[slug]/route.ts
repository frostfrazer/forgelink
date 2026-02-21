import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { db } from '../../../../lib/db';
import { mcpServers, serverTags } from '../../../../lib/db/schema';
import { eq, or } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch server and verify ownership
    const servers = await db.select().from(mcpServers)
      .where(eq(mcpServers.slug, params.slug)).limit(1);
    const server = servers[0];
    if (!server) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isOwner =
      server.ownerEmail?.toLowerCase() === user.email.toLowerCase() ||
      server.authorEmail?.toLowerCase() === user.email.toLowerCase();
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { tagline, description, category, protocol, githubUrl, npmPackage, installCommand, tags } = body;

    // Update server fields
    await db.update(mcpServers).set({
      tagline: tagline?.trim() || server.tagline,
      description: description?.trim() || server.description,
      category: category || server.category,
      protocol: protocol || server.protocol,
      githubUrl: githubUrl?.trim() || null,
      npmPackage: npmPackage?.trim() || null,
      installCommand: installCommand?.trim() || server.installCommand,
      updatedAt: new Date(),
    }).where(eq(mcpServers.id, server.id));

    // Replace tags
    if (Array.isArray(tags)) {
      await db.delete(serverTags).where(eq(serverTags.serverId, server.id));
      const validTags = tags.filter(t => t && t.length <= 50).slice(0, 10);
      if (validTags.length > 0) {
        await db.insert(serverTags).values(
          validTags.map(tag => ({ serverId: server.id, tag }))
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Edit listing error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
