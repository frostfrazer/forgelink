import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook event:', event.event);

    // Handle successful payment
    if (event.event === 'charge.success') {
      const { metadata } = event.data;
      const { serverId, tier } = metadata;

      if (!serverId || !tier) {
        console.error('Missing metadata:', metadata);
        return NextResponse.json({ received: true });
      }

      try {
        if (tier === 'verified') {
          await db.update(mcpServers)
            .set({
              isVerified: true,
              status: 'approved',
            })
            .where(eq(mcpServers.id, serverId));
          
          console.log(`âœ… Verified badge activated for server: ${serverId}`);

        } else if (tier === 'featured') {
          await db.update(mcpServers)
            .set({
              isFeatured: true,
              isVerified: true,
              status: 'approved',
            })
            .where(eq(mcpServers.id, serverId));
          
          console.log(`â­ Featured listing activated for server: ${serverId}`);
        }

      } catch (dbError) {
        console.error('Database update failed:', dbError);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}