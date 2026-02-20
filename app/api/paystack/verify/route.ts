import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');
  const serverId = searchParams.get('server_id');
  const tier = searchParams.get('tier');

  if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

  try {
    // Verify with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const data = await res.json();

    if (!data.status || data.data?.status !== 'success') {
      return NextResponse.json({ ok: false, error: 'Payment not confirmed' });
    }

    // Get serverId from metadata if not in query
    const meta = data.data.metadata ?? {};
    const resolvedServerId = serverId ?? meta.serverId;
    const resolvedTier = tier ?? meta.tier;

    if (!resolvedServerId || !resolvedTier) {
      return NextResponse.json({ ok: false, error: 'Missing server/tier info' });
    }

    // Fetch server to check current state
    const servers = await db.select().from(mcpServers).where(eq(mcpServers.id, resolvedServerId));
    const server = servers[0];
    if (!server) return NextResponse.json({ ok: false, error: 'Server not found' });

    // Check if already activated (idempotent)
    const alreadyActive =
      (resolvedTier === 'verified' && server.isVerified) ||
      (resolvedTier === 'featured' && server.isFeatured);

    if (!alreadyActive) {
      if (resolvedTier === 'verified') {
        await db.update(mcpServers)
          .set({ isVerified: true, status: 'approved' })
          .where(eq(mcpServers.id, resolvedServerId));
      } else if (resolvedTier === 'featured') {
        await db.update(mcpServers)
          .set({ isFeatured: true, isVerified: true, status: 'approved' })
          .where(eq(mcpServers.id, resolvedServerId));
      }
    }

    return NextResponse.json({ ok: true, already: alreadyActive, slug: server.slug });

  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ ok: false, error: 'Verification failed' }, { status: 500 });
  }
}
