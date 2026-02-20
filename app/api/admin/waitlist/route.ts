import { db } from '../../../../lib/db';
import { waitlist } from '../../../../lib/db/schema';
import { desc } from 'drizzle-orm';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'forgelink_admin_2025';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pwd = searchParams.get('pwd');
  if (pwd !== ADMIN_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }

  const entries = await db.select().from(waitlist).orderBy(desc(waitlist.createdAt));

  const csv = [
    'email,source,signed_up_at',
    ...entries.map(e =>
      `${e.email},${e.source ?? 'unknown'},${e.createdAt?.toISOString() ?? ''}`
    ),
  ].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="forgelink-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
