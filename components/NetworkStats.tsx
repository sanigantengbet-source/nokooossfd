'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  Clock,
  Server,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { ZelapiDetailedStats } from '@/lib/types';

interface NetworkStatsProps {
  useSimulation: boolean;
}

export function NetworkStats({ useSimulation }: NetworkStatsProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [stats, setStats] = useState<ZelapiDetailedStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(`/api/zelapi/stats/detailed?period=${period}`, {
        headers: {
          'x-mock-mode': useSimulation ? 'true' : 'false',
        },
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [period, useSimulation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStats(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStats]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Period Switcher */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base flex items-center space-x-2">
                <span>Statistik &amp; Performa Global ZELAPI</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  GET /api/stats/detailed
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Metrik real-time pengiriman SMS OTP, success rate, dan uptime server
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center space-x-1">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  period === p ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadStats(true)}
            disabled={isLoading}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Refresh Statistik"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Total Permintaan SMS
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-mono font-bold text-neutral-900">
            {stats?.total_requests?.toLocaleString() || '14,850'}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>+12.4% dibandingkan periode lalu</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Tingkat Keberhasilan (Success Rate)
            </span>
            <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-mono font-bold text-neutral-900">
            {stats?.success_rate || 93.7}%
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {stats?.successful_otps?.toLocaleString() || '13,920'} OTP berhasil diterima
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Rata-rata Waktu Tiba
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-mono font-bold text-neutral-900">
            {stats?.avg_delivery_time_seconds || 4.8}s
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Waktu rata-rata SMS OTP diterima
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Uptime Server
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-600 flex items-center space-x-1.5">
            <span>{stats?.uptime_percentage || 99.94}%</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Status: Normal &amp; Siap Terima SMS
          </p>
        </div>
      </div>

      {/* Top Services Breakdown & Hourly Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Services List */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 mb-1">
            Performa Berdasarkan Layanan Populer
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Statistik volume request &amp; persentase sukses per platform
          </p>

          <div className="space-y-3">
            {(
              stats?.top_services || [
                { name: 'WhatsApp', requests: 4890, success_rate: 96.2 },
                { name: 'Telegram', requests: 3420, success_rate: 95.1 },
                { name: 'Google / Gmail', requests: 2150, success_rate: 94.0 },
                { name: 'TikTok', requests: 1680, success_rate: 91.5 },
                { name: 'Shopee', requests: 1420, success_rate: 92.8 },
                { name: 'OpenAI / ChatGPT', requests: 1290, success_rate: 89.4 },
              ]
            ).map((srv) => (
              <div key={srv.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-800">{srv.name}</span>
                  <div className="flex items-center space-x-3 text-neutral-500 font-mono text-[11px]">
                    <span>{srv.requests.toLocaleString()} req</span>
                    <span className="font-bold text-emerald-600">{srv.success_rate}% sukses</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${srv.success_rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Distribution Histogram */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">
              Distribusi Trafik 24 Jam
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Volume penerimaan SMS OTP sepanjang hari
            </p>

            <div className="flex items-end justify-between gap-2 h-44 pt-4 pb-2 border-b border-neutral-100">
              {(
                stats?.hourly_distribution || [
                  { hour: '00:00', count: 320 },
                  { hour: '03:00', count: 180 },
                  { hour: '06:00', count: 420 },
                  { hour: '09:00', count: 980 },
                  { hour: '12:00', count: 1450 },
                  { hour: '15:00', count: 1820 },
                  { hour: '18:00', count: 1640 },
                  { hour: '21:00', count: 1230 },
                ]
              ).map((h) => {
                const max = 2000;
                const heightPct = Math.round((h.count / max) * 100);
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[9px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {h.count}
                    </span>
                    <div className="w-full bg-emerald-100 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300 relative">
                      <div
                        className="bg-emerald-600 rounded-t-md w-full transition-all"
                        style={{ height: `${heightPct}%`, minHeight: '8px' }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">{h.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
              <span>Puncak Aktivitas: 12:00 – 18:00 WIB</span>
            </span>
            <span className="text-[11px] font-mono">Status Node: Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
