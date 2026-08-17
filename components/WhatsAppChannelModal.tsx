'use client';

import React from 'react';
import {
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BellRing,
  Users,
  Code2,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

interface WhatsAppChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppChannelModal({ isOpen, onClose }: WhatsAppChannelModalProps) {
  if (!isOpen) return null;

  const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl border border-neutral-200 max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full bg-neutral-100/90 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 text-white p-6 sm:p-7 text-center relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Red Ninja Logo Badge */}
            <div className="h-16 w-16 rounded-2xl bg-white p-2.5 shadow-xl flex items-center justify-center border-2 border-red-500/30 mb-3.5 transform hover:scale-105 transition-transform">
              <Logo className="h-full w-full object-contain" />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[11px] font-semibold border border-red-500/30 mb-2">
              <Sparkles className="h-3 w-3 text-red-400" />
              <span>OFFICIAL COMMUNITY</span>
            </div>

            <h2 id="modal-headline" className="text-xl sm:text-2xl font-black text-white tracking-tight">
              SFG-NOKOS
            </h2>
            <p className="text-xs text-neutral-300 font-medium mt-0.5">
              Developed by <span className="text-red-400 font-bold">SANN404 FORUM GROUP</span>
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900">
              Bergabung ke Saluran WhatsApp Resmi! 📢
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Dapatkan informasi terkini seputar nomor virtual gratis, stok baru, restock OTP, update script bot, dan bantuan langsung dari tim developer.
            </p>
          </div>

          {/* Benefits List */}
          <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 space-y-2.5 text-xs text-neutral-700">
            <div className="flex items-start space-x-2.5">
              <div className="h-5 w-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="h-3 w-3" />
              </div>
              <p className="leading-snug">
                <strong className="text-neutral-900">Update Stok Nomor:</strong> Pemberitahuan cepat saat nomor virtual baru &amp; negara baru tersedia.
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="h-5 w-5 rounded-md bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                <Code2 className="h-3 w-3" />
              </div>
              <p className="leading-snug">
                <strong className="text-neutral-900">Script &amp; API Integration:</strong> Dapatkan source code &amp; bot automasi WhatsApp/Telegram.
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="h-5 w-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="h-3 w-3" />
              </div>
              <p className="leading-snug">
                <strong className="text-neutral-900">Komunitas Pengguna:</strong> Diskusi langsung dengan member SANN404 FORUM GROUP.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <a
              id="btn-join-whatsapp-channel"
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Gabung Saluran WhatsApp</span>
              <ExternalLink className="h-4 w-4 opacity-80" />
            </a>

            <button
              id="btn-dismiss-whatsapp-modal"
              onClick={onClose}
              className="w-full h-10 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
            >
              Lanjutkan ke Web SFG-NOKOS
            </button>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-neutral-400 font-mono flex items-center justify-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Official Developer: SANN404 FORUM GROUP</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
