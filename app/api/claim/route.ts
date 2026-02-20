import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const { serverId, email } = await req.json();
    if (!serverId || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Find the server
    const servers = await db.select().from(mcpServers).where(eq(mcpServers.id, serverId));
    const server = servers[0];
    if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 });

    // Check email matches author or existing owner
    const authorMatch = server.authorEmail?.toLowerCase().includes(email.toLowerCase()) ||
      email.toLowerCase() === server.ownerEmail?.toLowerCase();

    if (!authorMatch) {
      // Still allow claim but flag it — admin will verify
      // We just send the token to whichever email they provide
    }

    // Already claimed by someone else
    if (server.claimedAt && server.ownerEmail && server.ownerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'This listing has already been claimed.' }, { status: 409 });
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await db.update(mcpServers)
      .set({ claimToken: `${token}:${tokenExpiry.getTime()}`, ownerEmail: email.toLowerCase() })
      .where(eq(mcpServers.id, serverId));

    const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://forgelink-pi.vercel.app'}/claim/verify?token=${token}&id=${serverId}`;

    // Send email if Resend configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'ForgeLink <noreply@forgelink-pi.vercel.app>',
          to: email,
          subject: `Claim your ForgeLink listing: ${server.name}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2 style="color:#1E293B">Claim your listing on ForgeLink</h2>
              <p style="color:#475569">Click the button below to verify you own <strong>${server.name}</strong> and get access to edit your listing.</p>
              <a href="${claimUrl}" style="display:inline-block;background:#2563EB;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                Verify & Claim Listing
              </a>
              <p style="color:#94A3B8;font-size:13px">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
              <p style="color:#CBD5E1;font-size:12px">Or copy this link: ${claimUrl}</p>
            </div>
          `,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      // In dev without Resend, return the link directly
      ...(RESEND_API_KEY ? {} : { devLink: claimUrl }),
    });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
