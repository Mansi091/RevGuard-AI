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
      {/* Header & Filter Bar */}
      <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Activity Audit Trail & Decision Logs</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified log of all AI recovery diagnoses, guardrail checks, and payment actions.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 self-start sm:self-auto">
            100% Gated & Compliant
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, event, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-3 rounded-lg glass-input text-xs font-semibold cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="RECOVERED">RECOVERED</option>
              <option value="P2P_RECORDED">P2P_RECORDED</option>
              <option value="STOPPED">STOPPED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clean Minimalist Log Cards */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="glass-panel p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-xs"
          >
            {/* Row 1: ID, Customer, Amount, Status */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">{log.id}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-900 truncate">{log.customer}</span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono hidden sm:inline-block">
                  {log.event}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-extrabold text-emerald-700 font-mono">
                  ₹{log.amount?.toLocaleString('en-IN')}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
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

            {/* Row 2: Action & AI Reason */}
            <div className="space-y-1 text-xs">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-slate-800 shrink-0">Action:</span>
                <span className="text-slate-900 font-medium">{log.action}</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-600">
                <span className="font-semibold text-indigo-700 shrink-0">AI Rationale:</span>
                <span className="text-slate-600 italic">"{log.explainability}"</span>
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
