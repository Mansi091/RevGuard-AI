/**
 * RevGuard OS — Deterministic Policy-as-Code Engine
 * Zero-dependency policy evaluator that holds strict veto power over AI actions.
 */

export const DEFAULT_POLICY_RULES = {
  version: '1.0.0',
  maxRetriesPerTransaction: 2,
  maxDiscountPercentage: 15, // Max discount AI negotiator can offer
  minOrderAmountForDiscount: 1000, // Minimum order ₹ for discounts
  quietHours: {
    enabled: true,
    startHour: 21, // 9:00 PM
    endHour: 8,   // 8:00 AM
    allowFlashSaleOverride: true,
  },
  autoHaltOnDND: true,
  pauseOnP2PRecord: true,
  allowedChannels: ['WHATSAPP_LINK', 'RAZORPAY_CHECKOUT', 'TWILIO_SMS'],
};

/**
 * Evaluate a proposed AI intervention against strict merchant policy rules.
 * @param {Object} proposal - Proposed action from AI agent
 * @param {Object} policy - Merchant policy rules configuration
 * @returns {Object} { allowed: boolean, vetoReason: string|null, sanitizedAction: Object }
 */
export function evaluatePolicyRules(proposal, policy = DEFAULT_POLICY_RULES) {
  const { amount = 0, hour = new Date().getHours(), isFlashSale = false, isOptedOut = false, currentRetries = 0, requestedDiscountPct = 0, channel = 'WHATSAPP_LINK' } = proposal;

  // Rule 1: DND / Opt-Out Check
  if (policy.autoHaltOnDND && isOptedOut) {
    return {
      allowed: false,
      vetoReason: 'POLICY_VETO: Customer is on DND / Opt-Out list. Outreach blocked to prevent harassment.',
      sanitizedAction: null,
    };
  }

  // Rule 2: Max Retries Exceeded
  if (currentRetries >= policy.maxRetriesPerTransaction) {
    return {
      allowed: false,
      vetoReason: `POLICY_VETO: Transaction retry limit reached (${currentRetries}/${policy.maxRetriesPerTransaction}). Outreach halted by policy.`,
      sanitizedAction: null,
    };
  }

  // Rule 3: Quiet Hours Check
  if (policy.quietHours.enabled && !isFlashSale) {
    const start = policy.quietHours.startHour;
    const end = policy.quietHours.endHour;
    const isQuietTime = start > end ? (hour >= start || hour < end) : (hour >= start && hour < end);

    if (isQuietTime) {
      return {
        allowed: false,
        vetoReason: `POLICY_VETO: Quiet Hours Active (${start}:00 to ${end}:00). Non-urgent outreach postponed until morning compliance window.`,
        sanitizedAction: null,
      };
    }
  }

  // Rule 4: Discount Policy Bounds Check
  let approvedDiscountPct = requestedDiscountPct;
  if (requestedDiscountPct > 0) {
    if (amount < policy.minOrderAmountForDiscount) {
      return {
        allowed: false,
        vetoReason: `POLICY_VETO: Order amount (₹${amount}) below minimum ₹${policy.minOrderAmountForDiscount} threshold required for AI discounts.`,
        sanitizedAction: null,
      };
    }

    if (requestedDiscountPct > policy.maxDiscountPercentage) {
      approvedDiscountPct = policy.maxDiscountPercentage; // Cap to merchant maximum
    }
  }

  // Rule 5: Channel Whitelist Check
  if (policy.allowedChannels && !policy.allowedChannels.includes(channel)) {
    return {
      allowed: false,
      vetoReason: `POLICY_VETO: Channel '${channel}' not in merchant approved channels list.`,
      sanitizedAction: null,
    };
  }

  return {
    allowed: true,
    vetoReason: null,
    sanitizedAction: {
      ...proposal,
      approvedDiscountPct,
      policySignature: `POL-VERIFIED-${Date.now().toString().slice(-6)}`,
    },
  };
}
