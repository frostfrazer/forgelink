import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { sendClaimEmail } from '../../../lib/email';

export async function POST(req: Request) {
  try {
    const { serverId, email } = await req.json();
    if (!serverId || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const servers = await db.select().from(mcpServers).where(eq(mcpServers.id, serverId));
    const server = servers[0];
    if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 });

    // Already claimed by a different email
    if (server.claimedAt && server.ownerEmail &&
        server.ownerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'This listing has already been claimed.' }, { status: 409 });
    }

    // Generate token with 24h expiry
    const token = randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store token + tentative ownerEmail (confirmed on verify)
    await db.update(mcpServers)
      .set({
        claimToken: `${token}:${tokenExpiry.getTime()}`,
        ownerEmail: email.toLowerCase(),
      })
      .where(eq(mcpServers.id, serverId));

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://forgelink-pi.vercel.app';
    const claimUrl = `${APP_URL}/claim/verify?token=${token}&id=${serverId}`;

    // Send via central email lib
    sendClaimEmail({
      email,
      serverName: server.name,
      claimUrl,
    }).catch(err => console.error('[claim email]', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
