import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await db.update(mcpServers)
      .set({ installCount: sql`${mcpServers.installCount} + 1` })
      .where(eq(mcpServers.id, params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
