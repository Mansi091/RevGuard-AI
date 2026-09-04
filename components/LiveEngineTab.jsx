'use client';

import React, { useState } from 'react';
import { Zap, MessageSquare, PhoneCall, Calendar, ArrowRight, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LiveEngineTab({ guardrails, onSimulateComplete }) {
  const [selectedModule, setSelectedModule] = useState('module1');
  const [customerName, setCustomerName] = useState('Aarav Patel');
  const [amount, setAmount] = useState(2499);
  const [failureCode, setFailureCode] = useState('BAD_REQUEST_PAYMENT_TIMED_OUT');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [p2pDate, setP2pDate] = useState('2026-09-08');

  const handleExecuteIntervention = async () => {
    setLoading(true);
    setResult(null);

    let eventType = 'payment.failed';
    if (selectedModule === 'module1_abandoned') eventType = 'checkout.abandoned';
    if (selectedModule === 'module2') eventType = 'subscription.halted';
    if (selectedModule === 'module3') eventType = 'invoice.overdue';

    try {
      // Step 1: Diagnose
      const diagRes = await fetch('/api/recovery/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          failureCode,
          amount,
          customerName,
          guardrails,
        }),
      });
      const diagData = await diagRes.json();

      // Step 2: Create Razorpay Link
      const linkRes = await fetch('/api/razorpay/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          customerName,
          description: `RevGuard AI Recovery for ${eventType}`,
        }),
      });
      const linkData = await linkRes.json();

      const combinedResult = {
        ...diagData,
        razorpayLink: linkData.shortUrl,
        paymentLinkId: linkData.paymentLinkId,
        isLiveApi: linkData.isLiveApi,
      };

      setResult(combinedResult);
      if (onSimulateComplete) {
        onSimulateComplete(combinedResult);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Selector Bar */}
      <div className="glass-panel p-4 rounded-xl border border-gray-800/80">
        <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Select Recovery Module</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedModule('module1')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedModule === 'module1'
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="font-bold text-sm">Module 1A</span>
            </div>
            <div className="text-xs font-semibold text-white">Payment Failure</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Bank OTP Timeouts</div>
          </button>

          <button
            onClick={() => setSelectedModule('module1_abandoned')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedModule === 'module1_abandoned'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="font-bold text-sm">Module 1B</span>
            </div>
            <div className="text-xs font-semibold text-white">Checkout Drop-Off</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Cart Abandonment Nudge</div>
          </button>

          <button
            onClick={() => setSelectedModule('module2')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedModule === 'module2'
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="font-bold text-sm">Module 2</span>
            </div>
            <div className="text-xs font-semibold text-white">Mandate Retry</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Sub Retry Sequencer</div>
          </button>

          <button
            onClick={() => setSelectedModule('module3')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedModule === 'module3'
                ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-500/10'
                : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2 text-purple-400 mb-1">
              <PhoneCall className="w-4 h-4" />
              <span className="font-bold text-sm">Module 3</span>
            </div>
            <div className="text-xs font-semibold text-white">Hinglish Voice B2B</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Promise-to-Pay (P2P)</div>
          </button>
        </div>
      </div>

      {/* Main Execution Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Simulator Controls */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-gray-800/80 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Configure Event Inputs</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Customer Name / Organization</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Transaction / Invoice Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            {selectedModule === 'module1' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Razorpay Failure Reason</label>
                <select
                  value={failureCode}
                  onChange={(e) => setFailureCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                >
                  <option value="BAD_REQUEST_PAYMENT_TIMED_OUT">BAD_REQUEST_PAYMENT_TIMED_OUT (Bank Timeout)</option>
                  <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (Card Limit Declined)</option>
                  <option value="GATEWAY_DOWNTIME">GATEWAY_DOWNTIME (Bank Gateway Offline)</option>
                </select>
              </div>
            )}

            {selectedModule === 'module3' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Promise-to-Pay (P2P) Due Date</label>
                <input
                  type="date"
                  value={p2pDate}
                  onChange={(e) => setP2pDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleExecuteIntervention}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Running AI Recovery Logic...</span>
            ) : (
              <>
                <span>Execute Intervention Workflow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Active Guardrails Indicator */}
          <div className="pt-2 border-t border-gray-800/60 text-xs text-gray-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bounded Guardrails Enforced</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Max outreach retries: {guardrails?.maxRetries || 2} | Voice Min Amount: ₹{guardrails?.minVoiceAmount || 500}
            </p>
          </div>
        </div>

        {/* Right Column: AI Output & Live Razorpay Link Generator */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-gray-800/80 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Recovery Output & Audit Gate</span>
          </h3>

          {result ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Diagnosis Box */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Failure Diagnosis</span>
                  <span className="text-xs bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded-md font-mono">{result.event}</span>
                </div>
                <p className="text-sm text-gray-200">{result.diagnosis}</p>
              </div>

              {/* Explainability & Action Box */}
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Chosen Action & Explainability</span>
                <p className="text-sm font-semibold text-white">{result.action}</p>
                <p className="text-xs text-gray-400 italic">"{result.explainability}"</p>
              </div>

              {/* Hinglish Voice Call Simulator Preview (Module 3) */}
              {selectedModule === 'module3' && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                    <span className="text-xs font-bold uppercase">Hinglish Voice Bot Conversation Log</span>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-950 text-xs font-mono space-y-1.5 text-gray-300">
                    <p className="text-purple-300">🤖 AI Voice: "Namaste {result.customer}! Razorpay se reminder hai, aapka ₹{result.amount} ka payment pending hai."</p>
                    <p className="text-gray-400">👤 Customer: "Haan main {p2pDate} ko pay kar dunga."</p>
                    <p className="text-emerald-400">🤖 AI Voice: "Perfect! Main Promise-to-Pay date {p2pDate} record kar raha hoon. WhatsApp par link bhej diya hai."</p>
                  </div>
                </div>
              )}

              {/* Razorpay Test Link Output */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">Razorpay Test Payment Link Generated</span>
                  </div>
                  <span className="text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded uppercase font-mono">
                    {result.isLiveApi ? 'Live API' : 'Test Sandbox'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-gray-950 border border-emerald-900/60 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-mono truncate mr-2">{result.razorpayLink}</span>
                  <a
                    href={result.razorpayLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold transition-all"
                  >
                    <span>Test Pay</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Audit Gate Summary */}
              <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{result.gateExplanation}</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-800 rounded-xl space-y-2">
              <Zap className="w-8 h-8 text-gray-600 animate-pulse" />
              <p className="text-sm font-medium text-gray-400">Configure parameters on the left and click "Execute Intervention Workflow"</p>
              <p className="text-xs text-gray-400 max-w-sm">The agent will diagnose the failure, evaluate boundary rules, and generate a dynamic Razorpay payment link.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
