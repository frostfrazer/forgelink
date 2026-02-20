import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS server_tags (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      server_id UUID NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE,
      tag VARCHAR(50) NOT NULL,
      UNIQUE(server_id, tag)
    )
  `);
  console.log('server_tags table ready');
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
