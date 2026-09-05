import { NextResponse } from 'next/server';
import { evaluatePolicyRules, DEFAULT_POLICY_RULES } from '@/lib/policyEngine';

/**
 * RevGuard OS — Dual-Sided WhatsApp Inbound Negotiator
 * Processes incoming buyer WhatsApp messages ("Too expensive", "Can I pay next week?"),
 * runs policy validation, and issues dynamic Razorpay discounts or PayLater terms.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { fromPhone, customerName = 'Valued Customer', productName = 'Nykaa Matte Lipstick Box', incomingText = '', amount = 2499, merchantPolicy = DEFAULT_POLICY_RULES } = body;

    const textLower = incomingText.toLowerCase();
    let objectionType = 'GENERAL_INQUIRY';
    let requestedDiscountPct = 0;
    let proposedAction = '';
    let responseText = '';

    // Classify buyer objection
    if (textLower.includes('expensive') || textLower.includes('discount') || textLower.includes('price') || textLower.includes('kam') || textLower.includes('off')) {
      objectionType = 'PRICE_OBJECTION';
      requestedDiscountPct = 10; // AI proposes 10% discount
    } else if (textLower.includes('next week') || textLower.includes('friday') || textLower.includes('later') || textLower.includes('salary') || textLower.includes('payroll')) {
      objectionType = 'TIMING_PAYLATER';
    }

    // Evaluate proposed action against Merchant Policy Engine
    const policyResult = evaluatePolicyRules(
      {
        amount,
        requestedDiscountPct,
        currentRetries: 0,
        channel: 'WHATSAPP_LINK',
      },
      merchantPolicy
    );

    let finalDiscountPct = 0;
    let paymentLinkUrl = `https://rzp.io/rzp/test-${Date.now().toString().slice(-6)}`;

    if (objectionType === 'PRICE_OBJECTION') {
      if (policyResult.allowed) {
        finalDiscountPct = policyResult.sanitizedAction.approvedDiscountPct;
        const discountedAmount = Math.round(amount * (1 - finalDiscountPct / 100));

        responseText = `Namaste ${customerName}! 🙏 We understand! As a special 1-time courtesy, we've applied a ${finalDiscountPct}% discount to your order for "${productName}" (New total: ₹${discountedAmount.toLocaleString('en-IN')}).\n\nPay instantly here:\n${paymentLinkUrl}\n\n-- RevGuard AI Negotiator`;
        proposedAction = `Dynamic ${finalDiscountPct}% Discount Offered for "${productName}" (Amount: ₹${discountedAmount})`;
      } else {
        responseText = `Namaste ${customerName}! 🙏 Thank you for reaching out. Your original payment link for "${productName}" (₹${amount.toLocaleString('en-IN')}) is available here:\n${paymentLinkUrl}`;
        proposedAction = `Discount Vetoed by Merchant Policy: ${policyResult.vetoReason}`;
      }
    } else if (objectionType === 'TIMING_PAYLATER') {
      responseText = `Namaste ${customerName}! 👍 No problem at all. We have recorded your Promise-to-Pay request for "${productName}". Reminders are paused until next week.\n\nHere is your payment link whenever ready:\n${paymentLinkUrl}`;
      proposedAction = `Recorded Promise-to-Pay (P2P) for "${productName}" & Paused Reminders`;
    } else {
      responseText = `Namaste ${customerName}! 🙏 Here is your 1-click Razorpay payment link for "${productName}" (₹${amount.toLocaleString('en-IN')}):\n${paymentLinkUrl}`;
      proposedAction = `Standard 1-Click Recovery Link Issued for "${productName}"`;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      customerPhone: fromPhone,
      objectionType,
      policyVetoPassed: policyResult.allowed,
      policyReason: policyResult.vetoReason || 'Policy Verified',
      finalDiscountPct,
      proposedAction,
      responseText,
      paymentLinkUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
