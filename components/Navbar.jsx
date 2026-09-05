'use client';

import React from 'react';
import { ShieldCheck, Activity, Database, FileText, Settings, Layers, Zap } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, liveMode }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'live-engine', label: 'Live Recovery Engine', icon: Zap },
    { id: 'batch-benchmark', label: '50-Record Batch Test', icon: Database },
    { id: 'audit-trail', label: 'Audit Trail & Logs', icon: FileText },
    { id: 'config', label: 'Guardrails & Config', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">RevGuard <span className="text-cyan-400">AI</span></span>
              </div>
            </div>
          </div>

          {/* Environment Status Badge */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">Razorpay Test Mode APIs Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar border-t border-gray-800/40 pt-1 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
