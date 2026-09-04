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
    <div className="space-y-6">
      {/* Benchmark Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-gray-950 via-gray-900 to-cyan-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              <Database className="w-3.5 h-3.5" />
              <span>Hackathon Judged Evaluation Benchmark</span>
            </div>
            <h2 className="text-xl font-bold text-white">50-Record Synthetic Batch Benchmark</h2>
            <p className="text-xs text-gray-400 max-w-2xl">
              Evaluates RevGuard AI across 50 failed transactions (Checkout drops, subscription mandate failures, overdue B2B invoices). Measures recovery %, total money recovered (₹), and stopping rule adherence.
            </p>
          </div>

          <button
            onClick={handleRunBatch}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all shrink-0"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating 50 Records ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run 50-Batch Benchmark</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-4 space-y-1">
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>Simulating Webhooks & Diagnostic AI...</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Summary Metrics */}
      {benchmarkResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          <div className="glass-panel p-5 rounded-xl border border-gray-800">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Batch Revenue at Risk</span>
            <div className="text-2xl font-bold text-white mt-2">₹{benchmarkResult.summary.totalRisk.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-400 mt-1">Across 50 Transactions</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Total Money Recovered</span>
            <div className="text-2xl font-bold text-emerald-300 mt-2">₹{benchmarkResult.summary.totalRecovered.toLocaleString('en-IN')}</div>
            <p className="text-xs text-emerald-400/80 mt-1">{benchmarkResult.summary.recoveredCount} Successful Interventions</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Batch Recovery Rate</span>
            <div className="text-2xl font-bold text-cyan-300 mt-2">{benchmarkResult.summary.recoveryRate}%</div>
            <p className="text-xs text-cyan-400/80 mt-1">Measured ROI Metric</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-yellow-500/30 bg-yellow-950/20">
            <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">Stopping Rules Enforced</span>
            <div className="text-2xl font-bold text-yellow-300 mt-2">{benchmarkResult.summary.stoppedCount} Halted</div>
            <p className="text-xs text-yellow-400/80 mt-1">Zero Spam / 100% Guarded</p>
          </div>
        </div>
      )}

      {/* Benchmark Records Table */}
      {benchmarkResult ? (
        <div className="glass-panel rounded-xl border border-gray-800 overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>50-Record Batch Results Breakdown</span>
            </h3>
            <span className="text-xs text-emerald-400 font-medium">✓ 100% Explainable & Bounded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-950/50">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Customer / ID</th>
                  <th className="py-3 px-4">Failure Event</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">AI Reason & Guardrail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs">
                {benchmarkResult.records.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-400">{row.index}</td>
                    <td className="py-3 px-4 font-semibold text-gray-200">{row.customer}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-300">
                        {row.event}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">₹{row.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          row.status === 'RECOVERED'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : row.status === 'P2P_RECORDED'
                            ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                            : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-300 font-medium">{row.reason}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{row.gate}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-gray-800 p-12 text-center space-y-3">
          <Database className="w-10 h-10 text-cyan-500/50 mx-auto animate-pulse" />
          <h3 className="text-base font-semibold text-white">Click "Run 50-Batch Benchmark" Above</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            This will execute the agent across 50 synthetic test cases and present judges with the measured recovery percentage and money recovered metrics.
          </p>
        </div>
      )}
    </div>
  );
}
