import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { sql } from 'drizzle-orm';

// Called weekly by Vercel Cron (see vercel.json)
// Also callable manually: GET /api/cron/reset-snapshots?secret=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const CRON_SECRET = process.env.CRON_SECRET ?? 'forgelink_cron_2025';

  // Allow Vercel cron (no auth header needed) or manual with secret
  const authHeader = req.headers.get('authorization');
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = secret === CRON_SECRET;

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.execute(sql`
    UPDATE mcp_servers
    SET weekly_view_snapshot = view_count,
        weekly_snapshot_at = NOW()
  `);

  return NextResponse.json({ ok: true, resetAt: new Date().toISOString() });
}
