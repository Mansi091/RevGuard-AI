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
    <div className="space-y-6">
      {/* Banner / Value Proposition */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-cyan-500/20 bg-gradient-to-r from-gray-900 via-gray-900 to-cyan-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              <Zap className="w-3.5 h-3.5" />
              <span>Razorpay Buildathon Track 03</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Autonomous AI Revenue Recovery Engine
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Detects payment degradation, checkout drop-offs, subscription mandate failures, and overdue B2B receivables in real time. Executes explainable, bounded interventions with Razorpay test mode APIs.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('batch-benchmark')}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 font-semibold shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all"
          >
            <span>Run 50-Batch Test Benchmark</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue at Risk</span>
            <div className="w-8 h-8 rounded-lg bg-red-950/50 border border-red-800/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">₹{metrics.totalRisk.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-400 mt-1">{metrics.failedCount} Failed Transactions</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Money Recovered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-300">₹{metrics.totalRecovered.toLocaleString('en-IN')}</div>
            <p className="text-xs text-emerald-400/80 mt-1">{metrics.recoveredCount} Successful Recoveries</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 bg-cyan-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Recovery Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-cyan-300">{metrics.recoveryRate}%</div>
            <p className="text-xs text-cyan-400/80 mt-1">Measured across active batch</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stopping Rules Enforced</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-950/50 border border-yellow-800/40 flex items-center justify-center text-yellow-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{metrics.stoppedCount} Halted</div>
            <p className="text-xs text-gray-400 mt-1">Zero False-Positive Spams</p>
          </div>
        </div>
      </div>

      {/* Interactive Quick Simulation Bar */}
      <div className="glass-panel p-6 rounded-xl border border-gray-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Simulate Live Payment Failure Events</h3>
            <p className="text-xs text-gray-400">Trigger test webhook events to watch the AI recovery agent diagnose and generate Razorpay payment links live.</p>
          </div>
          <button
            onClick={() => onNavigateTab('live-engine')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
          >
            <span>Open Full Interactive Engine</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleSimulate('payment.failed')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div>
              <div className="text-xs font-semibold text-gray-200 group-hover:text-cyan-300">Payment Failed</div>
              <div className="text-[11px] text-gray-500">Bank OTP Timeout</div>
            </div>
            {loadingEvent === 'payment.failed' ? (
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('checkout.abandoned')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/40 text-left transition-all group"
          >
            <div>
              <div className="text-xs font-semibold text-gray-200 group-hover:text-emerald-300">Checkout Abandoned</div>
              <div className="text-[11px] text-gray-500">High-Intent Cart Drop</div>
            </div>
            {loadingEvent === 'checkout.abandoned' ? (
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('subscription.halted')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div>
              <div className="text-xs font-semibold text-gray-200 group-hover:text-cyan-300">Subscription Mandate Fail</div>
              <div className="text-[11px] text-gray-500">Gateway Timeout</div>
            </div>
            {loadingEvent === 'subscription.halted' ? (
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
            )}
          </button>

          <button
            onClick={() => handleSimulate('invoice.overdue')}
            disabled={loadingEvent !== null}
            className="flex items-center justify-between p-3.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/40 text-left transition-all group"
          >
            <div>
              <div className="text-xs font-semibold text-gray-200 group-hover:text-purple-300">B2B Invoice Overdue</div>
              <div className="text-[11px] text-gray-500">Promise-to-Pay Voice</div>
            </div>
            {loadingEvent === 'invoice.overdue' ? (
              <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
            )}
          </button>
        </div>
      </div>

      {/* Recent Activity Log Stream */}
      <div className="glass-panel rounded-xl border border-gray-800/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Live Recovery Activity Stream</h3>
          <button
            onClick={() => onNavigateTab('audit-trail')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View Full Audit Logs →
          </button>
        </div>

        <div className="space-y-3">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-4 rounded-lg bg-gray-900/80 border border-gray-800/70 hover:border-gray-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-200">{log.customer}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-mono">{log.event}</span>
                  <span className={`text-xs font-bold ${log.status === 'RECOVERED' ? 'text-emerald-400' : log.status === 'P2P_RECORDED' ? 'text-cyan-400' : 'text-yellow-400'}`}>
                    ₹{log.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-medium">{log.action}</p>
                <p className="text-[11px] text-gray-400 font-mono">{log.explainability}</p>
              </div>

              <div className="flex items-center space-x-3 self-start md:self-center">
                <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-md border ${
                  log.status === 'RECOVERED' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' :
                  log.status === 'P2P_RECORDED' ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400' :
                  'bg-yellow-950/60 border-yellow-800 text-yellow-400'
                }`}>
                  {log.status}
                </span>
                {log.razorpayLinkId && log.razorpayLinkId !== 'N/A' && (
                  <a
                    href={`https://razorpay.com/pay/${log.razorpayLinkId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-cyan-400 transition-colors"
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
