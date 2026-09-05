import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, customerName, customerPhone, customerEmail, description, keyId, keySecret } = body;

    const numAmount = Number(amount) || 1000;
    const amountInPaisa = Math.round(numAmount * 100);
    const referenceId = `rev_rec_${Date.now()}`;

    // Active Razorpay Credentials
    const activeKey = keyId || process.env.RAZORPAY_KEY_ID;
    const activeSecret = keySecret || process.env.RAZORPAY_KEY_SECRET;

    // Only attempt live Razorpay API call if real credentials (not placeholders) are provided
    if (activeKey && activeSecret && activeKey !== 'rzp_test_xxxxxxx' && activeSecret !== '••••••••••••••••') {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${activeKey}:${activeSecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/payment_links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaisa,
            currency: 'INR',
            accept_partial: false,
            description: description || 'RevGuard AI Revenue Recovery Link',
            customer: {
              name: customerName || 'Valued Customer',
              contact: customerPhone || '+919876543210',
              email: customerEmail || 'customer@example.com',
            },
            notify: {
              sms: true,
              email: true,
            },
            reminder_enable: true,
            notes: {
              source: 'RevGuard_AI_Recovery_Agent',
              reference_id: referenceId,
            },
            callback_url: 'http://localhost:3000',
            callback_method: 'get',
          }),
        });

        const data = await rzpResponse.json();
        if (rzpResponse.ok && data.short_url) {
          return NextResponse.json({
            success: true,
            paymentLinkId: data.id,
            shortUrl: data.short_url,
            status: data.status,
            amount: data.amount / 100,
            isLiveApi: true,
          });
        }
      } catch (err) {
        console.warn('Razorpay API call failed, switching to internal test checkout simulator:', err);
      }
    }

    // High-fidelity local sandbox link
    const simulatedId = `plink_${Math.random().toString(36).substring(2, 10)}`;
    const simulatedUrl = `http://localhost:3000?pay=${simulatedId}&amount=${numAmount}`;

    return NextResponse.json({
      success: true,
      paymentLinkId: simulatedId,
      shortUrl: simulatedUrl,
      status: 'created',
      amount: numAmount,
      isLiveApi: false,
      message: 'Razorpay Test Sandbox Link Generated',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
