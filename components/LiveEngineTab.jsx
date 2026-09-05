'use client';

import React, { useState, useEffect } from 'react';
import { Zap, MessageSquare, PhoneCall, Calendar, ArrowRight, ShieldCheck, ExternalLink, CheckCircle2, Volume2, VolumeX, Smartphone, Sparkles, Mic, MicOff, Send, Globe } from 'lucide-react';
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

// Map language codes to Sarvam AI supported codes
const SARVAM_LANG_MAP = {
  hi: 'hi', en: 'en', ta: 'ta', te: 'te', kn: 'kn', mr: 'mr', bn: 'bn', gu: 'gu', ml: 'ml', pa: 'pa',
};

export default function LiveEngineTab({ guardrails, onSimulateComplete }) {
  const [selectedModule, setSelectedModule] = useState('module1');
  const [customerName, setCustomerName] = useState('Aarav Patel');
  const [customerPhone, setCustomerPhone] = useState('+919876543210');
  const [amount, setAmount] = useState(2499);
  const [failureCode, setFailureCode] = useState('BAD_REQUEST_PAYMENT_TIMED_OUT');
  const [language, setLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [p2pDate, setP2pDate] = useState('2026-09-08');

  // Voice Speech Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);

  // Microphone STT Speech Recognition state
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isParsingVoice, setIsParsingVoice] = useState(false);

  // Real Twilio WhatsApp Sending state
  const [isSendingTwilio, setIsSendingTwilio] = useState(false);
  const [twilioStatus, setTwilioStatus] = useState(null);

  // WhatsApp Modal state
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);

  // Razorpay Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Audio element ref for Sarvam playback
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  // Handle Speech Audio Playback — Sarvam AI Bulbul V3 with browser fallback
  const handleSpeakAudio = async (textToSpeak) => {
    // If already playing, stop
    if (isPlayingAudio) {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsLoadingVoice(true);
    setIsPlayingAudio(true);

    try {
      // Try Sarvam AI first
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: SARVAM_LANG_MAP[language] || 'hi',
          speaker: 'priya',
          pace: 1.0,
        }),
      });

      const data = await res.json();

      if (data.success && data.audioBase64) {
        // Decode base64 and play WAV audio
        const audioBytes = Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0));
        const blob = new Blob([audioBytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        setAudioElement(audio);

        audio.onended = () => {
          setIsPlayingAudio(false);
          setIsLoadingVoice(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          setIsLoadingVoice(false);
          URL.revokeObjectURL(url);
        };

        setIsLoadingVoice(false);
        audio.play();
        return;
      }
    } catch (err) {
      console.warn('Sarvam AI voice failed, falling back to browser TTS:', err.message);
    }

    // Fallback to browser SpeechSynthesis
    setIsLoadingVoice(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const cleanText = textToSpeak.replace(/🤖 AI Voice:|👤 Customer:/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = language === 'en' ? 'en-IN' : 'hi-IN';

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  // Microphone Input
  const handleStartMicrophone = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser. Try Google Chrome.');
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';

      recognition.onstart = () => {
        setIsListeningMic(true);
        setVoiceTranscript('Listening... Speak now (e.g. "Main 10 September ko pay karunga")');
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setVoiceTranscript(text);
      };

      recognition.onend = async () => {
        setIsListeningMic(false);
        if (voiceTranscript && !voiceTranscript.startsWith('Listening...')) {
          handleParseVoiceTranscript(voiceTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListeningMic(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningMic(false);
    }
  };

  // Voice transcript parser
  const handleParseVoiceTranscript = async (text) => {
    setIsParsingVoice(true);
    try {
      const res = await fetch('/api/recovery/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (data.extractedDate) {
        setP2pDate(data.extractedDate);
        if (result) {
          setResult({
            ...result,
            hinglishDialogue: `🤖 AI Voice: "Namaste ${customerName}! Razorpay se reminder hai, aapka ₹${amount} ka payment pending hai."\n` +
              `👤 Customer (Voice Mic Input): "${text}"\n` +
              `🤖 AI Voice: "Perfect! Main Promise-to-Pay date ${data.extractedDate} record kar raha hoon."`,
          });
        }
      }
    } catch (err) {
      console.error('Voice parsing error:', err);
    } finally {
      setIsParsingVoice(false);
    }
  };

  // Twilio Real WhatsApp Message
  const handleSendRealWhatsApp = async () => {
    setIsSendingTwilio(true);
    setTwilioStatus(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhoneNumber: customerPhone,
          customerName,
          amount,
          paymentUrl: result?.razorpayLink,
          language,
        }),
      });
      const data = await res.json();
      setTwilioStatus(data);
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

    let eventType = 'payment.failed';
    if (selectedModule === 'module1_abandoned') eventType = 'checkout.abandoned';
    if (selectedModule === 'module2') eventType = 'subscription.halted';
    if (selectedModule === 'module3') eventType = 'invoice.overdue';

    try {
      // Try LangGraph Agent first
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
            channel: agentData.channel,
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
            voiceGenerated: agentData.voice_generated,
            voiceAudioBase64: agentData.voice_audio_base64,
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

      // Fallback to old diagnose + create-link if agent failed
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
          ...diagData,
          hinglishDialogue: diagData.hinglishDialogue,
          razorpayLink: linkData.shortUrl,
          paymentLinkId: linkData.paymentLinkId,
          isLiveApi: linkData.isLiveApi,
          isLangGraph: false,
        };
      }

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

  const handleTestPayClick = () => {
    if (result?.isLiveApi && result?.razorpayLink) {
      window.open(result.razorpayLink, '_blank');
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="space-y-6 text-slate-800">
      {/* WhatsApp Mockup Modal */}
      <WhatsAppModal
        isOpen={isWhatsappOpen}
        onClose={() => setIsWhatsappOpen(false)}
        customerName={customerName}
        amount={amount}
        paymentUrl={result?.razorpayLink}
        messageText={result?.hinglishDialogue}
        language={language}
      />

      {/* Razorpay Test Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        customerName={customerName}
        amount={amount}
        paymentLinkId={result?.paymentLinkId}
        onPaymentSuccess={() => setPaymentDone(true)}
      />

      {/* Module Selector Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Select Recovery Module</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedModule('module1')}
            className={`p-4 rounded-xl border text-left transition-all ${
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
            className={`p-4 rounded-xl border text-left transition-all ${
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
            className={`p-4 rounded-xl border text-left transition-all ${
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
            onClick={() => setSelectedModule('module3')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedModule === 'module3'
                ? 'bg-slate-900 border-slate-900 shadow-sm text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`flex items-center space-x-2 mb-1 ${selectedModule === 'module3' ? 'text-indigo-400' : 'text-slate-600'}`}>
              <PhoneCall className="w-4 h-4" />
              <span className="font-semibold text-xs uppercase tracking-wide">Module 3</span>
            </div>
            <div className={`text-xs font-semibold ${selectedModule === 'module3' ? 'text-white' : 'text-slate-900'}`}>Hinglish Voice B2B</div>
            <div className={`text-[11px] mt-0.5 ${selectedModule === 'module3' ? 'text-slate-300' : 'text-slate-500'}`}>Promise-to-Pay (P2P)</div>
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
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
                placeholder="+919876543210"
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

            {/* Language Selector */}
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

            {selectedModule === 'module3' && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600">Promise-to-Pay (P2P) Due Date</label>

                  <button
                    type="button"
                    onClick={handleStartMicrophone}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isListeningMic
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isListeningMic ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-600" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-slate-600" />
                        <span>Speak to AI</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="date"
                  value={p2pDate}
                  onChange={(e) => setP2pDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
                />

                {voiceTranscript && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-mono">
                    <span className="text-slate-900 font-semibold">Mic Input: </span>
                    <span>"{voiceTranscript}"</span>
                    {isParsingVoice && <span className="ml-2 text-indigo-600 animate-spin">⏳ Parsing...</span>}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleExecuteIntervention}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <span>Executing AI Agent Workflow...</span>
            ) : (
              <>
                <span>Execute Intervention Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Active Guardrails Indicator */}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bounded Guardrails Active</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Max retries: {guardrails?.maxRetries || 2} | Voice Min: ₹{guardrails?.minVoiceAmount || 500}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
          {/* Agent Visual Flow Diagram (IMP: Hackathon Judges Visualizer) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">LangGraph Orchestration Flow</span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
              {[
                { node: "DETECT", label: "Detect Event", icon: "🔍", stepNum: 0 },
                { node: "DIAGNOSE", label: "AI Diagnosis", icon: "🤖", stepNum: 1 },
                { node: "GUARDRAIL", label: "Guardrail Check", icon: "🛡️", stepNum: 2 },
                { node: "EXECUTE", label: "Execute", icon: "⚡", stepNum: 3 },
                { node: "AUDIT", label: "Audit Trail", icon: "📋", stepNum: 4 },
              ].map((step, i, arr) => {
                const isCompleted = result ? true : false;
                const isCurrent = loading && i === 1;
                return (
                  <React.Fragment key={step.node}>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                      isCompleted ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                      isCurrent ? "bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse" :
                      "bg-white text-slate-400 border border-slate-200"
                    }`}>
                      <span>{step.icon}</span>
                      <span>{step.label}</span>
                    </div>
                    {i < arr.length - 1 && <span className="text-slate-300 font-bold shrink-0">→</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AI Recovery Output & Audit Gate</span>
            </h3>

            <div className="flex items-center space-x-1.5">
              {result?.language && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  <Globe className="w-3 h-3 text-slate-500" />
                  <span>{selectedLang.flag} {selectedLang.label}</span>
                </span>
              )}
              {result?.isLangGraph && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-medium bg-slate-900 text-white px-2.5 py-0.5 rounded shadow-xs">
                  <Zap className="w-3 h-3 text-indigo-400" />
                  <span>LangGraph Agent</span>
                </span>
              )}
            </div>
          </div>

          {result ? (
            <div className="space-y-4 animate-fadeIn">
              {paymentDone && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Payment Complete. Recovered: ₹{amount?.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Diagnosis Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Failure Diagnosis</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">{result.event}</span>
                </div>
                <p className="text-xs font-medium text-slate-900">{result.diagnosis}</p>
              </div>

              {/* Action Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chosen Action</span>
                <p className="text-xs font-semibold text-slate-900">{result.action}</p>
                <p className="text-xs text-slate-500 italic">"{result.explainability}"</p>
              </div>

              {/* Voice Conversation Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Voice Bot Conversation</span>
                  </div>

                  <button
                    onClick={() => handleSpeakAudio(result.hinglishDialogue || '')}
                    disabled={isLoadingVoice && !isPlayingAudio}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      isPlayingAudio
                        ? 'bg-rose-600 text-white shadow-xs'
                        : isLoadingVoice
                        ? 'bg-slate-300 text-slate-600 cursor-wait'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </>
                    ) : isLoadingVoice ? (
                      <span>Loading Sarvam AI...</span>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play Voice</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed">
                  {result.hinglishDialogue}
                </div>

                {result.voiceAudioBase64 && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1.5">
                    <p className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                      🎙 Sarvam AI Generated Voice Audio ({selectedLang.label})
                    </p>
                    <audio controls className="w-full h-8">
                      <source src={`data:audio/wav;base64,${result.voiceAudioBase64}`} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>

              {/* Razorpay Test Link & WhatsApp Controls */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-800">Razorpay Payment Link</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSendRealWhatsApp}
                      disabled={isSendingTwilio}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingTwilio ? 'Sending...' : `Send WhatsApp`}</span>
                    </button>

                    <button
                      onClick={() => setIsWhatsappOpen(true)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-all shadow-xs cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {twilioStatus && (
                  <div className="p-2.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                    {twilioStatus.message}
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-mono font-medium truncate mr-2">{result.razorpayLink}</span>
                  <button
                    onClick={handleTestPayClick}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shrink-0 shadow-xs cursor-pointer"
                  >
                    <span>Test Pay</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Audit Gate Summary */}
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
                <span>{result.gateExplanation}</span>
              </div>

              {/* LangGraph Agent Trace */}
              {result?.isLangGraph && result?.agentTrace && result.agentTrace.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">LangGraph Agent Trace</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">{result.agentTrace.length} nodes</span>
                  </div>
                  <div className="space-y-2">
                    {result.agentTrace.map((step, i) => (
                      <div key={i} className="flex items-start space-x-2.5">
                        <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0 bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] font-semibold text-slate-900 font-mono">{step.node}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{step.timestamp?.split('T')[1]?.slice(0, 8)}</span>
                          </div>
                          <p className="text-xs text-slate-600">{step.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl space-y-2">
              <Zap className="w-6 h-6 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Configure parameters on the left and click "Execute Intervention Workflow"</p>
              <p className="text-[11px] text-slate-400 max-w-sm">The agent will diagnose the failure, evaluate guardrail boundaries, and generate recovery actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
