import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

function verifyToken(server: { claimToken: string | null }, token: string): boolean {
  const [storedToken, expiryStr] = (server.claimToken ?? '').split(':');
  return storedToken === token && Date.now() <= parseInt(expiryStr ?? '0');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  if (!token || !id) return NextResponse.json({ error: 'Invalid link' }, { status: 400 });

  const servers = await db.select().from(mcpServers).where(eq(mcpServers.id, id));
  const server = servers[0];
  if (!server) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [storedToken, expiryStr] = (server.claimToken ?? '').split(':');
  if (storedToken !== token) return NextResponse.json({ valid: false, error: 'Invalid token' });
  if (Date.now() > parseInt(expiryStr ?? '0')) return NextResponse.json({ valid: false, error: 'Link expired' });

  return NextResponse.json({
    valid: true,
    server: {
      id: server.id, name: server.name, slug: server.slug,
      tagline: server.tagline, description: server.description,
      githubUrl: server.githubUrl, npmPackage: server.npmPackage,
      installCommand: server.installCommand, category: server.category,
      protocol: server.protocol, ownerEmail: server.ownerEmail,
    }
  });
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  if (!token || !id) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const servers = await db.select().from(mcpServers).where(eq(mcpServers.id, id));
  const server = servers[0];
  if (!server) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!verifyToken(server, token)) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const body = await req.json();
  const allowed = ['tagline', 'description', 'githubUrl', 'npmPackage', 'installCommand'];
  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  // ✅ THE FIX: write ownerEmail definitively on verify confirm
  // ownerEmail was already set on POST, but we re-confirm it here
  // and set claimedAt to lock the claim
  await db.update(mcpServers)
    .set({
      ...updates,
      ownerEmail: server.ownerEmail, // lock in the email set during POST
      claimedAt: new Date(),
      claimToken: null, // invalidate token after use
    })
    .where(eq(mcpServers.id, id));

  return NextResponse.json({ success: true });
}
