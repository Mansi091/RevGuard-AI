import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory store for webhook events (resets on server restart)
// In production, use a database
const webhookEvents = [];
const MAX_EVENTS = 100;

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Parse the payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Validate signature if webhook secret is configured
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    let isSignatureValid = false;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } else {
      // In test/sandbox mode without secret, accept all
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const eventType = payload.event || 'unknown';
    const eventEntity = payload.payload?.payment?.entity || {};

    const bankCode = eventEntity.bank || eventEntity.wallet || eventEntity.vpa || '';
    const rawMethod = eventEntity.method || 'netbanking';

    const BANK_MAP = {
      'HDFC': 'HDFC Bank',
      'ICIC': 'ICICI Bank',
      'SBIN': 'State Bank of India',
      'UTIB': 'Axis Bank',
      'KKBK': 'Kotak Bank',
      'BARB': 'Bank of Baroda',
    };

    const bankName = BANK_MAP[bankCode?.toUpperCase()] || bankCode;
    const methodDetail = bankName ? `${rawMethod} (${bankName})` : rawMethod;

    let customerName = eventEntity.notes?.customer_name || eventEntity.notes?.name || eventEntity.description;
    if (!customerName || customerName === 'Unknown Customer' || customerName.startsWith('plink_') || customerName.includes('Nykaa')) {
      if (eventEntity.email && !eventEntity.email.includes('example.com') && !eventEntity.email.includes('void')) {
        const emailUser = eventEntity.email.split('@')[0];
        customerName = emailUser.charAt(0).toUpperCase() + emailUser.slice(1);
      } else if (eventEntity.contact) {
        customerName = `Customer (${eventEntity.contact})`;
      } else {
        customerName = 'Valued Customer';
      }
    }

    const isCaptured = 
      eventType === 'payment.captured' || 
      eventType === 'payment.authorized' || 
      eventType === 'order.paid' || 
      eventType === 'payment_link.paid' ||
      eventEntity.status === 'captured' || 
      eventEntity.status === 'authorized';

    let failureReason = isCaptured ? 'PAYMENT_SUCCESS' : (eventEntity.error_code || eventEntity.error_reason || 'BANK_DECLINED');
    let errorDescription = eventEntity.error_description;
    if (!errorDescription || errorDescription === 'No description' || isCaptured) {
      if (isCaptured) {
        errorDescription = 'Payment successfully authorized & captured by bank.';
      } else {
        errorDescription = 'Payment was declined by the issuing bank during authentication.';
      }
    }

    // Build a normalized event record
    const eventRecord = {
      id: `WH-${Date.now().toString().slice(-6)}`,
      razorpayEventId: payload.account_id || 'test',
      eventType: eventType,
      timestamp: new Date().toISOString(),
      amount: eventEntity.amount ? eventEntity.amount / 100 : 2499, // Razorpay sends in paise
      currency: eventEntity.currency || 'INR',
      customerName: customerName,
      customerPhone: eventEntity.contact || '+919876543210',
      customerEmail: (eventEntity.email && !eventEntity.email.includes('void')) ? eventEntity.email : 'customer@example.com',
      failureReason: failureReason,
      errorDescription: errorDescription,
      errorSource: eventEntity.error_source || 'bank',
      method: methodDetail,
      bankName: bankName,
      paymentId: eventEntity.id || '',
      orderId: eventEntity.order_id || '',
      status: eventType === 'payment.captured' ? 'PAYMENT_CAPTURED' : 'RECEIVED',
      recoveryTriggered: false,
      recoveryResult: null,
    };

    // Auto-trigger recovery for payment.failed events
    if (eventType === 'payment.failed' && eventRecord.amount > 0) {
      try {
        // Call our own diagnose API internally
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const diagRes = await fetch(`${baseUrl}/api/recovery/diagnose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'payment.failed',
            failureCode: eventRecord.failureReason,
            amount: eventRecord.amount,
            customerName: eventRecord.customerName,
            language: 'hi',
          }),
        });

        if (diagRes.ok) {
          const diagData = await diagRes.json();
          eventRecord.recoveryTriggered = true;
          eventRecord.recoveryResult = {
            diagnosis: diagData.diagnosis,
            action: diagData.action,
            channel: diagData.channel,
            explainability: diagData.explainability,
          };
          eventRecord.status = 'AUTO_RECOVERY_TRIGGERED';

          // Automatically send real WhatsApp message to customer phone via background API!
          if (eventRecord.customerPhone) {
            const payUrl = eventEntity.short_url || `https://rzp.io/rzp/b3Tv2mc`;
            fetch(`${baseUrl}/api/whatsapp/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toPhoneNumber: eventRecord.customerPhone,
                customerName: eventRecord.customerName,
                amount: eventRecord.amount,
                paymentUrl: payUrl,
                language: 'hi',
              }),
            }).then(r => r.json()).then(d => {
              console.log('[Auto-Recovery] Background WhatsApp dispatched:', d);
            }).catch(e => console.warn('[Auto-Recovery] Background WhatsApp failed:', e.message));
          }
        }
      } catch (err) {
        console.warn('Auto-recovery failed for webhook event:', err.message);
        eventRecord.status = 'RECOVERY_FAILED';
      }
    }

    // Store event (FIFO, max 100)
    webhookEvents.unshift(eventRecord);
    if (webhookEvents.length > MAX_EVENTS) {
      webhookEvents.pop();
    }

    return NextResponse.json({
      success: true,
      eventId: eventRecord.id,
      status: eventRecord.status,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET endpoint — returns stored webhook events for the UI to poll
export async function GET() {
  return NextResponse.json({
    success: true,
    events: webhookEvents,
    count: webhookEvents.length,
  });
}
