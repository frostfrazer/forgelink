import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

async function sendPaymentConfirmation(email: string, serverName: string, tier: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return;

  const tierLabel = tier === 'verified' ? 'Verified Badge ($99)' : 'Featured Listing ($199/mo)';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://forgelink-pi.vercel.app';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'ForgeLink <noreply@forgelink-pi.vercel.app>',
      to: email,
      subject: `Payment confirmed — ${tierLabel} activated for ${serverName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#1d4ed8">Payment Confirmed ✓</h2>
          <p>Thanks for upgrading <strong>${serverName}</strong> on ForgeLink!</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;color:#6b7280">Plan</td><td style="padding:8px;font-weight:600">${tierLabel}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:8px;color:#6b7280">Integration</td><td style="padding:8px;font-weight:600">${serverName}</td></tr>
            <tr><td style="padding:8px;color:#6b7280">Status</td><td style="padding:8px;color:#16a34a;font-weight:600">Active</td></tr>
          </table>
          <a href="${APP_URL}/browse" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View your listing →</a>
          <p style="margin-top:24px;color:#9ca3af;font-size:12px">Questions? Reply to this email or contact support@forgelink.io</p>
        </div>
      `,
    }),
  }).catch(e => console.error('Email error:', e));
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Paystack event:', event.event, event.data?.reference);

    if (event.event === 'charge.success') {
      const { metadata, customer, amount, reference } = event.data;
      const { serverId, tier, serverName } = metadata ?? {};

      if (!serverId || !tier) {
        console.error('Missing metadata in webhook:', metadata);
        return NextResponse.json({ received: true });
      }

      // Activate the tier
      if (tier === 'verified') {
        await db.update(mcpServers)
          .set({ isVerified: true, status: 'approved' })
          .where(eq(mcpServers.id, serverId));
        console.log(`✅ Verified activated: ${serverId}`);

      } else if (tier === 'featured') {
        await db.update(mcpServers)
          .set({ isFeatured: true, isVerified: true, status: 'approved' })
          .where(eq(mcpServers.id, serverId));
        console.log(`⭐ Featured activated: ${serverId}`);
      }

      // Send confirmation email
      const email = customer?.email;
      if (email) {
        await sendPaymentConfirmation(email, serverName ?? serverId, tier);
      }
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
