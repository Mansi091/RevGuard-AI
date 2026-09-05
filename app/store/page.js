'use client';

import React, { useState } from 'react';
import StoreTab from '@/components/StoreTab';
import { INITIAL_GUARDRAILS } from '@/lib/data';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function StorePage() {
  const [guardrails, setGuardrails] = useState(INITIAL_GUARDRAILS);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Nav Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">RevGuard AI Mock Merchant Storefront</h1>
              <p className="text-xs text-slate-400">Interactive Customer Checkout & Real-Time Recovery Demonstration</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to RevGuard Merchant Dashboard</span>
          </Link>
        </div>

        {/* Store Tab Content */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <StoreTab guardrails={guardrails} />
        </div>
      </div>
    </div>
  );
}
