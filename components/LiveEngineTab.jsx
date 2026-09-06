'use client';

import React, { useState } from 'react';
import { Zap, MessageSquare, Calendar, ArrowRight, ShieldCheck, ExternalLink, CheckCircle2, Smartphone, Send, Globe, RefreshCw } from 'lucide-react';
import WhatsAppModal from './WhatsAppModal';
import RazorpayCheckoutModal from './RazorpayCheckoutModal';

const LANGUAGES = [
  { code: 'hi', label: 'Hindi (Hinglish)', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', flag: '🇮🇳' },
];

export default function LiveEngineTab({ guardrails, onSimulateComplete }) {
  const [selectedModule, setSelectedModule] = useState('module1');
  const [customerName, setCustomerName] = useState('Aarav Patel');
  const [customerPhone, setCustomerPhone] = useState('+919876543210');
  const [amount, setAmount] = useState(2499);
  const [failureCode, setFailureCode] = useState('BAD_REQUEST_PAYMENT_TIMED_OUT');
  const [language, setLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inboundReply, setInboundReply] = useState('Too expensive! Can I get a 10% discount?');

  // Real Twilio WhatsApp Sending state
  const [isSendingTwilio, setIsSendingTwilio] = useState(false);
  const [twilioStatus, setTwilioStatus] = useState(null);

  // WhatsApp Modal state
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);

  // Razorpay Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Trigger Twilio API directly to send real WhatsApp message
  const handleSendRealTwilioWhatsApp = async () => {
    if (!result?.razorpayLink) return;
    setIsSendingTwilio(true);
    setTwilioStatus(null);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: customerPhone,
          customerName: customerName,
          amount: amount,
          paymentLink: result.razorpayLink,
          messageText: result.hinglishDialogue || `Namaste ${customerName}! Please complete your payment of ₹${amount}: ${result.razorpayLink}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTwilioStatus({ success: true, message: data.message, messageSid: data.messageSid });
      } else {
        setTwilioStatus({ success: false, error: data.error || 'Failed to send WhatsApp message' });
      }
    } catch (err) {
      setTwilioStatus({ success: false, error: err.message });
    } finally {
      setIsSendingTwilio(false);
    }
  };

  const handleExecuteIntervention = async () => {
    setLoading(true);
    setResult(null);
    setPaymentDone(false);
    setTwilioStatus(null);

    if (selectedModule === 'module3_negotiator') {
      try {
        const res = await fetch('/api/webhooks/whatsapp-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromPhone: customerPhone,
            customerName: customerName,
            productName: 'Nykaa Matte Lipstick Box',
            incomingText: inboundReply,
            amount: amount,
          }),
        });
        const data = await res.json();
        const combined = {
          success: true,
          event: `INBOUND_REPLY [${data.objectionType}]`,
          diagnosis: `Buyer Objection: "${inboundReply}"`,
          action: data.proposedAction,
          channel: '2-Way WhatsApp Negotiator',
          explainability: data.policyReason,
          hinglishDialogue: data.responseText,
          gateStatus: data.policyVetoPassed ? 'POLICY_PASSED' : 'POLICY_VETOED',
          gateExplanation: data.policyReason,
          razorpayLink: data.paymentLinkUrl,
          isLiveApi: true,
          amount,
          customer: customerName,
          timestamp: new Date().toLocaleTimeString('en-IN'),
        };
        setResult(combined);
        if (onSimulateComplete) onSimulateComplete(combined);
      } catch (err) {
        console.error('Negotiation error:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    let eventType = 'payment.failed';
    if (selectedModule === 'module1_abandoned') eventType = 'checkout.abandoned';
    if (selectedModule === 'module2') eventType = 'subscription.halted';

    try {
      let combinedResult = null;

      try {
        const agentRes = await fetch('/api/agent/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: eventType,
            failure_code: failureCode,
            amount,
            customer_name: customerName,
            customer_phone: customerPhone,
            language,
            max_retries: guardrails?.maxRetries || 2,
            min_voice_amount: guardrails?.minVoiceAmount || 500,
            quiet_hours_start: guardrails?.quietHoursStart || 21,
            quiet_hours_end: guardrails?.quietHoursEnd || 8,
            flash_sale_active: guardrails?.flashSaleActive || false,
          }),
        });
        const agentData = await agentRes.json();

        if (agentData.success && !agentData.fallback) {
          combinedResult = {
            success: true,
            event: agentData.event_type,
            diagnosis: agentData.diagnosis,
            action: agentData.action,
            channel: 'WhatsApp 1-Click Link',
            explainability: agentData.explainability,
            hinglishDialogue: agentData.dialogue,
            isLlmGenerated: true,
            isLangGraph: true,
            language: agentData.language || language,
            riskScore: agentData.risk_score,
            gateStatus: agentData.guardrail_passed ? 'GATED_PASSED' : 'GATED_BLOCKED',
            gateExplanation: agentData.guardrail_reason,
            razorpayLink: agentData.payment_link_url,
            paymentLinkId: agentData.payment_link_id,
            isLiveApi: agentData.payment_link_url?.includes('rzp.io'),
            whatsappSent: agentData.whatsapp_sent,
            agentTrace: agentData.agent_trace,
            auditLog: agentData.audit_log,
            finalStatus: agentData.final_status,
            amount,
            customer: customerName,
            timestamp: agentData.timestamp,
          };
        }
      } catch (agentErr) {
        console.warn('LangGraph agent offline, using fallback:', agentErr.message);
      }

      // Fallback to diagnose + create-link if python agent unreachable
      if (!combinedResult) {
        const diagRes = await fetch('/api/recovery/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType,
            failureCode,
            amount,
            customerName,
            guardrails,
            language,
          }),
        });
        const diagData = await diagRes.json();

        const linkRes = await fetch('/api/razorpay/create-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            customerName,
            customerPhone,
            description: `RevGuard AI Recovery for ${eventType}`,
          }),
        });
        const linkData = await linkRes.json();

        combinedResult = {
          success: true,
          event: eventType,
          diagnosis: diagData.diagnosis,
          action: diagData.action,
          channel: 'WhatsApp 1-Click Link',
          explainability: diagData.explainability,
          hinglishDialogue: diagData.dialogue,
          gateStatus: diagData.gateStatus,
          gateExplanation: diagData.gateExplanation,
          razorpayLink: linkData.paymentLinkUrl,
          paymentLinkId: linkData.paymentLinkId,
          isLiveApi: linkData.isLiveApi,
          whatsappSent: true,
          amount,
          customer: customerName,
          timestamp: new Date().toLocaleTimeString('en-IN'),
        };
      }

      setResult(combinedResult);
      if (onSimulateComplete) {
        onSimulateComplete(combinedResult);
      }
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build clean WhatsApp Web desktop deep link
  const buildWhatsAppWebUrl = () => {
    if (!result?.razorpayLink) return '#';
    const cleanPhone = (customerPhone || '9876543210').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    let messageText = result?.hinglishDialogue;
    if (!messageText) {
      messageText = `Namaste ${customerName}! 🙏\n\nRazorpay RevGuard AI automated recovery link for your pending order ₹${amount.toLocaleString('en-IN')}:\n\nPay instantly via 1-click Razorpay checkout:\n${result.razorpayLink}\n\n-- Razorpay RevGuard Recovery Engine`;
    } else if (!messageText.includes(result.razorpayLink)) {
      messageText = `${messageText}\n\n1-Click Pay Link: ${result.razorpayLink}`;
    }

    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(messageText)}`;
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsappOpen}
        onClose={() => setIsWhatsappOpen(false)}
        customerName={customerName}
        customerPhone={customerPhone}
        amount={amount}
        paymentLink={result?.razorpayLink}
        messageText={result?.hinglishDialogue}
      />

      {/* Razorpay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        customerName={customerName}
        customerPhone={customerPhone}
        amount={amount}
        paymentLinkId={result?.paymentLinkId}
        onPaymentSuccess={() => setPaymentDone(true)}
      />

      {/* Module Selector Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Select Recovery Module</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedModule('module1')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              selectedModule === 'module1'
                ? 'bg-slate-900 border-slate-900 shadow-sm text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`flex items-center space-x-2 mb-1 ${selectedModule === 'module1' ? 'text-indigo-400' : 'text-slate-600'}`}>
              <Zap className="w-4 h-4" />
              <span className="font-semibold text-xs uppercase tracking-wide">Module 1A</span>
            </div>
            <div className={`text-xs font-semibold ${selectedModule === 'module1' ? 'text-white' : 'text-slate-900'}`}>Payment Failure</div>
            <div className={`text-[11px] mt-0.5 ${selectedModule === 'module1' ? 'text-slate-300' : 'text-slate-500'}`}>Bank OTP Timeouts</div>
          </button>

          <button
            onClick={() => setSelectedModule('module1_abandoned')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              selectedModule === 'module1_abandoned'
                ? 'bg-slate-900 border-slate-900 shadow-sm text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`flex items-center space-x-2 mb-1 ${selectedModule === 'module1_abandoned' ? 'text-indigo-400' : 'text-slate-600'}`}>
              <MessageSquare className="w-4 h-4" />
              <span className="font-semibold text-xs uppercase tracking-wide">Module 1B</span>
            </div>
            <div className={`text-xs font-semibold ${selectedModule === 'module1_abandoned' ? 'text-white' : 'text-slate-900'}`}>Checkout Drop-Off</div>
            <div className={`text-[11px] mt-0.5 ${selectedModule === 'module1_abandoned' ? 'text-slate-300' : 'text-slate-500'}`}>Cart Abandonment Nudge</div>
          </button>

          <button
            onClick={() => setSelectedModule('module2')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              selectedModule === 'module2'
                ? 'bg-slate-900 border-slate-900 shadow-sm text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`flex items-center space-x-2 mb-1 ${selectedModule === 'module2' ? 'text-indigo-400' : 'text-slate-600'}`}>
              <Calendar className="w-4 h-4" />
              <span className="font-semibold text-xs uppercase tracking-wide">Module 2</span>
            </div>
            <div className={`text-xs font-semibold ${selectedModule === 'module2' ? 'text-white' : 'text-slate-900'}`}>Mandate Retry</div>
            <div className={`text-[11px] mt-0.5 ${selectedModule === 'module2' ? 'text-slate-300' : 'text-slate-500'}`}>Sub Retry Sequencer</div>
          </button>

          <button
            onClick={() => setSelectedModule('module3_negotiator')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              selectedModule === 'module3_negotiator'
                ? 'bg-slate-900 border-slate-900 shadow-sm text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`flex items-center space-x-2 mb-1 ${selectedModule === 'module3_negotiator' ? 'text-indigo-400' : 'text-slate-600'}`}>
              <Smartphone className="w-4 h-4" />
              <span className="font-semibold text-xs uppercase tracking-wide">Module 3</span>
            </div>
            <div className={`text-xs font-semibold ${selectedModule === 'module3_negotiator' ? 'text-white' : 'text-slate-900'}`}>2-Way Negotiator</div>
            <div className={`text-[11px] mt-0.5 ${selectedModule === 'module3_negotiator' ? 'text-slate-300' : 'text-slate-500'}`}>Buyer Objection AI</div>
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Configure Event Inputs</span>
          </h3>

          <div className="space-y-3.5 text-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name / Organization</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Phone (For WhatsApp)</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+919011037537"
                className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction / Invoice Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Recovery Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedModule === 'module1' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Razorpay Failure Reason</label>
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

            {selectedModule === 'module3_negotiator' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Reply (Objection Input)</label>
                <input
                  type="text"
                  value={inboundReply}
                  onChange={(e) => setInboundReply(e.target.value)}
                  placeholder="e.g. Too expensive! Can I get a 10% discount?"
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs border-indigo-300 focus:border-indigo-500"
                />
              </div>
            )}

            <button
              onClick={handleExecuteIntervention}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Diagnosing & Generating Link...</span>
                </>
              ) : (
                <>
                  <span>Execute Intervention Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output & Audit */}
        <div className="lg:col-span-7 space-y-4">
          {/* LangGraph Pipeline Nodes */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">LangGraph Orchestration Flow</div>
            <div className="flex items-center justify-between text-xs font-semibold overflow-x-auto py-1">
              <span className={`px-2.5 py-1 rounded-md ${loading ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>Detect</span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-md ${loading ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>AI Diagnosis</span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-md ${loading ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>Guardrails</span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-md ${result ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>Execute Link</span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-md ${result ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>Audit</span>
            </div>
          </div>

          {/* AI Result Card */}
          <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Recovery Output & Payment Link</span>
              </span>
              {result && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                  {result.gateStatus || 'GATED_PASSED'}
                </span>
              )}
            </h3>

            {!result ? (
              <div className="py-8 text-center text-slate-500">
                <p className="text-xs font-semibold text-slate-700">Select parameters on the left and click Execute to view live AI recovery results.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Failure Diagnosis */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Failure Diagnosis</div>
                  <div className="font-bold text-slate-900">{result.event}</div>
                  <p className="text-slate-600 text-xs mt-0.5">{result.diagnosis}</p>
                </div>

                {/* Chosen Action */}
                <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Chosen Action</div>
                  <div className="font-bold text-indigo-900">{result.action}</div>
                  <p className="text-indigo-700 text-xs italic">"{result.explainability}"</p>
                </div>

                {/* 1-Click Razorpay Payment Link Card */}
                {result.razorpayLink && (
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">1-Click Razorpay Payment Link</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {result.isLiveApi ? 'Razorpay Test Sandbox' : 'Generated'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800 text-indigo-300 font-mono text-xs truncate flex items-center justify-between border border-slate-700">
                      <span className="truncate mr-2">{result.razorpayLink}</span>
                      <a
                        href={result.razorpayLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <a
                        href={buildWhatsAppWebUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Open & Send on WhatsApp</span>
                      </a>

                      <button
                        onClick={handleSendRealTwilioWhatsApp}
                        disabled={isSendingTwilio}
                        className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingTwilio ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Twilio SMS</span>
                      </button>

                      <button
                        onClick={() => setIsCheckoutOpen(true)}
                        className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700 cursor-pointer"
                      >
                        <span>Test Pay</span>
                      </button>
                    </div>

                    {twilioStatus && (
                      <div className={`p-2 rounded text-[11px] font-mono ${twilioStatus.success ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-rose-950/80 text-rose-300 border border-rose-800'}`}>
                        {twilioStatus.success ? `✓ Twilio WhatsApp sent! SID: ${twilioStatus.messageSid}` : `❌ ${twilioStatus.error}`}
                      </div>
                    )}

                    {paymentDone && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Payment Successfully Verified! Revenue Recovered: ₹{amount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}