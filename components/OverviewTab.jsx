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
      {/* Banner / Value Proposition */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-slate-900 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Autonomous AI Revenue Recovery Engine
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Detects payment degradation, checkout drop-offs, subscription mandate failures, and overdue B2B receivables in real time. Executes explainable, bounded interventions with Razorpay test mode APIs.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('batch-benchmark')}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-all shrink-0 cursor-pointer"
          >
            <span>Run 50-Batch Test Benchmark</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Revenue at Risk</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
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
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">₹{metrics.totalRecovered.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">{metrics.recoveredCount} Successful Recoveries</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recovery Rate</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-indigo-600">
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

      {/* Interactive Quick Simulation Bar */}
      <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Simulate Live Payment Failure Events</h3>
            <p className="text-xs text-slate-500">Trigger test webhook events to watch the AI recovery agent diagnose and generate Razorpay payment links live.</p>
          </div>
          <button
            onClick={() => onNavigateTab('live-engine')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
          >
            <span>Open Full Interactive Engine</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleSimulate('payment.failed')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-slate-900">Payment Failed</div>
              <div className="text-[11px] text-slate-500">Bank OTP Timeout</div>
            </div>
            {loadingEvent === 'payment.failed' ? (
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('checkout.abandoned')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-slate-900">Checkout Abandoned</div>
              <div className="text-[11px] text-slate-500">High-Intent Cart Drop</div>
            </div>
            {loadingEvent === 'checkout.abandoned' ? (
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('subscription.halted')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-slate-900">Subscription Mandate Fail</div>
              <div className="text-[11px] text-slate-500">Gateway Timeout</div>
            </div>
            {loadingEvent === 'subscription.halted' ? (
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('invoice.overdue')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-left transition-all group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-slate-900">B2B Invoice Overdue</div>
              <div className="text-[11px] text-slate-500">Promise-to-Pay Voice</div>
            </div>
            {loadingEvent === 'invoice.overdue' ? (
              <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
            )}
          </button>
        </div>
      </div>

      {/* Recent Activity Log Stream */}
      <div className="glass-panel rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Live Recovery Activity Stream</h3>
          <button
            onClick={() => onNavigateTab('audit-trail')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold"
          >
            View Full Audit Logs →
          </button>
        </div>

        <div className="space-y-3">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">{log.customer}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-medium">{log.event}</span>
                  <span className={`text-xs font-extrabold ${log.status === 'RECOVERED' ? 'text-emerald-700' : log.status === 'P2P_RECORDED' ? 'text-blue-700' : 'text-amber-700'}`}>
                    ₹{log.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-semibold">{log.action}</p>
                <p className="text-[11px] text-slate-500 font-mono">{log.explainability}</p>
              </div>

              <div className="flex items-center space-x-3 self-start md:self-center">
                <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-md border ${
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
                    className="p-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-blue-600 transition-colors"
                    title="Open Razorpay Test Link"
                  >
                    <ExternalLink className="w-4 h-4" />
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
