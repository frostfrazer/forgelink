import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';
import { sendSubmissionNotification, sendSubmissionConfirmation } from '../../../lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const [newServer] = await db.insert(mcpServers).values({
      name: body.name,
      slug,
      tagline: body.tagline,
      description: body.description,
      category: body.category,
      protocol: body.protocol || 'MCP',
      githubUrl: body.githubUrl || null,
      npmPackage: body.npmPackage || null,
      installCommand: body.installCommand,
      authorName: body.authorName,
      authorEmail: body.authorEmail || '',
      status: 'pending',
      isVerified: false,
      isFeatured: false,
      viewCount: 0,
      installCount: 0,
      ratingAvg: '0.00',
      ratingCount: 0,
    }).returning();

    // Fire both emails — don't block the response
    Promise.all([
      sendSubmissionNotification({
        name: body.name,
        authorName: body.authorName,
        authorEmail: body.authorEmail,
        category: body.category,
        protocol: body.protocol || 'MCP',
        tier: body.preferredTier,
        githubUrl: body.githubUrl || '',
        id: newServer.id,
      }),
      sendSubmissionConfirmation({
        authorName: body.authorName,
        authorEmail: body.authorEmail,
        name: body.name,
        tier: body.preferredTier,
      }),
    ]).catch(err => console.error('[submit] Email error:', err));

    return NextResponse.json({ success: true, server: newServer, tier: body.preferredTier });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit integration' }, { status: 500 });
  }
}
