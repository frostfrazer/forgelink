import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { sql } from 'drizzle-orm';

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const CRON_SECRET = process.env.CRON_SECRET ?? 'forgelink_cron_2025';
  return authHeader === `Bearer ${CRON_SECRET}` || secret === CRON_SECRET;
}

// Weekly Monday reset of view snapshots
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
