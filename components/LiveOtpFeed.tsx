'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  RefreshCw,
  Search,
  Copy,
  Check,
  Clock,
} from 'lucide-react';
import { ZelapiOtpItem } from '@/lib/types';

interface LiveOtpFeedProps {
  useSimulation: boolean;
}

export function LiveOtpFeed({ useSimulation }: LiveOtpFeedProps) {
  const [feedItems, setFeedItems] = useState<ZelapiOtpItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('ALL');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(4); // seconds
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadFeed = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch('/api/zelapi/otp?count=20', {
        headers: {
          'x-mock-mode': useSimulation ? 'true' : 'false',
        },
      });
      const data = await res.json();
      if (data.feed && Array.isArray(data.feed)) {
        setFeedItems(data.feed);
      } else if (Array.isArray(data)) {
        setFeedItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch live OTP feed:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [useSimulation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFeed(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadFeed]);

  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const timer = setInterval(() => {
      loadFeed();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, loadFeed]);

  function handleCopy(otp: string, id: string) {
    navigator.clipboard.writeText(otp);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredItems = feedItems.filter((item) => {
    const matchesSearch =
      (item.service && item.service.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.number && item.number.includes(searchQuery)) ||
      (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.otp && item.otp.includes(searchQuery));

    const matchesService =
      selectedServiceFilter === 'ALL' ||
      item.service.toLowerCase().includes(selectedServiceFilter.toLowerCase());

    return matchesSearch && matchesService;
  });

  const availableServices = Array.from(new Set(feedItems.map((i) => i.service))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-neutral-900 text-sm sm:text-base">
                  Live Feed SMS OTP Publik
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[10px] sm:text-xs font-semibold whitespace-nowrap shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span>GET /api/otp?count=20</span>
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Aliran pesan OTP realtime yang masuk ke server secara global
              </p>
            </div>
          </div>
        </div>

        {/* Auto Refresh Toggle & Refresh Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-neutral-600 font-medium hidden sm:inline">Interval:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-neutral-800 font-semibold outline-none cursor-pointer text-xs"
            >
              <option value="3">3 Detik</option>
              <option value="5">5 Detik</option>
              <option value="10">10 Detik</option>
              <option value="0">Jeda (Paused)</option>
            </select>
          </div>

          <button
            onClick={() => loadFeed(true)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari layanan, nomor, atau pesan OTP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-xs"
          />
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSelectedServiceFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedServiceFilter === 'ALL'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Semua ({feedItems.length})
          </button>
          {availableServices.slice(0, 6).map((srv) => (
            <button
              key={srv}
              onClick={() => setSelectedServiceFilter(srv)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedServiceFilter === srv
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {srv}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stream Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <p className="text-sm font-semibold text-neutral-700">Tidak ada pesan OTP yang cocok</p>
          <p className="text-xs text-neutral-400 mt-1">Coba ubah kata kunci pencarian atau filter layanan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, idx) => {
            const uniqueId = `feed-${item.id || idx}-${item.number}`;
            return (
              <div
                key={uniqueId}
                className="bg-white rounded-xl border border-neutral-200/90 p-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Top: Service Badge & Timestamp */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.service}
                    </span>
                    {item.country && (
                      <span className="text-[11px] text-neutral-400">{item.country}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {item.received_at ? new Date(item.received_at).toLocaleTimeString() : 'Baru saja'}
                  </span>
                </div>

                {/* Middle: Number & OTP Code */}
                <div className="py-3">
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Nomor: <span className="font-semibold text-neutral-800">{item.number}</span>
                  </p>

                  <div className="mt-2 flex items-center justify-between bg-neutral-50 rounded-lg p-2.5 border border-neutral-200/80">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                        KODE OTP
                      </span>
                      <span className="text-xl font-mono font-bold text-emerald-700 tracking-wider">
                        {item.otp}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(item.otp, uniqueId)}
                      className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md text-xs font-semibold text-neutral-800 flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
                      title="Salin Kode OTP"
                    >
                      {copiedId === uniqueId ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  {item.message && (
                    <p className="mt-2 text-xs text-neutral-600 line-clamp-2 italic font-mono bg-neutral-50/50 p-1.5 rounded">
                      &quot;{item.message}&quot;
                    </p>
                  )}
                </div>

                {/* Bottom Sender info */}
                {item.sender && (
                  <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between">
                    <span>Pengirim: {item.sender}</span>
                    <span className="text-emerald-600 font-medium">✓ Terverifikasi</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
