'use client';

import React, { useState } from 'react';
import { ShoppingBag, CreditCard, Sparkles, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, PhoneCall, Send, RefreshCw, Zap } from 'lucide-react';
import RazorpayCheckoutModal from './RazorpayCheckoutModal';
import WhatsAppModal from './WhatsAppModal';

const MOCK_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Nykaa Luxe Velvet Matte Lipstick & Skincare Kit',
    category: 'Beauty & Cosmetics',
    price: 2499,
    originalPrice: 4999,
    image: '💄',
    tag: '🔥 50% OFF Flash Sale',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Bestselling luxury velvet matte shades + hyaluronic hydrating serum.',
  },
  {
    id: 'prod_2',
    name: 'Boat Rockerz 550 ANC Headphones',
    category: 'Electronics',
    price: 5999,
    originalPrice: 8999,
    image: '🎧',
    tag: '⚡ Flash Sale Deal',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Active Noise Cancellation, 50-hour playback, instant fast charge.',
  },
  {
    id: 'prod_3',
    name: 'RevGuard SaaS Enterprise Annual Subscription',
    category: 'Software / Subscriptions',
    price: 12500,
    originalPrice: 15000,
    image: '🚀',
    tag: 'Mandate Auto-Debit',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: '1-Year Unlimited AI Recovery license for high-volume e-commerce.',
  },
  {
    id: 'prod_4',
    name: 'Apple MacBook Air M3 Workstation Lease',
    category: 'B2B Hardware Invoice',
    price: 85000,
    originalPrice: 95000,
    image: '💻',
    tag: 'B2B Net-14 Invoice',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'B2B Corporate invoice with 14-day Accounts Payable terms.',
  },
];

