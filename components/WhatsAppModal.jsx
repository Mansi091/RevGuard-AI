'use client';

import React from 'react';
import { X, CheckCheck, ExternalLink, ShieldCheck, Phone, Video, Send } from 'lucide-react';

export default function WhatsAppModal({ isOpen, onClose, customerName, amount, paymentUrl, messageText }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Phone Container */}
      <div className="relative w-full max-w-sm bg-[#111b21] rounded-[32px] border-4 border-gray-800 shadow-2xl overflow-hidden flex flex-col h-[580px]">
        {/* Top Phone Notch */}
        <div className="w-32 h-4 bg-gray-900 mx-auto rounded-b-xl flex items-center justify-center shrink-0">
          <div className="w-12 h-1 bg-gray-700 rounded-full"></div>
        </div>

        {/* WhatsApp Header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-gray-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              RZP
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-gray-100">Razorpay RevGuard Bot</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              </div>
              <span className="text-[10px] text-emerald-400">Verified Business Account</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400">
            <Video className="w-4 h-4" />
            <Phone className="w-4 h-4" />
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95 text-xs">
          <div className="text-center">
            <span className="text-[10px] bg-[#182229] text-gray-400 px-2.5 py-1 rounded-md">
              TODAY • END-TO-END ENCRYPTED
            </span>
          </div>

          {/* Incoming WhatsApp Message Bubble */}
          <div className="max-w-[85%] bg-[#202c33] rounded-2xl rounded-tl-none p-3 space-y-2 border border-gray-800 shadow-md">
            <div className="flex items-center justify-between text-emerald-400 font-semibold text-[11px] pb-1 border-b border-gray-700/60">
              <span>Razorpay 1-Click Recovery</span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded">TEST MODE</span>
            </div>

            {messageText ? (
              <p className="text-gray-200 text-xs whitespace-pre-line leading-relaxed">
                {messageText}
              </p>
            ) : (
              <>
                <p className="text-gray-200 leading-relaxed text-xs">
                  Namaste <strong className="text-white">{customerName || 'Valued Customer'}</strong>! 🙏
                </p>
                <p className="text-gray-300 text-xs">
                  Aapka <strong className="text-white">₹{amount?.toLocaleString('en-IN') || 2499}</strong> ka payment retry fail ho gaya tha. Aap niche click karke instant UPI ya card se pay kar sakte hain.
                </p>
              </>
            )}

            {/* Payment Button inside WhatsApp */}
            <a
              href={paymentUrl || 'https://razorpay.com'}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <span>💳 Pay ₹{amount?.toLocaleString('en-IN') || 2499} via Razorpay</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center justify-end space-x-1 text-[9px] text-gray-400 pt-1">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-[#202c33] p-2.5 flex items-center space-x-2 shrink-0 border-t border-gray-800">
          <input
            type="text"
            placeholder="Type a message..."
            readOnly
            className="flex-1 bg-[#2a3942] text-gray-300 rounded-full px-3 py-1.5 text-xs focus:outline-none cursor-not-allowed"
          />
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-gray-950 font-bold shadow-md">
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
