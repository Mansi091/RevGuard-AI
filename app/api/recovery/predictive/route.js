import { NextResponse } from 'next/server';

/**
 * RevGuard OS — Proactive Opportunity Predictor Engine
 * Analyzes upcoming card expiries & subscription mandate renewals 7 days in advance.
 */
export async function GET() {
  try {
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const mockProactiveOpportunities = [
      {
        id: 'PRED-8801',
        customerName: 'Karan Malhotra',
        customerPhone: '+919811234567',
        serviceName: 'Enterprise SaaS Annual Plan',
        amount: 14999,
        expiryDate: in7Days.toISOString().split('T')[0],
        daysRemaining: 7,
        riskType: 'CARD_EXPIRING_BEFORE_RENEWAL',
        riskLevel: 'HIGH',
        proactiveAction: 'Send 1-Click Card Update Link',
        recommendedDiscount: 5,
      },
      {
        id: 'PRED-8802',
        customerName: 'Meera Deshmukh',
        customerPhone: '+919899887766',
        serviceName: 'Cloud Hosting Subscription',
        amount: 8999,
        expiryDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysRemaining: 3,
        riskType: 'UPI_MANDATE_END_OF_TERM',
        riskLevel: 'CRITICAL',
        proactiveAction: 'Send Auto-Debit Re-Authorization Link',
        recommendedDiscount: 10,
      },
    ];

    const totalAtRisk = mockProactiveOpportunities.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      opportunityCount: mockProactiveOpportunities.length,
      totalRevenueAtRisk: totalAtRisk,
      opportunities: mockProactiveOpportunities,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