export default function StoreTab({ guardrails, onSimulateComplete }) {
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [customerName, setCustomerName] = useState('Aarav Patel');
  const [customerPhone, setCustomerPhone] = useState('+919876543210');
  const [language, setLanguage] = useState('hi');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, processing, failed, recovered
  const [recoveryResult, setRecoveryResult] = useState(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isTestPayModalOpen, setIsTestPayModalOpen] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handleSimulateCheckout = async (failureType = 'BAD_REQUEST_PAYMENT_TIMED_OUT') => {
    setCheckoutStep('processing');
    setRecoveryResult(null);
    setPaymentCompleted(false);

    // Simulate 1.5s gateway delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setCheckoutStep('failed');

    // Trigger RevGuard AI Recovery Agent
    try {
      let eventType = 'payment.failed';
      if (failureType === 'USER_EXIT') eventType = 'checkout.abandoned';
      if (failureType === 'B2B_OVERDUE') eventType = 'invoice.overdue';

      const agentRes = await fetch('/api/agent/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          failure_code: failureType,
          amount: selectedProduct.price,
          customer_name: customerName,
          customer_phone: customerPhone,
          language: language,
          max_retries: guardrails?.maxRetries || 2,
          min_voice_amount: guardrails?.minVoiceAmount || 500,
          quiet_hours_start: guardrails?.quietHoursStart || 21,
          quiet_hours_end: guardrails?.quietHoursEnd || 8,
          flash_sale_active: guardrails?.flashSaleActive || false,
        }),
      });

      const agentData = await agentRes.json();
      setRecoveryResult(agentData);
      setCheckoutStep('recovered');

      if (onSimulateComplete) {
        onSimulateComplete({
          customer: customerName,
          amount: selectedProduct.price,
          event: eventType,
          diagnosis: agentData.diagnosis,
          action: agentData.action,
          explainability: agentData.explainability,
          gateExplanation: agentData.guardrail_reason,
          paymentLinkId: agentData.payment_link_id,
          timestamp: agentData.timestamp,
        });
      }
    } catch (err) {
      console.error('Store recovery error:', err);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        customerName={customerName}
        amount={selectedProduct.price}
        paymentUrl={recoveryResult?.payment_link_url}
        messageText={recoveryResult?.dialogue}
        language={language}
      />

      {/* Razorpay Test Modal */}
      <RazorpayCheckoutModal
        isOpen={isTestPayModalOpen}
        onClose={() => setIsTestPayModalOpen(false)}
        customerName={customerName}
        amount={selectedProduct.price}
        paymentLinkId={recoveryResult?.payment_link_id}
        onPaymentSuccess={() => setPaymentCompleted(true)}
      />

      {/* Store Front Header & Midnight Flash Sale Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-sm border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>🔥 NYKAA MIDNIGHT FLASH SALE — LIVE UNTIL 3:00 AM</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 pt-1">
              <span>🛍️ Nykaa & RevStore Mock Merchant Store</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Experience how RevGuard AI intercepts payment failures in real time during late-night flash sales without disturbing sleeping customers!
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-1 text-center shrink-0">
            <div className="text-rose-300 font-bold">Sale Closes In</div>
            <div className="text-lg font-mono font-extrabold text-white">01h : 38m : 14s</div>
            <div className="text-[10px] text-slate-400">Current Time: 2:15 AM (Quiet Hours)</div>
          </div>
        </div>
      </div>

      {/* Product Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_PRODUCTS.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
              selectedProduct.id === product.id
                ? 'bg-white border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{product.image}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${product.badgeColor}`}>
                  {product.tag}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{product.category}</span>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">{product.name}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{product.description}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-extrabold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-slate-400 line-through ml-1.5">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(product);
                  setIsCheckoutOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center space-x-1"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Checkout Simulator Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{selectedProduct.image}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedProduct.name}</h3>
                  <p className="text-xs text-rose-600 font-semibold">Total Amount: ₹{selectedProduct.price.toLocaleString('en-IN')} (Nykaa Flash Sale)</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Shopper Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer WhatsApp Phone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono"
                />
              </div>
            </div>

            {/* Simulated Checkout Buttons */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Simulate Payment Event Scenario (At 2:15 AM)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleSimulateCheckout('BAD_REQUEST_PAYMENT_TIMED_OUT')}
                  disabled={checkoutStep === 'processing'}
                  className="p-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-left transition-all group cursor-pointer space-y-1"
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>💳 Card OTP Timeout</span>
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <p className="text-[11px] text-rose-700">Simulate 3DS OTP timeout failure at 2:15 AM</p>
                </button>

                <button
                  onClick={() => handleSimulateCheckout('USER_EXIT')}
                  disabled={checkoutStep === 'processing'}
                  className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-left transition-all group cursor-pointer space-y-1"
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>🛒 Cart Abandonment</span>
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-[11px] text-amber-700">Simulate user hesitating on payment screen</p>
                </button>
              </div>
            </div>

            {/* Processing State */}
            {checkoutStep === 'processing' && (
              <div className="p-4 rounded-xl bg-slate-900 text-white text-center space-y-2 animate-pulse">
                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                <p className="text-xs font-bold">Contacting HDFC Payment Gateway (Simulated 2:15 AM)...</p>
                <p className="text-[11px] text-slate-400">Verifying 3DS OTP...</p>
              </div>
            )}

            {/* Live Interception & Recovery Result */}
            {checkoutStep === 'recovered' && recoveryResult && (
              <div className="space-y-4 pt-2 border-t border-slate-200 animate-fadeIn">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center space-x-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Transaction Failed: 3DS OTP Verification Timed Out at 2:15 AM</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span>RevGuard AI Intercepted Event (6ms)</span>
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      Event: {recoveryResult.event_type}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-white">Diagnosis: {recoveryResult.diagnosis}</p>
                    <p className="text-slate-300 italic">"{recoveryResult.explainability}"</p>
                    <p className="text-emerald-400 font-mono text-[11px] pt-1">
                      🛡️ {recoveryResult.guardrail_reason}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsWhatsAppOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>View WhatsApp 1-Click Link</span>
                    </button>

                    <button
                      onClick={() => {
                        if (recoveryResult.payment_link_url?.includes('rzp.io')) {
                          window.open(recoveryResult.payment_link_url, '_blank');
                        } else {
                          setIsTestPayModalOpen(true);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Complete 1-Click Pay ₹{selectedProduct.price}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {paymentCompleted && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Payment Successfully Recovered Before 3 AM Sale Expiry!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
