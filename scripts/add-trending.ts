import { db } from '../lib/db';
import { mcpServers } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  // Add weekly snapshot columns if not exists
  await db.execute(sql`
    ALTER TABLE mcp_servers
    ADD COLUMN IF NOT EXISTS weekly_view_snapshot INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS weekly_snapshot_at TIMESTAMP
  `);
  console.log('Columns added');

  // Seed snapshot with current viewCount so trending starts fresh from now
  await db.execute(sql`
    UPDATE mcp_servers
    SET weekly_view_snapshot = view_count,
        weekly_snapshot_at = NOW()
    WHERE weekly_snapshot_at IS NULL
  `);
  console.log('Snapshot seeded');
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
