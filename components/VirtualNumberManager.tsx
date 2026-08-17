'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Clock,
  ShieldAlert,
  Inbox,
  Zap,
  Radio,
  Bell,
  MessageSquare,
  AlertCircle,
  Wifi,
  Signal,
  Sparkles,
  Layers
} from 'lucide-react';
import { ZelapiService, ZelapiCountry, ZelapiNumber, ZelapiOtpItem } from '@/lib/types';

interface VirtualNumberManagerProps {
  useSimulation: boolean;
  onSelectEndpointInTester?: (endpoint: string, method: string, payload?: any) => void;
}

export function VirtualNumberManager({
  useSimulation,
}: VirtualNumberManagerProps) {
  // Services & Countries State
  const [services, setServices] = useState<ZelapiService[]>([]);
  const [selectedService, setSelectedService] = useState<string>('WhatsApp');
  const [countries, setCountries] = useState<ZelapiCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('Indonesia');

  // Active Numbers & OTP state
  const [activeNumbers, setActiveNumbers] = useState<ZelapiNumber[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newOtpReceivedAlert, setNewOtpReceivedAlert] = useState<{ number: string; otp: string } | null>(null);

  // OTP History
  const [otpHistory, setOtpHistory] = useState<ZelapiOtpItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHeaders = {
    'x-mock-mode': useSimulation ? 'true' : 'false',
  };

  // 1. Fetch available services on mount
  const loadServices = useCallback(async () => {
    try {
      const res = await fetch('/api/zelapi/services', {
        headers: { 'x-mock-mode': useSimulation ? 'true' : 'false' },
      });
      const json = await res.json();
      if (json.services && Array.isArray(json.services)) {
        setServices(json.services);
      } else if (Array.isArray(json)) {
        setServices(json);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }, [useSimulation]);

  // 2. Load active numbers
  const loadActiveNumbers = useCallback(async () => {
    try {
      const res = await fetch('/api/zelapi/my_numbers', {
        headers: { 'x-mock-mode': useSimulation ? 'true' : 'false' },
      });
      const json = await res.json();
      if (json.numbers && Array.isArray(json.numbers)) {
        setActiveNumbers(json.numbers);
      } else if (Array.isArray(json)) {
        setActiveNumbers(json);
      }
    } catch (err) {
      console.error('Failed to fetch active numbers:', err);
    }
  }, [useSimulation]);

  // 3. Load OTP history
  const loadOtpHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/zelapi/my_otps?limit=15', {
        headers: { 'x-mock-mode': useSimulation ? 'true' : 'false' },
      });
      const json = await res.json();
      if (json.otps && Array.isArray(json.otps)) {
        setOtpHistory(json.otps);
      }
    } catch (err) {
      console.error('Failed to fetch OTP history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [useSimulation]);

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      loadServices();
      loadActiveNumbers();
      loadOtpHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadServices, loadActiveNumbers, loadOtpHistory]);

  // Fetch countries when service changes
  useEffect(() => {
    let isMounted = true;
    async function loadCountries() {
      if (!selectedService) return;
      try {
        const res = await fetch(`/api/zelapi/countries?service=${encodeURIComponent(selectedService)}`, {
          headers: { 'x-mock-mode': useSimulation ? 'true' : 'false' },
        });
        const json = await res.json();
        if (isMounted && json.countries && Array.isArray(json.countries)) {
          setCountries(json.countries);
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    }

    loadCountries();
    return () => {
      isMounted = false;
    };
  }, [selectedService, useSimulation]);

  // Check latest OTP for a specific number
  const checkLatestOtp = useCallback(async (number: string) => {
    try {
      const cleanNum = number.replace(/\D/g, '');
      const res = await fetch(`/api/zelapi/latest_otp?number=${encodeURIComponent(cleanNum)}`, {
        headers: { 'x-mock-mode': useSimulation ? 'true' : 'false' },
      });
      const data = await res.json();

      const otpCode = data?.otp || data?.code || data?.otp_code || (data?.has_otp && data?.data?.otp);
      const messageText = data?.message || data?.sms || data?.otp_message || (otpCode ? `OTP: ${otpCode}` : undefined);

      if (otpCode) {
        setActiveNumbers((prev) =>
          prev.map((item) => {
            if (item.number === number || item.number === cleanNum) {
              if (!item.latest_otp || item.latest_otp !== String(otpCode)) {
                setNewOtpReceivedAlert({ number, otp: String(otpCode) });
              }
              return {
                ...item,
                latest_otp: String(otpCode),
                otp_message: messageText || item.otp_message,
                status: 'otp_received',
                last_checked: new Date().toLocaleTimeString(),
              };
            }
            return item;
          })
        );
        return String(otpCode);
      }
      return null;
    } catch (err) {
      console.warn(`Error checking OTP for ${number}:`, err);
      return null;
    }
  }, [useSimulation]);

  // Request new virtual number
  async function handleRequestNumber() {
    setIsRequesting(true);
    setRequestError(null);

    try {
      const res = await fetch('/api/zelapi/request_number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...fetchHeaders,
        },
        body: JSON.stringify({
          service: selectedService,
          country: selectedCountry,
        }),
      });

      const data = await res.json();
      const allocatedNumber = data?.number || data?.phone || data?.data?.number || data?.data?.phone;

      if (res.ok && allocatedNumber) {
        const newNum: ZelapiNumber = {
          id: data.id || `num-${Date.now()}`,
          number: String(allocatedNumber),
          service: selectedService,
          country: selectedCountry,
          status: 'active',
          created_at: new Date().toISOString(),
          expires_at: data.expires_at || Date.now() + 15 * 60 * 1000,
          latest_otp: null,
          otp_message: null,
        };

        setActiveNumbers((prev) => [newNum, ...prev]);

        // Auto poll single number
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const otp = await checkLatestOtp(String(allocatedNumber));
          if (otp || attempts >= 15) {
            clearInterval(interval);
          }
        }, 3500);
      } else {
        setRequestError(data.message || data.error || 'Gagal meminta nomor virtual dari server.');
      }
    } catch (err: any) {
      setRequestError(err?.message || 'Koneksi ke server ZELAPI gagal.');
    } finally {
      setIsRequesting(false);
    }
  }

  // Release a virtual number
  async function handleReleaseNumber(number: string, id?: string) {
    try {
      await fetch('/api/zelapi/release_number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...fetchHeaders,
        },
        body: JSON.stringify({ number, id }),
      });

      setActiveNumbers((prev) => prev.filter((item) => item.number !== number && item.id !== id));
      loadOtpHistory();
    } catch (err) {
      console.error('Failed to release number:', err);
    }
  }

  // Poll active numbers periodically (staggered & throttled to prevent timeout/flood)
  useEffect(() => {
    if (!isPolling || activeNumbers.length === 0) return;

    // Only poll numbers that are still waiting for an OTP
    const pendingNumbers = activeNumbers.filter((n) => !n.latest_otp);
    if (pendingNumbers.length === 0) return;

    const interval = setInterval(() => {
      pendingNumbers.forEach((numObj, index) => {
        // Stagger requests by index to prevent simultaneous network burst
        setTimeout(() => {
          checkLatestOtp(numObj.number);
        }, index * 600);
      });
    }, Math.max(5000, pendingNumbers.length * 800));

    return () => clearInterval(interval);
  }, [isPolling, activeNumbers, checkLatestOtp]);

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Alert banner for newly arrived OTP */}
      {newOtpReceivedAlert && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                SMS OTP Baru Diterima!
              </p>
              <p className="text-sm font-medium text-emerald-950">
                Nomor: <span className="font-mono">{newOtpReceivedAlert.number}</span> | Kode:{' '}
                <span className="font-mono font-bold text-lg text-emerald-700">
                  {newOtpReceivedAlert.otp}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-copy-new-otp"
              onClick={() => handleCopy(newOtpReceivedAlert.otp, 'new_otp')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              {copiedText === 'new_otp' ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin OTP</span>
                </>
              )}
            </button>
            <button
              onClick={() => setNewOtpReceivedAlert(null)}
              className="text-neutral-400 hover:text-neutral-700 text-sm px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Request Form (Left) & Active Numbers / Live Inbox (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Number Request Panel */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-100 mb-4 sm:mb-5">
              <div className="flex items-center space-x-2 sm:space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-neutral-900 text-sm sm:text-base">Minta Nomor Virtual</h2>
                  <p className="text-[11px] sm:text-xs text-neutral-500">Pilih layanan &amp; alokasikan nomor OTP</p>
                </div>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 hidden xs:inline-block">
                POST /api/request_number
              </span>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 sm:space-y-4">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Layanan / Aplikasi (Service)
                </label>
                <div className="relative">
                  <select
                    id="select-service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm text-neutral-900 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  >
                    {services.length > 0 ? (
                      services.map((srv, idx) => (
                        <option key={`srv-${srv.name || 'item'}-${idx}`} value={srv.name}>
                          {srv.name} {srv.available ? `(${srv.available} nomor tersedia)` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="WhatsApp">WhatsApp (Tersedia)</option>
                        <option value="Telegram">Telegram (Tersedia)</option>
                        <option value="Google / Gmail">Google / Gmail (Tersedia)</option>
                        <option value="TikTok">TikTok (Tersedia)</option>
                        <option value="OpenAI / ChatGPT">OpenAI / ChatGPT (Tersedia)</option>
                        <option value="Dana">Dana (Tersedia)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Negara (Country)
                </label>
                <div className="relative">
                  <select
                    id="select-country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full h-11 px-3 pr-8 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm text-neutral-900 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  >
                    {countries.length > 0 ? (
                      countries.map((c, idx) => (
                        <option key={`country-${c.code || c.name || 'c'}-${idx}`} value={c.name}>
                          {c.name} ({c.prefix || ''}) {c.available ? `- ${c.available} slot` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Indonesia">Indonesia (+62)</option>
                        <option value="United States">United States (+1)</option>
                        <option value="Malaysia">Malaysia (+60)</option>
                        <option value="United Kingdom">United Kingdom (+44)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {requestError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{requestError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-submit-request-number"
                onClick={handleRequestNumber}
                disabled={isRequesting}
                className="w-full h-12 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-sm shadow-red-600/20 transition-all cursor-pointer relative overflow-hidden"
              >
                {isRequesting ? (
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    <span className="animate-pulse">Mengalokasikan Nomor Virtual...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span>Dapatkan Nomor Baru</span>
                  </>
                )}
              </button>

              {/* Animated Status Card when Requesting Number */}
              {isRequesting && (
                <div className="p-3.5 bg-gradient-to-r from-red-500/10 via-neutral-900/5 to-red-500/10 border border-red-500/30 rounded-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span className="font-bold text-neutral-900">Menghubungi Server SFG-NOKOS</span>
                    </div>
                    <span className="text-[11px] font-mono text-red-600 font-semibold animate-pulse">
                      Processing...
                    </span>
                  </div>

                  {/* High-tech scanning laser bar */}
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-red-600 rounded-full animate-pulse w-full" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span>Target: {selectedService} ({selectedCountry})</span>
                    <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                      <Wifi className="h-3 w-3 animate-pulse" />
                      <span>Alokasi Slot Aktif</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-semibold text-neutral-800 mb-2 flex items-center space-x-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                <span>Petunjuk Penggunaan:</span>
              </h4>
              <ul className="text-[11px] sm:text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
                <li>Nomor aktif selama <strong>10–15 menit</strong> untuk menerima SMS.</li>
                <li>Setelah nomor muncul, masukkan ke aplikasi target (cth: WhatsApp).</li>
                <li>Sistem akan otomatis mendeteksi kode OTP yang masuk.</li>
                <li>Lepaskan nomor setelah verifikasi selesai.</li>
              </ul>
            </div>
          </div>

          {/* Quick API Snippet Helper */}
          <div className="bg-neutral-900 rounded-2xl p-3.5 sm:p-4 text-neutral-300 text-xs font-mono space-y-2 border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 pb-1 border-b border-neutral-800 text-[11px]">
              <span>Direct cURL Request</span>
              <button
                onClick={() =>
                  handleCopy(
                    `curl -X POST https://smsku.zelapi.eu.cc/api/request_number \\\n  -H "Content-Type: application/json" \\\n  -d '{"service":"${selectedService}","country":"${selectedCountry}"}'`,
                    'curl_cmd'
                  )
                }
                className="hover:text-white flex items-center space-x-1 text-red-400 cursor-pointer"
              >
                {copiedText === 'curl_cmd' ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[10px] sm:text-[11px] leading-relaxed text-red-300">
{`curl -X POST https://smsku.zelapi.eu.cc/api/request_number \\
  -H "Content-Type: application/json" \\
  -d '{"service":"${selectedService}","country":"${selectedCountry}"}'`}
            </pre>
          </div>
        </div>

        {/* Right Column: Active Numbers & Live Inbox */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Active Numbers Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between pb-3 sm:pb-4 border-b border-neutral-100 mb-4 gap-2">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-neutral-900 text-sm sm:text-base">
                    Nomor Aktif ({activeNumbers.length})
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-500">
                    Auto-polling kode OTP realtime
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <button
                  id="btn-toggle-polling"
                  onClick={() => setIsPolling(!isPolling)}
                  className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs font-medium border flex items-center space-x-1 transition-all cursor-pointer ${
                    isPolling
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                  }`}
                  title="Auto-refresh OTP setiap 4 detik"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isPolling ? 'bg-emerald-500 animate-ping' : 'bg-neutral-400'
                    }`}
                  />
                  <span>{isPolling ? 'Auto ON' : 'Paused'}</span>
                </button>

                <button
                  id="btn-refresh-active-numbers"
                  onClick={async () => {
                    setIsRefreshing(true);
                    await loadActiveNumbers();
                    activeNumbers.forEach((n) => checkLatestOtp(n.number));
                    setIsRefreshing(false);
                  }}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                  title="Refresh status nomor"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* List of Active Numbers */}
            {activeNumbers.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <Inbox className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-800 mb-1">
                  Belum ada nomor virtual aktif
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Gunakan formulir di sebelah kiri untuk meminta nomor virtual sementara untuk menerima SMS OTP.
                </p>
                <button
                  onClick={handleRequestNumber}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Coba Request Nomor Demo</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeNumbers.map((item, idx) => (
                  <div
                    key={`active-num-${item.id || item.number || 'num'}-${idx}`}
                    className={`border rounded-xl p-4 transition-all ${
                      item.latest_otp
                        ? 'border-emerald-300 bg-emerald-50/30 shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    {/* Top Row: Service, Number, Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {item.service}
                        </span>
                        {item.country && (
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {item.country}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400">
                          • {new Date(item.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => checkLatestOtp(item.number)}
                          className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Cek OTP</span>
                        </button>
                        <button
                          onClick={() => handleReleaseNumber(item.number, item.id)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Lepaskan nomor ini"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Lepas</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Phone Number & Copy */}
                    <div className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                          Nomor Telepon Virtual
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xl sm:text-2xl font-mono font-bold text-neutral-900 tracking-wider">
                            {item.number}
                          </span>
                          <button
                            id={`btn-copy-${item.number}`}
                            onClick={() => handleCopy(item.number, `num_${item.number}`)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                            title="Salin Nomor"
                          >
                            {copiedText === `num_${item.number}` ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Status / OTP Badge */}
                      <div>
                        {item.latest_otp ? (
                          <div className="bg-emerald-600 text-white rounded-xl p-3 text-center shadow-xs">
                            <p className="text-[10px] font-medium tracking-wide uppercase opacity-90">
                              Kode OTP Diterima
                            </p>
                            <div className="flex items-center space-x-2 mt-0.5 justify-center">
                              <span className="text-2xl font-mono font-black tracking-widest">
                                {item.latest_otp}
                              </span>
                              <button
                                onClick={() => handleCopy(item.latest_otp!, `otp_${item.number}`)}
                                className="p-1 bg-emerald-700 hover:bg-emerald-800 rounded text-white transition-colors cursor-pointer"
                                title="Salin Kode OTP"
                              >
                                {copiedText === `otp_${item.number}` ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/60 border border-amber-200/90 rounded-xl p-3 shadow-2xs">
                            {/* Scanning laser line at the top */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />

                            <div className="flex items-center space-x-2.5">
                              {/* Radar Pulse Beacon with double ring ping */}
                              <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/15 text-amber-700 shrink-0">
                                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-400 opacity-60"></span>
                                <Radio className="h-4 w-4 relative z-10 text-amber-600 animate-pulse" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center space-x-1.5">
                                  <p className="font-bold text-xs text-amber-950 truncate">Menunggu SMS OTP</p>
                                  {/* Soundwave animated bars */}
                                  <div className="flex items-end space-x-0.5 h-3 shrink-0">
                                    <span className="w-0.5 bg-amber-500 rounded-full h-2 animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-0.5 bg-amber-600 rounded-full h-3 animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-0.5 bg-amber-500 rounded-full h-1.5 animate-bounce"></span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-amber-700 font-mono flex items-center space-x-1 mt-0.5">
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                  <span className="truncate">Auto-listener aktif (realtime)</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Preview (If any) */}
                    {item.otp_message && (
                      <div className="mt-2 p-2.5 bg-neutral-100/80 rounded-lg text-xs text-neutral-700 font-mono border border-neutral-200/50 flex items-start space-x-2">
                        <MessageSquare className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item.otp_message}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OTP History Table */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
                  <Inbox className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm">Riwayat OTP Saya (/api/my_otps)</h3>
              </div>
              <button
                onClick={() => loadOtpHistory()}
                disabled={isLoadingHistory}
                className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
            </div>

            {otpHistory.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">
                Belum ada riwayat OTP yang tercatat.
              </p>
            ) : (
              <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-neutral-400 border-b border-neutral-100 font-medium">
                      <th className="pb-2">Layanan</th>
                      <th className="pb-2">Nomor</th>
                      <th className="pb-2">Kode OTP</th>
                      <th className="pb-2">Pesan</th>
                      <th className="pb-2 text-right">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {otpHistory.map((h, idx) => (
                      <tr key={`otp-hist-row-${h.id || h.number || 'otp'}-${idx}`} className="hover:bg-neutral-50/80">
                        <td className="py-2.5 font-medium text-neutral-900">{h.service}</td>
                        <td className="py-2.5 font-mono text-neutral-600">{h.number}</td>
                        <td className="py-2.5">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {h.otp}
                          </span>
                        </td>
                        <td className="py-2.5 text-neutral-500 max-w-[200px] truncate" title={h.message}>
                          {h.message || '-'}
                        </td>
                        <td className="py-2.5 text-right text-neutral-400 font-mono text-[11px]">
                          {h.received_at ? new Date(h.received_at).toLocaleTimeString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
