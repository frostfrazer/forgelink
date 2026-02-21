import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { reviews, mcpServers } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { serverId, rating, comment, reviewerName } = await request.json();

    if (!serverId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Verify the server exists and is approved
    const servers = await db.select({ id: mcpServers.id })
      .from(mcpServers)
      .where(eq(mcpServers.id, serverId))
      .limit(1);

    if (!servers[0]) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    await db.insert(reviews).values({
      serverId,
      rating,
      comment: comment?.trim() || null,
      reviewerName: reviewerName?.trim() || 'Anonymous',
    });

    // Recalculate avg rating
    const allReviews = await db.select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.serverId, serverId));

    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.update(mcpServers)
      .set({ ratingAvg: avg.toFixed(2), ratingCount: allReviews.length })
      .where(eq(mcpServers.id, serverId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
