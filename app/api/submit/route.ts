import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mcpServers } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Add tier note to email for tracking
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
    
    console.log('New submission:', {
      name: body.name,
      protocol: body.protocol,
      tier: body.preferredTier,
      email: body.authorEmail,
    });
    
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