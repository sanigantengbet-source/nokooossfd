'use client';

import React, { useState } from 'react';
import {
  X,
  Zap,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Globe,
  ArrowRight,
  Sparkles,
  Server
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VercelDeployModal({ isOpen, onClose }: VercelDeployModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleCopy(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  }

  const vercelCliCmd = `npm i -g vercel\nvercel login\nvercel`;
  const gitCmd = `git init\ngit add .\ngit commit -m "Deploy ZELAPI OTP Hub to Vercel"\ngit branch -M main\ngit remote add origin <YOUR_GITHUB_REPO>\ngit push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">
                Panduan Deploy ke Vercel (100% Support)
              </h3>
              <p className="text-xs text-neutral-500">
                Aplikasi ini dirancang khusus dengan Next.js 15 App Router siap produksi di Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Why it works perfectly on Vercel */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center space-x-2 mb-1 text-emerald-900 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Dukungan Penuh Tanpa Hambatan CORS:</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Struktur aplikasi menggunakan <strong>Next.js Serverless API Route Proxy</strong> (
              <code>/app/api/zelapi/[...path]/route.ts</code>). Saat di-deploy ke Vercel, semua request ke API ZELAPI (<code>https://smsku.zelapi.eu.cc</code>) diteruskan melalui serverless edge function Vercel, menjamin <strong>0 masalah CORS</strong> di semua browser.
            </p>
          </div>

          {/* Method 1: GitHub to Vercel (Recommended) */}
          <div className="space-y-2">
            <h4 className="font-bold text-neutral-900 flex items-center space-x-1.5 text-sm">
              <span className="h-5 w-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Metode 1: Deploy Otomatis via GitHub (Sangat Disarankan)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-600 pl-1">
              <li>Push kode project ini ke repositori <strong>GitHub</strong> atau <strong>GitLab</strong>.</li>
              <li>Buka dashboard <strong><a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-emerald-600 underline">vercel.com/new</a></strong>.</li>
              <li>Pilih repositori Anda, biarkan Framework Preset <code>Next.js</code>, lalu klik <strong>Deploy</strong>.</li>
              <li>Website Anda langsung online dengan domain <code>.vercel.app</code> dan sertifikat SSL gratis!</li>
            </ol>

            <div className="bg-neutral-900 rounded-xl p-3 text-neutral-300 font-mono text-[11px] flex items-center justify-between">
              <span className="truncate pr-2 text-emerald-300">{gitCmd.split('\n')[0]}</span>
              <button
                onClick={() => handleCopy(gitCmd, 'git')}
                className="text-emerald-400 hover:text-white flex items-center space-x-1 shrink-0"
              >
                {copiedType === 'git' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin Perintah Git</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Method 2: Vercel CLI */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <h4 className="font-bold text-neutral-900 flex items-center space-x-1.5 text-sm">
              <span className="h-5 w-5 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Metode 2: Deploy Cepat via Vercel CLI</span>
            </h4>
            <p className="text-neutral-600">
              Jalankan perintah berikut di terminal komputer Anda:
            </p>

            <div className="bg-neutral-900 rounded-xl p-3 text-neutral-300 font-mono text-[11px] flex items-center justify-between">
              <span className="truncate pr-2 text-emerald-300">npm i -g vercel && vercel</span>
              <button
                onClick={() => handleCopy(vercelCliCmd, 'cli')}
                className="text-emerald-400 hover:text-white flex items-center space-x-1 shrink-0"
              >
                {copiedType === 'cli' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin Perintah CLI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Next.js 15 Standalone Output Compatible
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
