import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { reviews, mcpServers } from '../../../lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { serverId, rating, comment } = await request.json();

    if (!serverId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Insert review (userId is anonymous for now)
    await db.insert(reviews).values({
      serverId,
      userId: '00000000-0000-0000-0000-000000000000', // anonymous
      rating,
      comment: comment || null,
    });

    // Recalculate avg rating on the server
    const allReviews = await db.select().from(reviews).where(eq(reviews.serverId, serverId));
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.update(mcpServers)
      .set({
        ratingAvg: avg.toFixed(1),
        ratingCount: allReviews.length,
      })
      .where(eq(mcpServers.id, serverId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
