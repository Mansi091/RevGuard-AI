// RevGuard AI Data Catalog & Helper Data

export const INITIAL_METRICS = {
  totalRisk: 148500,
  totalRecovered: 112400,
  recoveryRate: 75.7,
  activeInterventions: 8,
  failedCount: 42,
  recoveredCount: 31,
  stoppedCount: 7,
};

export const INITIAL_GUARDRAILS = {
  maxRetries: 2,
  quietHoursStart: 21, // 9 PM
  quietHoursEnd: 8,   // 8 AM
  minVoiceAmount: 500, // ₹500 minimum for voice calls
  autoHaltOnDND: true,
  autoHaltOnP2P: true,
  flashSaleActive: false, // 🔥 Flash Sale Mode override toggle
  fallbackChannel: "whatsapp_upi",
};

export const FAILURE_REASONS = [
  {
    code: "BAD_REQUEST_PAYMENT_TIMED_OUT",
    label: "Bank OTP Timed Out",
    type: "technical",
    recommendation: "Send instant WhatsApp UPI 1-click link",
    channel: "WhatsApp UPI",
  },
  {
    code: "INSUFFICIENT_FUNDS",
    label: "Insufficient Card Funds",
    type: "financial",
    recommendation: "Offer EMI or schedule mandate retry on payday (1st/5th of month)",
    channel: "Scheduled Retry + SMS",
  },
  {
    code: "GATEWAY_DOWNTIME",
    label: "Bank Gateway Offline",
    type: "technical",
    recommendation: "Halt retries for 30 mins, retry automatically when bank recovers",
    channel: "Smart Gateway Retry",
  },
  {
    code: "CHECKOUT_ABANDONED",
    label: "Cart Abandoned at Payment Step",
    type: "hesitation",
    recommendation: "Hinglish Voice call + ₹100 instant checkout discount link",
    channel: "Hinglish AI Voice Bot",
  },
  {
    code: "B2B_INVOICE_OVERDUE",
    label: "Invoice Overdue 14+ Days",
    type: "b2b",
    recommendation: "Initiate Conversational Voice Reminder & capture Promise-to-Pay (P2P) date",
    channel: "B2B Voice Chaser",
  },
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: "LOG-1001",
    timestamp: "2026-09-04 15:30:12",
    customer: "Vikram Sharma (SaaS Pro Plan)",
    amount: 2499,
    event: "subscription.halted",
    diagnosis: "Bank Gateway Timeout during auto-debit",
    action: "Scheduled Smart Mandate Retry (+4 hrs) + WhatsApp Nudge",
    explainability: "Technical bank failure detected. Card funds present. Smart retry avoids burning mandate retries.",
    gate: "Max retries: 1/2. Within quiet hours rule.",
    status: "RECOVERED",
    recoveredAmount: 2499,
    razorpayLinkId: "plink_Rz918239x12",
  },
  {
    id: "LOG-1002",
    timestamp: "2026-09-04 14:45:00",
    customer: "Ananya Roy (Order #8849)",
    amount: 5999,
    event: "checkout.abandoned",
    diagnosis: "OTP screen exited after 45s hesitation",
    action: "Hinglish AI Voice Nudge triggered -> Razorpay UPI Link sent",
    explainability: "High order value (₹5,999 > ₹500 threshold). Interactive voice confirmed user pre-approved UPI.",
    gate: "Customer agreed via Voice. Gated money action passed.",
    status: "RECOVERED",
    recoveredAmount: 5999,
    razorpayLinkId: "plink_Rz774102y99",
  },
  {
    id: "LOG-1003",
    timestamp: "2026-09-04 13:10:44",
    customer: "Apex Tech Solutions (Inv #INV-2026-08)",
    amount: 45000,
    event: "invoice.overdue",
    diagnosis: "Overdue 12 days. Accounts Payable delay",
    action: "B2B Voice Call -> Recorded Promise-to-Pay for Sept 7th",
    explainability: "Client requested Friday payment due to payroll cycle. Workflow paused until Sept 7th.",
    gate: "Auto-Halt on P2P rule enforced. Reminders muted.",
    status: "P2P_RECORDED",
    recoveredAmount: 0,
    razorpayLinkId: "inv_Rz440912p88",
  },
  {
    id: "LOG-1004",
    timestamp: "2026-09-04 11:20:19",
    customer: "Rahul Verma (Order #8830)",
    amount: 899,
    event: "payment.failed",
    diagnosis: "Invalid CVV attempt x2",
    action: "Halted recovery after 2 SMS attempts (Unresponsive)",
    explainability: "Maximum retry limit reached (2/2). DND/No-spam guardrail stopped further outreach.",
    gate: "STOPPING RULE TRIGGERED: Max Retries Exhausted",
    status: "STOPPED",
    recoveredAmount: 0,
    razorpayLinkId: "N/A",
  },
];

