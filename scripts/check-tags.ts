import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
async function main() {
  const cols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'server_tags' ORDER BY ordinal_position`);
  console.log('server_tags columns:', (cols as any).rows?.map((r: any) => r.column_name) ?? cols);
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
