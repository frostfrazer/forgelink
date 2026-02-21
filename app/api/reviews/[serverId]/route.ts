import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { reviews } from '../../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  _request: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        reviewerName: reviews.reviewerName,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(eq(reviews.serverId, params.serverId))
      .orderBy(desc(reviews.createdAt))
      .limit(50);

    return NextResponse.json({ reviews: rows });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    return NextResponse.json({ reviews: [] });
  }
}
