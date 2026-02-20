import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { waitlist } from '../../../lib/db/schema';

export async function POST(req: Request) {
  try {
    const { email, source = 'homepage' } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    await db.insert(waitlist).values({ email: email.toLowerCase().trim(), source })
      .onConflictDoNothing();

    // Notify via Resend if configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
    if (RESEND_API_KEY && NOTIFY_EMAIL) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'ForgeLink <noreply@forgelink-pi.vercel.app>',
          to: NOTIFY_EMAIL,
          subject: `New waitlist signup: ${email}`,
          html: `<p><strong>${email}</strong> joined the ForgeLink waitlist (source: ${source})</p>`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
