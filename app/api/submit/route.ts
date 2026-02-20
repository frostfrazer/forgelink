import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { mcpServers } from '../../../lib/db/schema';

async function sendNotification(data: {
  name: string;
  authorName: string;
  authorEmail: string;
  category: string;
  protocol: string;
  tier: string;
  githubUrl: string;
}) {
  // Send via Resend if configured, otherwise log
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'hello@forgelink.io';

  if (!RESEND_API_KEY) {
    console.log('ðŸ“¬ New submission (no Resend key):', data);
    return;
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ForgeLink <noreply@forgelink.io>',
      to: NOTIFY_EMAIL,
      subject: `ðŸ”” New Submission: ${data.name} [${data.tier.toUpperCase()}]`,
      html: `
        <h2>New Integration Submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #eee">${data.name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Author</td><td style="padding:8px;border:1px solid #eee">${data.authorName} &lt;${data.authorEmail}&gt;</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Category</td><td style="padding:8px;border:1px solid #eee">${data.category}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Protocol</td><td style="padding:8px;border:1px solid #eee">${data.protocol}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">Tier</td><td style="padding:8px;border:1px solid #eee">${data.tier}</td></tr>
          <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold">GitHub</td><td style="padding:8px;border:1px solid #eee">${data.githubUrl || 'N/A'}</td></tr>
        </table>
        <p style="margin-top:16px">
          <a href="https://forgelink-pi.vercel.app/admin" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
            Review in Admin â†’
          </a>
        </p>
      `,
    }),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const tierNote = body.preferredTier === 'early-bird' ? ' [EARLY BIRD]' :
                     body.preferredTier === 'verified' ? ' [VERIFIED $99]' :
                     ' [FREE REVIEW]';

    const newServer = await db.insert(mcpServers).values({
      name: body.name,
      slug: slug,
      tagline: body.tagline,
      description: body.description,
      category: body.category,
      protocol: body.protocol || 'MCP',
      githubUrl: body.githubUrl || null,
      npmPackage: body.npmPackage || null,
      installCommand: body.installCommand,
      authorName: body.authorName,
      authorEmail: (body.authorEmail || '') + tierNote,
      status: 'pending',
      isVerified: false,
      isFeatured: false,
      viewCount: 0,
      installCount: 0,
      ratingAvg: '0.00',
      ratingCount: 0,
    }).returning();

    // Fire and forget â€” don't block the response
    sendNotification({
      name: body.name,
      authorName: body.authorName,
      authorEmail: body.authorEmail,
      category: body.category,
      protocol: body.protocol || 'MCP',
      tier: body.preferredTier,
      githubUrl: body.githubUrl || '',
    }).catch(err => console.error('Notification failed:', err));

    return NextResponse.json({
      success: true,
      message: 'Integration submitted successfully!',
      server: newServer[0],
      tier: body.preferredTier,
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit integration' },
      { status: 500 }
    );
  }
}
