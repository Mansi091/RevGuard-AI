'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Radio, RefreshCw, Zap, AlertTriangle, CheckCircle2, Clock, Send, ChevronDown, ChevronUp, Globe, Smartphone, ExternalLink } from 'lucide-react';

export default function WebhookEventsTab({ onWebhookRecovery }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch events from the webhook GET endpoint
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/webhooks/razorpay');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
        setLastRefresh(new Date().toLocaleTimeString('en-IN'));
      }
    } catch (err) {
      console.error('Failed to fetch webhook events:', err);
    }
  }, []);

  // Auto-poll every 5 seconds
  useEffect(() => {
    fetchEvents();
    if (autoRefresh) {
      const interval = setInterval(fetchEvents, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchEvents]);

  // Manual refresh
  const handleRefresh = async () => {
    setLoading(true);
    await fetchEvents();
    setLoading(false);
  };

  // Simulate a webhook event
  const handleSimulateWebhook = async (type = 'payment.failed') => {
    setSimulating(true);

    const mockPayloads = {
      'payment.failed': {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: `pay_test_${Date.now().toString().slice(-8)}`,
              amount: [149900, 249900, 49900, 349900, 89900][Math.floor(Math.random() * 5)],
              currency: 'INR',
              method: ['card', 'upi', 'netbanking', 'wallet'][Math.floor(Math.random() * 4)],
              description: ['Nykaa Order #NK-4521', 'Lenskart Frame Purchase', 'Zomato Food Order', 'BookMyShow Tickets', 'Urban Company Service'][Math.floor(Math.random() * 5)],
              contact: '+919876543210',
              email: 'customer@example.com',
              error_code: ['BAD_REQUEST_PAYMENT_TIMED_OUT', 'INSUFFICIENT_FUNDS', 'GATEWAY_DOWNTIME', 'BAD_REQUEST_PAYMENT_DECLINED'][Math.floor(Math.random() * 4)],
              error_description: ['Payment was timed out by the bank', 'Card has insufficient funds', 'Bank gateway is temporarily unavailable', 'Payment was declined by the issuing bank'][Math.floor(Math.random() * 4)],
              error_source: 'bank',
              notes: {
                customer_name: ['Aarav Patel', 'Priya Sharma', 'Rohan Mehta', 'Sneha Reddy', 'Vikram Singh'][Math.floor(Math.random() * 5)],
              },
              order_id: `order_test_${Date.now().toString().slice(-6)}`,
            }
          }
        },
        account_id: 'acc_test_sandbox',
      },
    };

    try {
      await fetch('/api/webhooks/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPayloads[type]),
      });

      // Refresh events list
      await fetchEvents();

      // Notify parent about recovery for metrics
      if (onWebhookRecovery) {
        const latestEvent = events[0];
        if (latestEvent?.recoveryTriggered) {
          onWebhookRecovery(latestEvent);
        }
      }
    } catch (err) {
      console.error('Simulate webhook failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (status, eventType) => {
    if (eventType === 'payment.captured' || status === 'PAYMENT_CAPTURED' || status === 'CAPTURED') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          <span>Payment Captured</span>
        </span>
      );
    }
    switch (status) {
      case 'AUTO_RECOVERY_TRIGGERED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Auto-Recovered</span>
          </span>
        );
      case 'RECOVERY_FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
            <AlertTriangle className="w-3 h-3" />
            <span>Recovery Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-300">
            <Clock className="w-3 h-3" />
            <span>Received</span>
          </span>
        );
    }
  };

  const getMethodBadge = (method) => {
    const colors = {
      card: 'bg-violet-100 text-violet-800 border-violet-300',
      upi: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      netbanking: 'bg-blue-100 text-blue-800 border-blue-300',
      wallet: 'bg-amber-100 text-amber-800 border-amber-300',
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[method] || 'bg-slate-100 text-slate-700 border-slate-300'}`}>
        {method}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Radio className="w-5 h-5 text-blue-600" />
              <span>Razorpay Webhook Events</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-refresh toggle */}
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Auto-refresh (5s)</span>
            </label>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {lastRefresh && (
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Last updated: {lastRefresh}</p>
        )}
      </div>

      {/* Simulate Webhook Section */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Simulate Webhook Event</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSimulateWebhook('payment.failed')}
            disabled={simulating}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{simulating ? 'Sending...' : 'Simulate payment.failed'}</span>
          </button>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 pl-2">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Webhook URL: <code className="font-mono bg-slate-100 px-1 rounded text-blue-700">/api/webhooks/razorpay</code></span>
          </div>
        </div>
      </div>

      {/* Events Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">
            Incoming Events ({events.length})
          </h3>
          {autoRefresh && (
            <span className="flex items-center space-x-1.5 text-[10px] text-emerald-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live</span>
            </span>
          )}
        </div>

        {events.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-slate-300 bg-white text-center space-y-3">
            <Radio className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
            <p className="text-sm font-semibold text-slate-500">No webhook events received yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className={`rounded-xl border bg-white shadow-sm transition-all ${
                  event.recoveryTriggered
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Event Header Row */}
                <button
                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      event.recoveryTriggered ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {event.recoveryTriggered ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-bold text-slate-900">{event.customerName}</span>
                        {getMethodBadge(event.method)}
                        {getStatusBadge(event.status, event.eventType)}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                        <span>{event.id}</span>
                        <span>•</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString('en-IN')}</span>
                        <span>•</span>
                        <span className="text-rose-500 font-semibold">{event.failureReason}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 ml-2">
                    <span className="text-sm font-extrabold text-slate-900">₹{event.amount?.toLocaleString('en-IN')}</span>
                    {expandedEvent === event.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Detail */}
                {expandedEvent === event.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Payment ID</span>
                        <p className="text-xs font-mono text-slate-800 mt-0.5">{event.paymentId || 'N/A'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Order ID</span>
                        <p className="text-xs font-mono text-slate-800 mt-0.5">{event.orderId || 'N/A'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                        <span className="text-[10px] font-bold text-rose-500 uppercase">Error Description</span>
                        <p className="text-xs text-rose-800 font-semibold mt-0.5">{event.errorDescription}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Contact</span>
                        <p className="text-xs font-mono text-slate-800 mt-0.5">{event.customerPhone || 'N/A'} • {event.customerEmail || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Recovery Result */}
                    {event.recoveryTriggered && event.recoveryResult && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-800">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">Auto-Recovery Result</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <p><span className="font-bold text-slate-700">Diagnosis:</span> <span className="text-slate-600">{event.recoveryResult.diagnosis}</span></p>
                          <p><span className="font-bold text-slate-700">Action:</span> <span className="text-emerald-700 font-semibold">{event.recoveryResult.action}</span></p>
                          <p><span className="font-bold text-slate-700">Channel:</span> <span className="text-blue-700">{event.recoveryResult.channel}</span></p>
                        </div>

                        {event.customerPhone && (
                          <div className="pt-2">
                            <a
                              href={`https://api.whatsapp.com/send?phone=${event.customerPhone.replace('+', '').replace(/\s+/g, '')}&text=${encodeURIComponent(`Namaste! 🙏\n\nRazorpay RevGuard AI se reminder. Aapka ₹${event.amount} ka payment retry fail ho gaya tha.\nInstant pay link: https://rzp.io/rzp/6JWQY2U\n\n-- Razorpay Automated Recovery`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                            >
                              <Smartphone className="w-4 h-4" />
                              <span>Open & Send WhatsApp to {event.customerPhone}</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
