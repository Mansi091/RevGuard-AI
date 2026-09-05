'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import OverviewTab from '@/components/OverviewTab';
import LiveEngineTab from '@/components/LiveEngineTab';
import WebhookEventsTab from '@/components/WebhookEventsTab';
import BatchBenchmarkTab from '@/components/BatchBenchmarkTab';
import AuditTrailTab from '@/components/AuditTrailTab';
import ConfigTab from '@/components/ConfigTab';

import { INITIAL_METRICS, INITIAL_GUARDRAILS, INITIAL_AUDIT_LOGS } from '@/lib/data';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [guardrails, setGuardrails] = useState(INITIAL_GUARDRAILS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Poll live Razorpay webhook events to auto-populate OverviewTab & AuditTrailTab
  useEffect(() => {
    const syncWebhooks = async () => {
      try {
        const res = await fetch('/api/webhooks/razorpay');
        const data = await res.json();
        if (data.success && data.events && data.events.length > 0) {
          setAuditLogs((prevLogs) => {
            const existingIds = new Set(prevLogs.map((l) => l.id));
            const newLogs = [];

            for (const ev of data.events) {
              if (!existingIds.has(ev.id)) {
                newLogs.push({
                  id: ev.id,
                  timestamp: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('en-IN') : 'Just now',
                  customer: `${ev.customerName} (${ev.customerPhone})`,
                  amount: ev.amount || 2499,
                  event: ev.eventType || 'payment.failed',
                  diagnosis: ev.errorDescription || `${ev.method} payment authorization failed.`,
                  action: ev.eventType === 'payment.captured'
                    ? 'Payment Captured & Verified • PDF Receipt Generated'
                    : '1-Click WhatsApp Link Dispatched via Twilio',
                  explainability: `Live Razorpay Webhook [${ev.method}] • Pay ID: ${ev.paymentId || 'pay_live'}`,
                  gate: 'Guardrail: Real-Time Webhook Interceptor',
                  status: ev.eventType === 'payment.captured' ? 'RECOVERED' : 'RECOVERED',
                  recoveredAmount: ev.amount || 2499,
                  razorpayLinkId: ev.paymentId,
                });
              }
            }

            if (newLogs.length === 0) return prevLogs;
            return [...newLogs, ...prevLogs];
          });
        }
      } catch (err) {
        console.error('Failed to sync live webhooks:', err);
      }
    };

    syncWebhooks();
    const interval = setInterval(syncWebhooks, 3000);
    return () => clearInterval(interval);
  }, []);

  // Trigger quick simulation event from Overview
  const handleSimulateEvent = async (eventType) => {
    try {
      const eventId = `sim-${Date.now()}`;
      const diagRes = await fetch('/api/recovery/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          merchantId: 'merchant_default',
          eventType,
          failureCode: 'BAD_REQUEST_PAYMENT_TIMED_OUT',
          amount: 3499,
          customerName: 'Test Customer (#REV-901)',
          guardrails,
        }),
      });
      const diagData = await diagRes.json();

      const linkRes = await fetch('/api/razorpay/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 3499,
          customerName: 'Test Customer',
          description: `Recovery Link for ${eventType}`,
        }),
      });
      const linkData = await linkRes.json();

      const newLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        customer: 'Test Customer (#REV-901)',
        amount: 3499,
        event: eventType,
        diagnosis: diagData.diagnosis,
        action: diagData.action,
        explainability: diagData.explainability,
        gate: diagData.gateExplanation,
        status: 'RECOVERED',
        recoveredAmount: 3499,
        razorpayLinkId: linkData.paymentLinkId,
      };

      setAuditLogs((prev) => [newLog, ...prev]);
      setMetrics((prev) => {
        const newRisk = prev.totalRisk + 3499;
        const newRec = prev.totalRecovered + 3499;
        const newCount = prev.recoveredCount + 1;
        const newRate = Number(((newRec / newRisk) * 100).toFixed(1));
        return {
          ...prev,
          totalRisk: newRisk,
          totalRecovered: newRec,
          recoveredCount: newCount,
          recoveryRate: newRate,
        };
      });
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  // Called when Live Engine completes an intervention
  const handleLiveInterventionComplete = (result) => {
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: result.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
      customer: result.customer || 'Aarav Patel',
      amount: result.amount || 2499,
      event: result.event || 'payment.failed',
      diagnosis: result.diagnosis,
      action: result.action,
      explainability: result.explainability,
      gate: result.gateExplanation,
      status: result.event === 'invoice.overdue' ? 'P2P_RECORDED' : 'RECOVERED',
      recoveredAmount: result.event === 'invoice.overdue' ? 0 : (result.amount || 2499),
      razorpayLinkId: result.paymentLinkId,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    if (result.event !== 'invoice.overdue') {
      setMetrics((prev) => {
        const newRisk = prev.totalRisk + (result.amount || 2499);
        const newRec = prev.totalRecovered + (result.amount || 2499);
        const newCount = prev.recoveredCount + 1;
        const newRate = Number(((newRec / newRisk) * 100).toFixed(1));
        return {
          ...prev,
          totalRisk: newRisk,
          totalRecovered: newRec,
          recoveredCount: newCount,
          recoveryRate: newRate,
        };
      });
    }
  };

  // Called when webhook auto-recovery triggers
  const handleWebhookRecovery = (event) => {
    if (!event) return;
    const newLog = {
      id: `WH-LOG-${Date.now().toString().slice(-4)}`,
      timestamp: event.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
      customer: event.customerName || 'Webhook Customer',
      amount: event.amount || 0,
      event: event.eventType || 'payment.failed',
      diagnosis: event.recoveryResult?.diagnosis || 'Webhook auto-diagnosis',
      action: event.recoveryResult?.action || 'Auto-recovery triggered',
      explainability: event.recoveryResult?.explainability || 'Webhook event auto-processed',
      gate: 'Webhook Guardrail: Auto-recovery pipeline',
      status: 'WEBHOOK_RECOVERED',
      recoveredAmount: event.amount || 0,
      razorpayLinkId: event.id,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    if (event.amount > 0) {
      setMetrics((prev) => {
        const newRisk = prev.totalRisk + event.amount;
        const newRec = prev.totalRecovered + event.amount;
        const newCount = prev.recoveredCount + 1;
        const newRate = Number(((newRec / newRisk) * 100).toFixed(1));
        return {
          ...prev,
          totalRisk: newRisk,
          totalRecovered: newRec,
          recoveredCount: newCount,
          recoveryRate: newRate,
        };
      });
    }
  };

  // Called when 50-Record Batch Benchmark runs
  const handleBatchRunComplete = (batchData) => {
    if (batchData?.summary) {
      setMetrics((prev) => ({
        ...prev,
        totalRisk: batchData.summary.totalRisk,
        totalRecovered: batchData.summary.totalRecovered,
        recoveryRate: batchData.summary.recoveryRate,
        recoveredCount: batchData.summary.recoveredCount,
        stoppedCount: batchData.summary.stoppedCount,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Vertical Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} metrics={metrics} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <OverviewTab
              metrics={metrics}
              auditLogs={auditLogs}
              onSimulateEvent={handleSimulateEvent}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'live-engine' && (
            <LiveEngineTab
              guardrails={guardrails}
              onSimulateComplete={handleLiveInterventionComplete}
            />
          )}

          {activeTab === 'webhooks' && (
            <WebhookEventsTab
              onWebhookRecovery={handleWebhookRecovery}
            />
          )}

          {activeTab === 'batch-benchmark' && (
            <BatchBenchmarkTab
              onBatchRunComplete={handleBatchRunComplete}
            />
          )}

          {activeTab === 'audit-trail' && (
            <AuditTrailTab
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'config' && (
            <ConfigTab
              guardrails={guardrails}
              setGuardrails={setGuardrails}
            />
          )}
        </main>
      </div>
    </div>
  );
}
