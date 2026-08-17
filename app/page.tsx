'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { VirtualNumberManager } from '@/components/VirtualNumberManager';
import { LiveOtpFeed } from '@/components/LiveOtpFeed';
import { ApiTester } from '@/components/ApiTester';
import { CodeGenerator } from '@/components/CodeGenerator';
import { NetworkStats } from '@/components/NetworkStats';
import { VercelDeployModal } from '@/components/VercelDeployModal';
import { WhatsAppChannelModal } from '@/components/WhatsAppChannelModal';
import { Logo } from '@/components/Logo';
import {
  Smartphone,
  Radio,
  Terminal,
  Code2,
  Activity,
  Zap,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';

type TabType =
  | 'virtual_numbers'
  | 'live_feed'
  | 'api_tester'
  | 'code_generator'
  | 'network_stats';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('virtual_numbers');
  const [useSimulation, setUseSimulation] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(true); // Opens automatically on first entry
  const [apiStatus, setApiStatus] = useState<'online' | 'connecting' | 'fallback' | 'error'>('connecting');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Ping API on load to measure latency and check connectivity
  useEffect(() => {
    async function checkHealth() {
      const startTime = Date.now();
      try {
        const res = await fetch('/api/zelapi/services', {
          headers: {
            'x-mock-mode': useSimulation ? 'true' : 'false',
          },
        });
        const data = await res.json();
        const latency = Date.now() - startTime;
        setLatencyMs(data._latencyMs || latency);

        if (data._source === 'live') {
          setApiStatus('online');
        } else if (data._source === 'simulation') {
          setApiStatus('online');
        } else {
          setApiStatus('fallback');
        }
      } catch {
        setApiStatus('error');
        setLatencyMs(null);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [useSimulation]);

  const navTabs: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'virtual_numbers', label: 'Nomor Virtual & OTP', icon: Smartphone },
    { id: 'live_feed', label: 'Live OTP Feed', icon: Radio, badge: 'Live' },
    { id: 'api_tester', label: 'API Tester', icon: Terminal },
    { id: 'code_generator', label: 'Generator SDK', icon: Code2 },
    { id: 'network_stats', label: 'Statistik & Status', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        apiStatus={apiStatus}
        latencyMs={latencyMs}
        useSimulation={useSimulation}
        onToggleSimulation={setUseSimulation}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenChannelModal={() => setIsChannelModalOpen(true)}
      />

      {/* Main Container with Android & Mobile Padding Optimization */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Hero Section & Quick Info Bar */}
        <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-sm relative overflow-hidden border border-neutral-800/80">
          {/* Background subtle glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 sm:w-80 sm:h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 sm:w-80 sm:h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2.5 max-w-2xl">
              {/* Badge Dev & Base URL */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-[11px] sm:text-xs font-semibold border border-red-500/30">
                  <Flame className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>SANN404 FORUM GROUP</span>
                </div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 text-[11px] sm:text-xs font-mono border border-neutral-700">
                  <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>ZELAPI Engine</span>
                </div>
              </div>

              {/* Title & Brand */}
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-neutral-700">
                  <Logo className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    SFG-NOKOS Hub
                  </h1>
                  <p className="text-[11px] sm:text-xs text-red-400 font-medium">
                    Virtual Numbers &amp; SMS OTP Verification Engine
                  </p>
                </div>
              </div>

              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                Layanan terpadu penyedia nomor telepon virtual sementara (NOKOS) untuk verifikasi kode SMS OTP berbagai aplikasi seperti WhatsApp, Telegram, Google, TikTok, dan platform digital lainnya secara instan, otomatis, dan aman.
              </p>
            </div>

            {/* Quick action buttons in Hero */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                id="btn-hero-wa-channel"
                onClick={() => setIsChannelModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Saluran WhatsApp</span>
              </button>
              <button
                id="btn-hero-test-api"
                onClick={() => setActiveTab('api_tester')}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>API Tester</span>
              </button>
              <button
                id="btn-hero-view-code"
                onClick={() => setActiveTab('code_generator')}
                className="hidden md:flex px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Code2 className="h-4 w-4 text-amber-400" />
                <span>Kode SDK</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar in Hero (Mobile Optimized 2-column or 4-column) */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
            <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60">
              <span className="text-neutral-400 text-[10px] sm:text-[11px] block">Developer</span>
              <span className="font-semibold text-red-400 truncate block">SANN404 GROUP</span>
            </div>
            <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60">
              <span className="text-neutral-400 text-[10px] sm:text-[11px] block">Autentikasi</span>
              <span className="font-semibold text-emerald-400 truncate block">Publik (Gratis)</span>
            </div>
            <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60">
              <span className="text-neutral-400 text-[10px] sm:text-[11px] block">Total Endpoint</span>
              <span className="font-semibold text-white">9 Endpoint REST</span>
            </div>
            <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60">
              <span className="text-neutral-400 text-[10px] sm:text-[11px] block">Target Deploy</span>
              <span className="font-semibold text-white">Vercel &amp; Next.js</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar with Smooth Mobile Horizontal Scrolling */}
        <div className="overflow-x-auto pb-1.5 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center space-x-1.5 bg-white p-1 sm:p-1.5 rounded-2xl border border-neutral-200/80 shadow-2xs min-w-max">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer select-none whitespace-nowrap min-h-[40px] ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-red-400' : 'text-neutral-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="transition-all duration-200">
          {activeTab === 'virtual_numbers' && (
            <VirtualNumberManager
              useSimulation={useSimulation}
              onSelectEndpointInTester={(endpoint, method, payload) => {
                setActiveTab('api_tester');
              }}
            />
          )}

          {activeTab === 'live_feed' && <LiveOtpFeed useSimulation={useSimulation} />}

          {activeTab === 'api_tester' && <ApiTester useSimulation={useSimulation} />}

          {activeTab === 'code_generator' && <CodeGenerator />}

          {activeTab === 'network_stats' && <NetworkStats useSimulation={useSimulation} />}
        </div>
      </main>

      {/* Footer with Clear SANN404 Developer Credits */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-8 sm:mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-white p-0.5 border border-neutral-200 shadow-2xs flex items-center justify-center">
              <Logo className="h-full w-full object-contain" />
            </div>
            <p className="text-left">
              <strong>SFG-NOKOS</strong> — Developed by{' '}
              <span className="text-red-600 font-bold">SANN404 FORUM GROUP</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <button
              onClick={() => setIsChannelModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Saluran WhatsApp</span>
            </button>
            <span className="text-neutral-300">•</span>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="text-neutral-700 hover:text-neutral-900 font-medium cursor-pointer"
            >
              Panduan Deploy Vercel
            </button>
            <span className="text-neutral-300">•</span>
            <button
              onClick={() => setActiveTab('code_generator')}
              className="text-neutral-700 hover:text-neutral-900 font-medium cursor-pointer"
            >
              Dokumentasi SDK
            </button>
          </div>
        </div>
      </footer>

      {/* WhatsApp Official Developer Channel Popup (Triggered on entry) */}
      <WhatsAppChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
      />

      {/* Deploy Vercel Modal */}
      <VercelDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}
