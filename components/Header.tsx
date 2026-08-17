'use client';

import React from 'react';
import { Server, Zap, MessageCircle, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  apiStatus: 'online' | 'connecting' | 'fallback' | 'error';
  latencyMs: number | null;
  useSimulation: boolean;
  onToggleSimulation: (val: boolean) => void;
  onOpenDeployModal: () => void;
  onOpenChannelModal: () => void;
}

export function Header({
  apiStatus,
  latencyMs,
  useSimulation,
  onToggleSimulation,
  onOpenDeployModal,
  onOpenChannelModal,
}: HeaderProps) {
  return (
    <header className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Name */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white p-1 shadow-sm border border-neutral-200/90 flex items-center justify-center shrink-0">
            <Logo className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-neutral-900 text-base sm:text-lg tracking-tight truncate">
                SFG-NOKOS
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-500 truncate hidden xs:block">
              by <span className="font-semibold text-neutral-700">SANN404 FORUM GROUP</span>
            </p>
          </div>
        </div>

        {/* Right Actions & Status Badges */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* WhatsApp Channel Button */}
          <button
            id="btn-header-wa-channel"
            onClick={onOpenChannelModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Saluran WhatsApp SANN404 FORUM GROUP"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline">Saluran WA</span>
            <span className="xs:hidden">WA</span>
          </button>

          {/* Live Status Indicator */}
          <div
            className="flex items-center space-x-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-[11px] sm:text-xs text-neutral-700"
            title={apiStatus === 'online' ? 'Status: Online' : 'Status: Fallback / Checking'}
          >
            <span
              className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0 ${
                apiStatus === 'online'
                  ? 'bg-emerald-500 ring-2 sm:ring-4 ring-emerald-100'
                  : apiStatus === 'fallback'
                  ? 'bg-amber-500 ring-2 sm:ring-4 ring-amber-100'
                  : 'bg-rose-500 ring-2 sm:ring-4 ring-rose-100'
              }`}
            />
            {latencyMs !== null && (
              <span className="text-neutral-500 font-mono text-[10px] sm:text-[11px]">
                {latencyMs}ms
              </span>
            )}
          </div>

          {/* Mode Switch (Live vs Mock) */}
          <button
            id="btn-toggle-simulation"
            onClick={() => onToggleSimulation(!useSimulation)}
            className={`text-[11px] sm:text-xs font-medium px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
              useSimulation
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
            title="Ganti Mode: Live API vs Simulasi Cepat"
          >
            <Server className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline">
              {useSimulation ? 'Simulasi' : 'Live API'}
            </span>
          </button>

          {/* Vercel Deploy Button */}
          <button
            id="btn-deploy-vercel"
            onClick={onOpenDeployModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] sm:text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Deploy</span>
          </button>
        </div>
      </div>
    </header>
  );
}
