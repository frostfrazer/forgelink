import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendPaymentConfirmation } from '../../../../lib/email';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Paystack event:', event.event, event.data?.reference);

    if (event.event === 'charge.success') {
      const { metadata, customer } = event.data;
      const { serverId, tier, serverName } = metadata ?? {};

      if (!serverId || !tier) {
        console.error('Missing metadata:', metadata);
        return NextResponse.json({ received: true });
      }

      if (tier === 'verified') {
        await db.update(mcpServers)
          .set({ isVerified: true, status: 'approved' })
          .where(eq(mcpServers.id, serverId));
        console.log(`✅ Verified activated: ${serverId}`);

      } else if (tier === 'featured') {
        // Set expiry to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await db.update(mcpServers)
          .set({
            isFeatured: true,
            isVerified: true,
            status: 'approved',
            featuredExpiresAt: expiresAt,
          })
          .where(eq(mcpServers.id, serverId));
        console.log(`⭐ Featured activated until ${expiresAt.toISOString()}: ${serverId}`);
      }

      // Send confirmation via central email lib
      const email = customer?.email;
      if (email) {
        sendPaymentConfirmation({
          email,
          serverName: serverName ?? serverId,
          tier,
          serverId,
        }).catch(err => console.error('Payment email error:', err));
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
