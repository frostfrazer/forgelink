import { db } from '../lib/db/index';
import { sql } from 'drizzle-orm';

async function run() {
  await db.execute(sql`
    ALTER TABLE mcp_servers 
    ADD COLUMN IF NOT EXISTS featured_expires_at TIMESTAMP
  `);
  console.log('✅ Migration done: featured_expires_at column added');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
