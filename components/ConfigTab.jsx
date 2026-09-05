'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Key, Lock, CheckCircle2, Save } from 'lucide-react';

export default function ConfigTab({ guardrails, setGuardrails }) {
  const [keyId, setKeyId] = useState('rzp_test_xxxxxxx');
  const [keySecret, setKeySecret] = useState('••••••••••••••••');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Guardrails & Razorpay API Configuration</span>
        </h2>
        <p className="text-xs text-slate-500">
          Configure financial boundary safety limits, quiet-hour compliance, and your Razorpay Sandbox Test API credentials.
        </p>
      </div>

      <form onSubmit={handleSaveConfig} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Guardrails Card */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bounded Financial Safety Rules</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Maximum Outreach Attempts (Per Transaction)
              </label>
              <input
                type="number"
                min="1"
                max="3"
                value={guardrails.maxRetries}
                onChange={(e) => setGuardrails({ ...guardrails, maxRetries: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg glass-input"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Strict limit: Agent will automatically stop further nudges after this number to prevent customer spam.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quiet Hours Start</label>
                <select
                  value={guardrails.quietHoursStart}
                  onChange={(e) => setGuardrails({ ...guardrails, quietHoursStart: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input"
                >
                  <option value={20}>8:00 PM (20:00)</option>
                  <option value={21}>9:00 PM (21:00)</option>
                  <option value={22}>10:00 PM (22:00)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quiet Hours End</label>
                <select
                  value={guardrails.quietHoursEnd}
                  onChange={(e) => setGuardrails({ ...guardrails, quietHoursEnd: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg glass-input"
                >
                  <option value={7}>7:00 AM (07:00)</option>
                  <option value={8}>8:00 AM (08:00)</option>
                  <option value={9}>9:00 AM (09:00)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Minimum Order Amount for Voice Bot Nudges (₹)
              </label>
              <input
                type="number"
                value={guardrails.minVoiceAmount}
                onChange={(e) => setGuardrails({ ...guardrails, minVoiceAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg glass-input"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Voice calls only trigger for transactions above this value to optimize outreach unit economics.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="flex items-center space-x-2 text-slate-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardrails.autoHaltOnDND}
                  onChange={(e) => setGuardrails({ ...guardrails, autoHaltOnDND: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Auto-Halt on DND / Opt-Out signal</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardrails.autoHaltOnP2P}
                  onChange={(e) => setGuardrails({ ...guardrails, autoHaltOnP2P: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Pause Reminders on Promise-to-Pay (P2P) Record</span>
              </label>

              {/* 🔥 Flash Sale Mode Toggle */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 mt-2">
                <input
                  type="checkbox"
                  id="flashSaleMode"
                  checked={guardrails.flashSaleActive || false}
                  onChange={(e) => setGuardrails(prev => ({
                    ...prev,
                    flashSaleActive: e.target.checked
                  }))}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer shrink-0"
                />
                <label htmlFor="flashSaleMode" className="text-xs font-semibold text-slate-900 cursor-pointer">
                  <span className="flex items-center gap-1 text-amber-900 font-bold">🔥 Flash Sale Mode</span>
                  <span className="block text-[11px] text-slate-600 font-normal mt-0.5">
                    Suspend quiet hours during time-limited sales (e.g. Nykaa 3 AM Flash Sale)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Razorpay Credentials Card */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Key className="w-4 h-4 text-blue-600" />
            <span>Razorpay Sandbox Keys</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                placeholder="rzp_test_..."
                className="w-full px-3 py-2 rounded-lg glass-input font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Razorpay Key Secret</label>
              <input
                type="password"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-lg glass-input font-mono"
              />
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Test Mode Sandbox Active</span>
              </div>
              <p className="text-slate-600">
                RevGuard AI uses Razorpay's official <code className="font-mono bg-blue-100 px-1 rounded">/v1/payment_links</code> API for test mode link creation and payment webhooks.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Guardrails & Config</span>
          </button>

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Guardrails and sandbox config saved successfully!</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
