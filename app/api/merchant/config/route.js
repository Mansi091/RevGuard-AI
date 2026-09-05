import { NextResponse } from 'next/server';

// Default merchant guardrail configurations store
let merchantConfigs = {
  merchant_default: {
    merchantId: 'merchant_default',
    merchantName: 'Aarav Enterprise',
    maxRetries: 2,
    minVoiceAmount: 500,
    quietHoursStart: 21,
    quietHoursEnd: 8,
    autoHaltOnDnd: true,
    allowedLanguages: ['hi', 'en', 'ta', 'te', 'kn', 'mr', 'bn', 'gu'],
  },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get('merchantId') || 'merchant_default';
  const config = merchantConfigs[merchantId] || merchantConfigs['merchant_default'];

  return NextResponse.json({
    success: true,
    merchantId,
    config,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { merchantId = 'merchant_default', ...updates } = body;

    const existing = merchantConfigs[merchantId] || merchantConfigs['merchant_default'];
    merchantConfigs[merchantId] = {
      ...existing,
      ...updates,
      merchantId,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      merchantId,
      config: merchantConfigs[merchantId],
      message: 'Merchant configuration updated successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update merchant config' },
      { status: 500 }
    );
  }
}
