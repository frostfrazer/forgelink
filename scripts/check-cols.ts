import { db } from '../lib/db';
import { mcpServers } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const servers = await db.select().from(mcpServers).where(eq(mcpServers.slug, 'postgresql-mcp'));
  console.log('server keys:', Object.keys(servers[0] ?? {}));
  console.log('claimedAt:', servers[0]?.claimedAt);
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
