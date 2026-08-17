'use client';

import React, { useState } from 'react';
import {
  Play,
  Copy,
  Check,
  RefreshCw,
  Code,
  Terminal,
  Server,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ApiTesterProps {
  useSimulation: boolean;
}

interface EndpointDef {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  defaultParams?: Record<string, string>;
  defaultBody?: any;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'services',
    name: 'List Layanan & Stok',
    method: 'GET',
    path: '/api/services',
    description: 'Menampilkan daftar layanan dengan jumlah nomor yang tersedia saat ini.',
  },
  {
    id: 'countries',
    name: 'List Negara per Layanan',
    method: 'GET',
    path: '/api/countries',
    description: 'Mendapatkan negara yang tersedia untuk layanan tertentu.',
    defaultParams: { service: 'WhatsApp' },
  },
  {
    id: 'request_number',
    name: 'Minta Nomor Virtual Baru',
    method: 'POST',
    path: '/api/request_number',
    description: 'Meminta nomor virtual sementara yang baru untuk menerima SMS.',
    defaultBody: { service: 'WhatsApp', country: 'Indonesia' },
  },
  {
    id: 'my_numbers',
    name: 'Daftar Nomor Aktif',
    method: 'GET',
    path: '/api/my_numbers',
    description: 'Menampilkan semua nomor virtual aktif yang saat ini dimiliki.',
  },
  {
    id: 'release_number',
    name: 'Lepaskan Nomor Virtual',
    method: 'POST',
    path: '/api/release_number',
    description: 'Melepaskan nomor virtual aktif setelah OTP selesai.',
    defaultBody: { number: '6288269202428' },
  },
  {
    id: 'latest_otp',
    name: 'Cek OTP Terbaru',
    method: 'GET',
    path: '/api/latest_otp',
    description: 'Mengecek kode OTP terbaru pada sebuah nomor virtual.',
    defaultParams: { number: '6288269202428' },
  },
  {
    id: 'my_otps',
    name: 'Riwayat OTP Saya',
    method: 'GET',
    path: '/api/my_otps',
    description: 'Membaca data OTP historis yang pernah diterima.',
    defaultParams: { limit: '10' },
  },
  {
    id: 'otp',
    name: 'Live Feed OTP Publik',
    method: 'GET',
    path: '/api/otp',
    description: 'Live feed OTP publik dari semua pesan OTP terbaru.',
    defaultParams: { count: '10' },
  },
  {
    id: 'stats_detailed',
    name: 'Statistik Detail & Status',
    method: 'GET',
    path: '/api/stats/detailed',
    description: 'Mengambil statistik performa dan status global sistem.',
    defaultParams: { period: 'daily' },
  },
];

