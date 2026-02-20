import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
async function main() {
  await db.execute(sql`ALTER TABLE server_tags ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid()`);
  // Backfill existing rows
  await db.execute(sql`UPDATE server_tags SET id = gen_random_uuid() WHERE id IS NULL`);
  // Make not null
  await db.execute(sql`ALTER TABLE server_tags ALTER COLUMN id SET NOT NULL`);
  // Add primary key if missing
  await db.execute(sql`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='server_tags' AND constraint_type='PRIMARY KEY') THEN ALTER TABLE server_tags ADD PRIMARY KEY (id); END IF; END $$`);
  console.log('server_tags id column added');
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
