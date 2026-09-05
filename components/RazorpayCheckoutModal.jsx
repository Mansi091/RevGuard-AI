'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Smartphone, Building2, ArrowRight } from 'lucide-react';

export default function RazorpayCheckoutModal({ isOpen, onClose, customerName, amount, paymentLinkId, onPaymentSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCompletePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onPaymentSuccess) {
          onPaymentSuccess(amount || 2499);
        }
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Checkout Card */}
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden text-gray-100 font-sans">
        {/* Razorpay Brand Top Bar */}
        <div className="bg-[#0b1329] px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs tracking-wider">
              RZP
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white">Razorpay Standard Checkout</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-mono border border-blue-800">
                  TEST MODE
                </span>
              </div>
              <p className="text-[11px] text-gray-400">RevGuard AI Recovery Order</p>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
              <p className="text-sm font-semibold text-emerald-400">₹{amount?.toLocaleString('en-IN') || '2,499'} Received</p>
              <p className="text-xs text-gray-400 font-mono">Ref ID: {paymentLinkId || 'pay_test_9921'}</p>
            </div>
            <p className="text-xs text-cyan-400 bg-cyan-950/60 p-2.5 rounded-lg border border-cyan-800">
              ✓ Revenue marked as RECOVERED in RevGuard AI Dashboard!
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">Total Payable</span>
                <div className="text-2xl font-extrabold text-white">₹{amount?.toLocaleString('en-IN') || '2,499'}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Customer</span>
                <div className="text-xs font-semibold text-gray-200">{customerName || 'Aarav Patel'}</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Select Test Payment Method
              </label>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedMethod === 'upi'
                      ? 'bg-blue-950/50 border-blue-500 text-white shadow-md'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-gray-200">UPI / QR Code</div>
                      <div className="text-[11px] text-gray-500">Google Pay, PhonePe, Paytm (Instant Test)</div>
                    </div>
                  </div>
                  <input type="radio" checked={selectedMethod === 'upi'} readOnly className="text-blue-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedMethod === 'card'
                      ? 'bg-blue-950/50 border-blue-500 text-white shadow-md'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-gray-200">Credit / Debit Card</div>
                      <div className="text-[11px] text-gray-500">Visa, Mastercard, RuPay Test Cards</div>
                    </div>
                  </div>
                  <input type="radio" checked={selectedMethod === 'card'} readOnly className="text-blue-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedMethod === 'netbanking'
                      ? 'bg-blue-950/50 border-blue-500 text-white shadow-md'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold text-gray-200">Netbanking</div>
                      <div className="text-[11px] text-gray-500">HDFC, ICICI, SBI Test Gateway</div>
                    </div>
                  </div>
                  <input type="radio" checked={selectedMethod === 'netbanking'} readOnly className="text-blue-500" />
                </button>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleCompletePayment}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isProcessing ? (
                <span>Authorizing Test Payment...</span>
              ) : (
                <>
                  <span>Simulate Successful Test Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Secured by Razorpay Test Sandbox</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
