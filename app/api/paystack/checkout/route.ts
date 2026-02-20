import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, tier, serverId, serverName } = body;

    const prices: Record<string, number> = {
      verified: 9900,   // $99 in cents
      featured: 19900,  // $199 in cents
    };

    const descriptions: Record<string, string> = {
      verified: 'Verified Badge - Priority placement on ForgeLink',
      featured: 'Featured Listing - Top placement on ForgeLink (Monthly)',
    };

    const amount = prices[tier];
    if (!amount) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack uses kobo/cents
        currency: 'USD',
        metadata: {
          serverId,
          serverName,
          tier,
          custom_fields: [
            {
              display_name: 'Integration Name',
              variable_name: 'server_name',
              value: serverName,
            },
            {
              display_name: 'Tier',
              variable_name: 'tier',
              value: tier,
            },
          ],
        },
        callback_url: `${process.env.NEXTAUTH_URL}/payment/success?server_id=${serverId}&tier=${tier}`,
        channels: ['card', 'bank', 'ussd', 'mobile_money'],
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Paystack initialization failed');
    }

    return NextResponse.json({
      success: true,
      url: data.data.authorization_url,
      reference: data.data.reference,
    });

  } catch (error) {
    console.error('Paystack error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}