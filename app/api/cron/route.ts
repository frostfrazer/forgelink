import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { sql, lte, eq, and, isNotNull } from 'drizzle-orm';
import { sendFeaturedExpiryWarning, sendFeaturedExpiredNotice } from '../../../lib/email';

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const CRON_SECRET = process.env.CRON_SECRET ?? 'forgelink_cron_2025';
  return authHeader === `Bearer ${CRON_SECRET}` || secret === CRON_SECRET;
}

// ─── Weekly snapshot reset ────────────────────────────────────────────────────
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.execute(sql`
    UPDATE mcp_servers
    SET weekly_view_snapshot = view_count,
        weekly_snapshot_at = NOW()
  `);

  return NextResponse.json({ ok: true, task: 'weekly-snapshot', at: new Date().toISOString() });
}

// ─── Daily Featured expiry check ─────────────────────────────────────────────
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const results = { expired: 0, warned: 0, errors: 0 };

  // 1. Find and downgrade fully expired Featured listings
  const expired = await db.select({
    id: mcpServers.id,
    name: mcpServers.name,
    slug: mcpServers.slug,
    authorEmail: mcpServers.authorEmail,
    ownerEmail: mcpServers.ownerEmail,
    featuredExpiresAt: mcpServers.featuredExpiresAt,
  })
  .from(mcpServers)
  .where(
    and(
      eq(mcpServers.isFeatured, true),
      isNotNull(mcpServers.featuredExpiresAt),
      lte(mcpServers.featuredExpiresAt, now)
    )
  );

  for (const server of expired) {
    try {
      await db.update(mcpServers)
        .set({ isFeatured: false, featuredExpiresAt: null })
        .where(eq(mcpServers.id, server.id));

      const email = server.ownerEmail ?? server.authorEmail;
      if (email) {
        await sendFeaturedExpiredNotice({
          email,
          serverName: server.name,
          slug: server.slug,
        });
      }
      results.expired++;
      console.log(`⬇️ Featured expired: ${server.name}`);
    } catch (err) {
      console.error(`Expiry error for ${server.id}:`, err);
      results.errors++;
    }
  }

  // 2. Find listings expiring within 7 days — send warning once
  const expiringSoon = await db.select({
    id: mcpServers.id,
    name: mcpServers.name,
    slug: mcpServers.slug,
    authorEmail: mcpServers.authorEmail,
    ownerEmail: mcpServers.ownerEmail,
    featuredExpiresAt: mcpServers.featuredExpiresAt,
  })
  .from(mcpServers)
  .where(
    and(
      eq(mcpServers.isFeatured, true),
      isNotNull(mcpServers.featuredExpiresAt),
      lte(mcpServers.featuredExpiresAt, in7Days)
    )
  );

  for (const server of expiringSoon) {
    try {
      const daysLeft = Math.ceil(
        (new Date(server.featuredExpiresAt!).getTime() - now.getTime()) / 86400000
      );
      // Only warn at exactly 7, 3, or 1 days left to avoid spamming
      if ([7, 3, 1].includes(daysLeft)) {
        const email = server.ownerEmail ?? server.authorEmail;
        if (email) {
          await sendFeaturedExpiryWarning({
            email,
            serverName: server.name,
            slug: server.slug,
            daysLeft,
          });
          results.warned++;
          console.log(`⚠️ Expiry warning sent: ${server.name} (${daysLeft}d left)`);
        }
      }
    } catch (err) {
      console.error(`Warning error for ${server.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    task: 'featured-expiry-check',
    at: now.toISOString(),
    ...results,
  });
}