export function ApiTester({ useSimulation }: ApiTesterProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [queryParams, setQueryParams] = useState<Record<string, string>>(
    ENDPOINTS[0].defaultParams || {}
  );
  const [requestBody, setRequestBody] = useState<string>(
    ENDPOINTS[0].defaultBody ? JSON.stringify(ENDPOINTS[0].defaultBody, null, 2) : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  function handleSelectEndpoint(ep: EndpointDef) {
    setSelectedEndpoint(ep);
    setQueryParams(ep.defaultParams || {});
    setRequestBody(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setResponseResult(null);
    setResponseStatus(null);
    setResponseLatency(null);
  }

  async function handleExecute() {
    setIsLoading(true);
    const startTime = Date.now();

    // Construct URL for proxy
    const cleanPath = selectedEndpoint.path.replace('/api/', '');
    const queryStr = new URLSearchParams(queryParams).toString();
    const proxyUrl = `/api/zelapi/${cleanPath}${queryStr ? `?${queryStr}` : ''}`;

    try {
      let res: Response;
      const headers: Record<string, string> = {
        'x-mock-mode': useSimulation ? 'true' : 'false',
      };

      if (selectedEndpoint.method === 'POST') {
        headers['Content-Type'] = 'application/json';
        let parsedBody = {};
        try {
          parsedBody = JSON.parse(requestBody || '{}');
        } catch {
          parsedBody = {};
        }

        res = await fetch(proxyUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(parsedBody),
        });
      } else {
        res = await fetch(proxyUrl, {
          method: 'GET',
          headers,
        });
      }

      const latency = Date.now() - startTime;
      const json = await res.json();

      setResponseStatus(res.status);
      setResponseLatency(latency);
      setResponseResult(json);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseLatency(Date.now() - startTime);
      setResponseResult({ error: err?.message || 'Request failed' });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopy(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  }

  const queryStr = new URLSearchParams(queryParams).toString();
  const directUrl = `https://smsku.zelapi.eu.cc${selectedEndpoint.path}${queryStr ? `?${queryStr}` : ''}`;
  const curlCommand =
    selectedEndpoint.method === 'GET'
      ? `curl -X GET "${directUrl}"`
      : `curl -X POST "${directUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/\n/g, '')}'`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left List of Endpoints */}
      <div className="lg:col-span-4 space-y-3">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Pilih Endpoint ZELAPI (9 Endpoints)
          </h3>
          <div className="space-y-1.5">
            {ENDPOINTS.map((ep) => {
              const isSelected = ep.id === selectedEndpoint.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                          : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-semibold">{ep.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Request & Response Console */}
      <div className="lg:col-span-8 space-y-6">
        {/* Request Config Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs font-bold text-neutral-900">
                  {selectedEndpoint.path}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">{selectedEndpoint.description}</p>
            </div>

            <button
              id="btn-execute-endpoint"
              onClick={handleExecute}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Kirim Request</span>
                </>
              )}
            </button>
          </div>

          {/* URL & Query Params Editor */}
          {selectedEndpoint.defaultParams && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700">
                Query Parameters:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(queryParams).map((key) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-neutral-500 w-24">{key}:</span>
                    <input
                      type="text"
                      value={queryParams[key]}
                      onChange={(e) =>
                        setQueryParams({ ...queryParams, [key]: e.target.value })
                      }
                      className="flex-1 h-8 px-2.5 rounded-lg border border-neutral-200 text-xs font-mono text-neutral-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body JSON Editor (for POST) */}
          {selectedEndpoint.method === 'POST' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700">
                Request JSON Body:
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={4}
                className="w-full p-3 font-mono text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

          {/* cURL Preview */}
          <div className="bg-neutral-900 rounded-xl p-3 text-neutral-300 font-mono text-[11px] flex items-center justify-between">
            <span className="truncate pr-2 text-emerald-400">{curlCommand.split('\n')[0]}</span>
            <button
              onClick={() => handleCopy(curlCommand, 'curl')}
              className="text-neutral-400 hover:text-white flex items-center space-x-1 shrink-0"
            >
              {copiedType === 'curl' ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Salin cURL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Response Viewer Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center space-x-3">
              <h4 className="font-bold text-neutral-900 text-sm">Response Body</h4>
              {responseStatus !== null && (
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  HTTP {responseStatus}
                </span>
              )}
              {responseLatency !== null && (
                <span className="text-xs font-mono text-neutral-500 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{responseLatency}ms</span>
                </span>
              )}
            </div>

            {responseResult && (
              <button
                onClick={() => handleCopy(JSON.stringify(responseResult, null, 2), 'response')}
                className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center space-x-1 font-medium"
              >
                {copiedType === 'response' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin JSON</span>
                  </>
                )}
              </button>
            )}
          </div>

          {responseResult ? (
            <pre className="p-4 bg-neutral-900 text-emerald-300 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {JSON.stringify(responseResult, null, 2)}
            </pre>
          ) : (
            <div className="py-12 text-center text-neutral-400 text-xs">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Klik &quot;Kirim Request&quot; untuk menguji endpoint ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
