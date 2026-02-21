import { db } from '../lib/db/index';
import { mcpServers } from '../lib/db/schema';
import { like, or } from 'drizzle-orm';

async function run() {
  // Find all corrupted emails
  const corrupted = await db.select({
    id: mcpServers.id,
    name: mcpServers.name,
    authorEmail: mcpServers.authorEmail,
  })
  .from(mcpServers)
  .where(
    or(
      like(mcpServers.authorEmail, '% [EARLY BIRD]%'),
      like(mcpServers.authorEmail, '% [VERIFIED%'),
      like(mcpServers.authorEmail, '% [FREE REVIEW]%'),
    )
  );

  console.log(`Found ${corrupted.length} corrupted email(s):`);
  corrupted.forEach(s => console.log(` - "${s.name}" | "${s.authorEmail}"`));

  if (corrupted.length === 0) {
    console.log('Nothing to fix.');
    process.exit(0);
  }

  // Fix each one
  let fixed = 0;
  for (const server of corrupted) {
    const cleanEmail = (server.authorEmail ?? '')
      .replace(/\s*\[EARLY BIRD\]/gi, '')
      .replace(/\s*\[VERIFIED[^\]]*\]/gi, '')
      .replace(/\s*\[FREE REVIEW\]/gi, '')
      .trim();

    await db.update(mcpServers)
      .set({ authorEmail: cleanEmail })
      .where(like(mcpServers.authorEmail, `%${server.authorEmail}%`));

    console.log(` ✓ Fixed: "${server.authorEmail}" → "${cleanEmail}"`);
    fixed++;
  }

  console.log(`\nDone. Fixed ${fixed} record(s).`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
