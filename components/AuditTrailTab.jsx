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
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Explainable Audit Trail & Money Action Gate Logs</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Immutable activity trail proving that every single money action is explainable, bounded by guardrails, and gated before execution.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
              100% Gated & Compliant
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, event, or log ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Status:</span>
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
            className="glass-panel p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3 shadow-xs"
          >
            {/* Top Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-blue-700">{log.id}</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">{log.timestamp}</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-900">{log.customer}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  ₹{log.amount.toLocaleString('en-IN')}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${
                    log.status === 'RECOVERED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : log.status === 'P2P_RECORDED'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {log.status}
                </span>
              </div>
            </div>

            {/* Diagnostic Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">1. Event & Diagnosis</span>
                <p className="text-slate-800 font-medium">{log.diagnosis}</p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">2. Executed Action</span>
                <p className="text-emerald-950 font-bold">{log.action}</p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1">
                <span className="font-bold text-blue-800 uppercase tracking-wider text-[10px]">3. Guardrail Gate Check</span>
                <p className="text-blue-950 font-mono text-[11px] font-semibold">{log.gate}</p>
              </div>
            </div>

            {/* AI Rationale Bar */}
            <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-xs flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-900">Explainable AI Reason: </span>
                <span className="text-slate-700 italic">"{log.explainability}"</span>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="glass-panel p-8 rounded-xl text-center text-xs text-slate-500 bg-white">
            No audit logs matched your search or status filter.
          </div>
        )}
      </div>
    </div>
  );
}
