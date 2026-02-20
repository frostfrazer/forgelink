import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  if (!token || !id) return NextResponse.json({ error: 'Invalid link' }, { status: 400 });

  const servers = await db.select().from(mcpServers).where(eq(mcpServers.id, id));
  const server = servers[0];
  if (!server) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [storedToken, expiryStr] = (server.claimToken ?? '').split(':');
  const expiry = parseInt(expiryStr ?? '0');

  if (storedToken !== token) return NextResponse.json({ valid: false, error: 'Invalid token' });
  if (Date.now() > expiry) return NextResponse.json({ valid: false, error: 'Link expired' });

  return NextResponse.json({ valid: true, server: {
    id: server.id, name: server.name, slug: server.slug,
    tagline: server.tagline, description: server.description,
    githubUrl: server.githubUrl, npmPackage: server.npmPackage,
    installCommand: server.installCommand, category: server.category,
    protocol: server.protocol, ownerEmail: server.ownerEmail,
  }});
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  if (!token || !id) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const servers = await db.select().from(mcpServers).where(eq(mcpServers.id, id));
  const server = servers[0];
  if (!server) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [storedToken, expiryStr] = (server.claimToken ?? '').split(':');
  if (storedToken !== token || Date.now() > parseInt(expiryStr ?? '0')) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const body = await req.json();
  const allowed = ['tagline', 'description', 'githubUrl', 'npmPackage', 'installCommand'];
  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  await db.update(mcpServers)
    .set({ ...updates, claimedAt: new Date() })
    .where(eq(mcpServers.id, id));

  return NextResponse.json({ success: true });
}
