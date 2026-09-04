'use client';

import React, { useState } from 'react';
import { FileText, Search, ShieldCheck, ExternalLink, Filter, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function AuditTrailTab({ auditLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Explainable Audit Trail & Money Action Gate Logs</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Immutable activity trail proving that every single money action is explainable, bounded by guardrails, and gated before execution.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              100% Gated & Compliant
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, event, or log ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-3 rounded-lg glass-input text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="RECOVERED">RECOVERED</option>
              <option value="P2P_RECORDED">P2P_RECORDED</option>
              <option value="STOPPED">STOPPED (Graceful Failure)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Timeline Cards */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="glass-panel p-5 rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-all space-y-3"
          >
            {/* Top Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{log.id}</span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-400 font-mono">{log.timestamp}</span>
                <span className="text-gray-600">•</span>
                <span className="text-xs font-semibold text-white">{log.customer}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-white bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  ₹{log.amount.toLocaleString('en-IN')}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${
                    log.status === 'RECOVERED'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : log.status === 'P2P_RECORDED'
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                      : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            </div>

            {/* Diagnostic Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-800 space-y-1">
                <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">1. Event & Diagnosis</span>
                <p className="text-gray-200">{log.diagnosis}</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-800 space-y-1">
                <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">2. Executed Action</span>
                <p className="text-gray-200 font-medium">{log.action}</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-800 space-y-1">
                <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px]">3. Guardrail Gate Check</span>
                <p className="text-gray-300 font-mono text-[11px]">{log.gate}</p>
              </div>
            </div>

            {/* AI Rationale Bar */}
            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-xs flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-cyan-300">Explainable AI Reason: </span>
                <span className="text-gray-300 italic">"{log.explainability}"</span>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="glass-panel p-8 rounded-xl text-center text-xs text-gray-400">
            No audit logs matched your search or status filter.
          </div>
        )}
      </div>
    </div>
  );
}
