'use client';

import React from 'react';
import { ShieldCheck, Activity, Database, FileText, Settings, Zap, Radio, ShoppingBag } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, metrics }) {
  const tabs = [
    { id: 'overview', label: 'Overview', desc: 'Dashboard & Metrics', icon: Activity },
    { id: 'live-engine', label: 'Live Engine', desc: 'Interactive Recovery', icon: Zap },
    { id: 'webhooks', label: 'Webhooks', desc: 'Live Razorpay Events', icon: Radio },
    { id: 'audit-trail', label: 'Audit Trail', desc: 'Activity Logs', icon: FileText },
    { id: 'config', label: 'Settings', desc: 'Guardrails & Keys', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0 md:min-h-screen">
      {/* Brand */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h1 className="font-semibold text-sm text-white">RevGuard AI</h1>
          <p className="text-[10px] text-slate-400">Recovery Agent</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-200' : 'text-slate-500'}`} />
              <div>
                <div className="text-xs font-semibold">{tab.label}</div>
                <div className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{tab.desc}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer metric */}
      <div className="p-3 m-2 rounded-lg bg-slate-800/60 border border-slate-700">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>Recovered</span>
          <span className="text-emerald-400 font-bold">{metrics?.recoveryRate || 0}%</span>
        </div>
        <div className="text-base font-semibold text-white font-mono">
          ₹{metrics?.totalRecovered?.toLocaleString('en-IN') || '0'}
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1 mt-1.5 overflow-hidden">
          <div className="bg-emerald-500 h-1 rounded-full transition-all" style={{ width: `${metrics?.recoveryRate || 0}%` }}></div>
        </div>
      </div>
    </aside>
  );
}
