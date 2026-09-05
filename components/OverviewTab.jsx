'use client';

import React, { useState } from 'react';
import { TrendingUp, ShieldAlert, ArrowUpRight, CheckCircle2, Clock, Zap, ExternalLink, RefreshCw } from 'lucide-react';

export default function OverviewTab({ metrics, auditLogs, onSimulateEvent, onNavigateTab }) {
  const [loadingEvent, setLoadingEvent] = useState(null);

  const handleSimulate = async (eventType) => {
    setLoadingEvent(eventType);
    await onSimulateEvent(eventType);
    setLoadingEvent(null);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Sleek Hero Banner */}
      <div className="relative overflow-hidden rounded-xl px-5 py-4 bg-slate-900 text-white shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Autonomous AI Revenue Recovery Engine</span>
          </h1>
          <div className="flex items-center space-x-4 shrink-0">
            <button
              onClick={() => onNavigateTab('live-engine')}
              className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer"
            >
              <span>🚀 Run Live Demo →</span>
            </button>
            <button
              onClick={() => onNavigateTab('webhooks')}
              className="flex items-center space-x-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <span>Razorpay Webhooks</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Revenue at Risk</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">₹{metrics.totalRisk.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">{metrics.failedCount} Failed Transactions</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Money Recovered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600">₹{metrics.totalRecovered.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">{metrics.recoveredCount} Successful Recoveries</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recovery Rate</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{metrics.recoveryRate}%</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Measured across active batch</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Stopping Rules</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{metrics.stoppedCount} Halted</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Zero False-Positive Spams</p>
          </div>
        </div>
      </div>

      {/* High-Value Recovery Highlight */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            ✓
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-xs text-emerald-900">₹2,49,999 Enterprise Mandate Recovered</p>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Vikram Sharma's SaaS subscription mandate failed at 2:15 AM during bank maintenance. RevGuard AI diagnosed gateway timeout, auto-dispatched a silent WhatsApp 1-click payment link, and recovered the sale in 3 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Proactive Opportunity Prediction Engine (Pillar 1) */}
      <div className="bg-indigo-900 text-white rounded-xl p-4 shadow-sm border border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-indigo-200 text-xs font-bold shrink-0 mt-0.5">
            🔮
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-white">Proactive Predictor: 2 Cards Expiring in 7 Days</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-800 text-indigo-300 font-mono font-semibold">₹23,998 AT RISK</span>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed mt-0.5">
              RevGuard AI proactively detected 2 upcoming card expiries before payment failure occurs. Pre-emptive renewal links ready to dispatch.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('live-engine')}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-all cursor-pointer"
        >
          Dispatch Proactive Links →
        </button>
      </div>

      {/* Quick Simulation Bar */}
      <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Simulate Live Payment Events</h3>
            <p className="text-xs text-slate-500">Trigger real-time webhook events to evaluate AI diagnosis & Razorpay link generation.</p>
          </div>
          <button
            onClick={() => onNavigateTab('live-engine')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center space-x-1"
          >
            <span>Open Live Engine</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleSimulate('payment.failed')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900">Payment Failed</div>
              <div className="text-[10px] text-slate-500">Bank OTP Timeout</div>
            </div>
            {loadingEvent === 'payment.failed' ? (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('checkout.abandoned')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900">Cart Drop</div>
              <div className="text-[10px] text-slate-500">Checkout Abandoned</div>
            </div>
            {loadingEvent === 'checkout.abandoned' ? (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('subscription.halted')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900">Subscription Fail</div>
              <div className="text-[10px] text-slate-500">Mandate Gateway Timeout</div>
            </div>
            {loadingEvent === 'subscription.halted' ? (
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('invoice.overdue')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-slate-900">B2B Invoice Overdue</div>
              <div className="text-[10px] text-slate-500">Automated WhatsApp Nudge</div>
            </div>
            {loadingEvent === 'invoice.overdue' ? (
              <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
            )}
          </button>
        </div>
      </div>

      {/* Live Activity Stream */}
      <div className="glass-panel rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Live Recovery Activity Stream</h3>
          <button
            onClick={() => onNavigateTab('audit-trail')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
          >
            View Full Audit Logs →
          </button>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-xs font-bold text-slate-900">{log.customer}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-medium">{log.event}</span>
                  <span className="text-xs font-extrabold text-emerald-700">
                    ₹{log.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium truncate">{log.action}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{log.explainability}</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  log.status === 'RECOVERED' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' :
                  log.status === 'P2P_RECORDED' ? 'bg-blue-100 border-blue-300 text-blue-800' :
                  'bg-amber-100 border-amber-300 text-amber-800'
                }`}>
                  {log.status}
                </span>
                {log.razorpayLinkId && log.razorpayLinkId !== 'N/A' && (
                  <a
                    href={`https://razorpay.com/pay/${log.razorpayLinkId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-indigo-600 transition-colors"
                    title="Open Razorpay Test Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
