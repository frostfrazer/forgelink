import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { mcpServers } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'https://forgelink-pi.vercel.app';

// Prices in kobo/cents (Paystack uses smallest currency unit)
const PRICES: Record<string, number> = {
  verified: 9900,   // $99.00 → 9900 cents
  featured: 19900,  // $199.00 → 19900 cents
};

const PLAN_NAMES: Record<string, string> = {
  verified: 'ForgeLink Verified Badge',
  featured: 'ForgeLink Featured Listing (Monthly)',
};

export async function POST(request: Request) {
  try {
    const { email, tier, serverId, serverName } = await request.json();

    if (!email || !tier || !serverId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const amount = PRICES[tier];
    if (!amount) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    // Resolve slug or UUID → actual server record
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serverId);
    const servers = await db.select({ id: mcpServers.id, name: mcpServers.name, slug: mcpServers.slug, status: mcpServers.status })
      .from(mcpServers)
      .where(isUuid ? eq(mcpServers.id, serverId) : eq(mcpServers.slug, serverId))
      .limit(1);

    const server = servers[0];
    if (!server) {
      return NextResponse.json({ error: `No integration found with ${isUuid ? 'ID' : 'slug'} "${serverId}". Please check your listing URL.` }, { status: 404 });
    }

    const resolvedId = server.id;
    const resolvedName = serverName || server.name || 'My Integration';

    const callbackUrl = `${APP_URL}/payment/success?server_id=${resolvedId}&tier=${tier}`;

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        currency: 'USD',
        callback_url: callbackUrl,
        channels: ['card', 'bank', 'ussd', 'mobile_money'],
        metadata: {
          serverId: resolvedId,
          serverName: resolvedName,
          tier,
          cancel_action: `${APP_URL}/pricing`,
          custom_fields: [
            { display_name: 'Integration', variable_name: 'server_name', value: resolvedName },
            { display_name: 'Plan', variable_name: 'tier', value: tier },
          ],
        },
      }),
    });

    const data = await res.json();

    if (!data.status || !data.data?.authorization_url) {
      console.error('Paystack init failed:', data);
      return NextResponse.json({ error: data.message ?? 'Paystack error' }, { status: 500 });
    }

    return NextResponse.json({
      url: data.data.authorization_url,
      reference: data.data.reference,
    });

  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
  }
}
