'use client';

import React, { useState } from 'react';
import { Database, Play, CheckCircle2, AlertOctagon, TrendingUp, ShieldCheck, RefreshCw, BarChart2 } from 'lucide-react';

export default function BatchBenchmarkTab({ onBatchRunComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  const handleRunBatch = async () => {
    setIsRunning(true);
    setProgress(15);
    setBenchmarkResult(null);

    try {
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 85 ? 85 : prev + 15));
      }, 300);

      const res = await fetch('/api/recovery/batch-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 50 }),
      });

      const data = await res.json();
      clearInterval(timer);
      setProgress(100);

      setTimeout(() => {
        setBenchmarkResult(data);
        setIsRunning(false);
        if (onBatchRunComplete) {
          onBatchRunComplete(data);
        }
      }, 400);
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Benchmark Header Banner */}
      <div className="rounded-2xl p-6 bg-slate-900 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              <Database className="w-3.5 h-3.5" />
              <span>Evaluation Benchmark</span>
            </div>
            <h2 className="text-xl font-bold text-white">50-Record Synthetic Batch Benchmark</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Evaluates RevGuard AI across 50 failed transactions (Checkout drops, subscription mandate failures, overdue B2B invoices). Measures recovery %, total money recovered (₹), and stopping rule adherence.
            </p>
          </div>

          <button
            onClick={handleRunBatch}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shrink-0 cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run 50-Batch Benchmark</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-4 space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 font-mono">
              <span>Simulating Webhooks & Diagnostic AI...</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Summary Metrics */}
      {benchmarkResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch Revenue at Risk</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">₹{benchmarkResult.summary.totalRisk.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Across 50 Transactions</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 shadow-sm">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Money Recovered</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2">₹{benchmarkResult.summary.totalRecovered.toLocaleString('en-IN')}</div>
            <p className="text-xs text-emerald-700 font-medium mt-1">{benchmarkResult.summary.recoveredCount} Successful Interventions</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-blue-200 bg-blue-50/60 shadow-sm">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Batch Recovery Rate</span>
            <div className="text-2xl font-extrabold text-blue-700 mt-2">{benchmarkResult.summary.recoveryRate}%</div>
            <p className="text-xs text-blue-700 font-medium mt-1">Measured ROI Metric</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-amber-200 bg-amber-50/60 shadow-sm">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Stopping Rules Enforced</span>
            <div className="text-2xl font-extrabold text-amber-900 mt-2">{benchmarkResult.summary.stoppedCount} Halted</div>
            <p className="text-xs text-amber-800 font-medium mt-1">Zero Spam / 100% Guarded</p>
          </div>
        </div>
      )}

      {/* Benchmark Records Table */}
      {benchmarkResult ? (
        <div className="glass-panel rounded-xl border border-slate-200 bg-white overflow-hidden space-y-4 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>50-Record Batch Results Breakdown</span>
            </h3>
            <span className="text-xs text-emerald-700 font-bold">✓ 100% Explainable & Bounded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Customer / ID</th>
                  <th className="py-3 px-4">Failure Event</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">AI Reason & Guardrail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {benchmarkResult.records.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 font-medium">{row.index}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.customer}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                        {row.event}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-slate-900">₹{row.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          row.status === 'RECOVERED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : row.status === 'P2P_RECORDED'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-semibold">{row.reason}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{row.gate}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-sm">
          <Database className="w-10 h-10 text-blue-600 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-slate-900">Click "Run 50-Batch Benchmark" Above</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This will execute the agent across 50 synthetic test cases and present judges with the measured recovery percentage and money recovered metrics.
          </p>
        </div>
      )}
    </div>
  );
}