export const SYNTHETIC_50_BATCH = Array.from({ length: 50 }, (_, i) => {
  // Force specific variety in first 5 records for impressive live demo
  if (i === 0) return { id: "BATCH-100", index: 1, customer: "Aarav Patel (#REF-2000)", event: "payment.failed", amount: 2499, status: "RECOVERED", recoveredAmount: 2499, reason: "Recovered via 1-click Razorpay UPI Payment Link", gate: "Guardrail Passed: Bounded & Gated", timestamp: "2026-09-05 10:40:12" };
  if (i === 1) return { id: "BATCH-101", index: 2, customer: "High-Net-Worth Buyer (#REF-2001)", event: "checkout.abandoned", amount: 85000, status: "RECOVERED", recoveredAmount: 85000, reason: "Recovered via AI Voice Call + Razorpay UPI Link", gate: "Guardrail Passed: High Value Voice Outreach", timestamp: "2026-09-05 10:35:00" };
  if (i === 2) return { id: "BATCH-102", index: 3, customer: "TechCorp Enterprise (#REF-2002)", event: "invoice.overdue", amount: 250000, status: "P2P_RECORDED", recoveredAmount: 0, reason: "Promise-to-Pay date secured for next week", gate: "Guardrail Passed: Intervention Halted until P2P Date", timestamp: "2026-09-05 10:20:15" };
  if (i === 3) return { id: "BATCH-103", index: 4, customer: "Rohan Mehta (#REF-2003)", event: "payment.failed", amount: 499, status: "STOPPED", recoveredAmount: 0, reason: "Low value, no voice nudge triggered", gate: "STOPPING RULE ENFORCED: Below Voice Threshold", timestamp: "2026-09-05 10:10:00" };
  if (i === 4) return { id: "BATCH-104", index: 5, customer: "SaaS Pro Subscriber (#REF-2004)", event: "subscription.halted", amount: 12500, status: "RECOVERED", recoveredAmount: 12500, reason: "Smart mandate retry scheduled + WhatsApp link sent", gate: "Guardrail Passed: Mandate Auto-Retry", timestamp: "2026-09-05 09:55:22" };

  const types = ["payment.failed", "subscription.halted", "checkout.abandoned", "invoice.overdue"];
  const event = types[i % types.length];
  // Higher value transactions for impressive demo (includes Lakhs)
  const amounts = [499, 1299, 2499, 4999, 12500, 25000, 85000, 150000, 250000, 500000];
  const amount = amounts[i % amounts.length];
  const names = [
    "Aarav Patel", "Diya Sharma", "Rohan Mehta", "Priya Singh", "Karan Malhotra",
    "Sneha Reddy", "Amitabh Das", "Neha Gupta", "Varun Nair", "Pooja Joshi",
    "TechCorp Ltd", "Nexus Media", "Starlight AI", "UrbanFit Studio", "Zenith Retail"
  ];
  const customer = `${names[i % names.length]} (#REF-${2000 + i})`;

  // Synthetic outcome distribution
  let status = "RECOVERED";
  let recAmount = amount;
  let reason = "Recovered via 1-click Razorpay UPI Payment Link";
  let gate = "Guardrail Passed: Bounded & Gated";

  if (i % 7 === 0) {
    status = "STOPPED";
    recAmount = 0;
    reason = "Customer declined intervention or marked DND";
    gate = "STOPPING RULE ENFORCED: DND / Customer Opt-out";
  } else if (i % 11 === 0) {
    status = "STOPPED";
    recAmount = 0;
    reason = "Max outreach retries (2/2) reached without response";
    gate = "STOPPING RULE ENFORCED: Retry Boundary Limit";
  } else if (i % 5 === 0 && event === "invoice.overdue") {
    status = "P2P_RECORDED";
    recAmount = 0;
    reason = "Promise-to-Pay date secured for next week";
    gate = "Guardrail Passed: Intervention Halted until P2P Date";
  }

  return {
    id: `BATCH-${100 + i}`,
    index: i + 1,
    customer,
    event,
    amount,
    status,
    recoveredAmount: recAmount,
    reason,
    gate,
    timestamp: new Date(Date.now() - (50 - i) * 3600000).toISOString().replace("T", " ").substring(0, 19),
  };
});
