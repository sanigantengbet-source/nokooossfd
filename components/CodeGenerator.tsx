'use client';

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Zap,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export function CodeGenerator() {
  const [selectedLanguage, setSelectedLanguage] = useState<
    'typescript' | 'nextjs_vercel' | 'python' | 'php' | 'curl' | 'go'
  >('typescript');
  const [copied, setCopied] = useState(false);

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const codeSnippets: Record<string, { title: string; filename: string; code: string; desc: string }> = {
    typescript: {
      title: 'TypeScript / Node.js (Full Lifecycle)',
      filename: 'zelapi-client.ts',
      desc: 'Complete automated lifecycle: Request Virtual Number -> Poll for OTP -> Release Number.',
      code: `/**
 * ZELAPI OTP Client - Complete TypeScript / Node.js Integration
 * Base URL: https://smsku.zelapi.eu.cc
 */

interface RequestNumberResponse {
  status: string;
  number: string;
  service: string;
  expires_in_seconds?: number;
}

interface LatestOtpResponse {
  status: string;
  number: string;
  otp?: string;
  message?: string;
}

export class ZelapiClient {
  private baseUrl = 'https://smsku.zelapi.eu.cc/api';

  /**
   * 1. Get available services & stock
   */
  async getServices() {
    const res = await fetch(\`\${this.baseUrl}/services\`);
    return await res.json();
  }

  /**
   * 2. Request a new temporary virtual number
   */
  async requestNumber(service: string = 'WhatsApp', country: string = 'Indonesia'): Promise<RequestNumberResponse> {
    const res = await fetch(\`\${this.baseUrl}/request_number\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, country }),
    });
    
    if (!res.ok) {
      throw new Error(\`Failed to request number: HTTP \${res.status}\`);
    }
    return await res.json();
  }

  /**
   * 3. Poll for incoming SMS OTP with timeout
   */
  async waitForOtp(phoneNumber: string, maxWaitSeconds: number = 180, intervalMs: number = 4000): Promise<string> {
    const startTime = Date.now();
    const cleanNum = phoneNumber.replace(/\\D/g, '');

    console.log(\`[ZELAPI] Waiting for OTP on \${cleanNum} (Timeout: \${maxWaitSeconds}s)...\`);

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      try {
        const res = await fetch(\`\${this.baseUrl}/latest_otp?number=\${encodeURIComponent(cleanNum)}\`);
        if (res.ok) {
          const data: LatestOtpResponse = await res.json();
          if (data.otp && data.otp.trim().length >= 3) {
            console.log(\`[ZELAPI] OTP Received: \${data.otp}\`);
            return data.otp;
          }
        }
      } catch (err) {
        console.warn('[ZELAPI] Check OTP retry...', err);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error(\`OTP Timeout: No SMS received on \${phoneNumber} within \${maxWaitSeconds}s\`);
  }

  /**
   * 4. Release active virtual number
   */
  async releaseNumber(phoneNumber: string) {
    const res = await fetch(\`\${this.baseUrl}/release_number\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: phoneNumber }),
    });
    return await res.json();
  }
}

// === EXAMPLE USAGE ===
async function main() {
  const client = new ZelapiClient();

  try {
    // 1. Request virtual number
    const numData = await client.requestNumber('WhatsApp', 'Indonesia');
    console.log('Nomor Virtual Dialokasikan:', numData.number);

    // 2. Poll for OTP
    const otpCode = await client.waitForOtp(numData.number, 120, 4000);
    console.log('Sukses! Kode OTP Verifikasi Anda:', otpCode);

    // 3. Release number
    await client.releaseNumber(numData.number);
    console.log('Nomor berhasil dilepaskan.');
  } catch (error) {
    console.error('Error during OTP flow:', error);
  }
}

// main();
`,
    },
    nextjs_vercel: {
      title: 'Next.js 15 App Router & Vercel Serverless Proxy',
      filename: 'app/api/otp/route.ts',
      desc: 'Deploy-ready for Vercel without CORS issues and zero configuration.',
      code: `// app/api/otp/route.ts (Next.js 15 Serverless API Route - Siap Vercel)
import { NextRequest, NextResponse } from 'next/server';

const ZELAPI_BASE = 'https://smsku.zelapi.eu.cc/api';

/**
 * GET Handler - Proxy for services, countries, latest_otp, stats, etc.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'services';

  let targetUrl = \`\${ZELAPI_BASE}/\${action}\`;

  if (action === 'latest_otp') {
    const number = searchParams.get('number');
    targetUrl = \`\${ZELAPI_BASE}/latest_otp?number=\${encodeURIComponent(number || '')}\`;
  } else if (action === 'countries') {
    const service = searchParams.get('service') || 'WhatsApp';
    targetUrl = \`\${ZELAPI_BASE}/countries?service=\${encodeURIComponent(service)}\`;
  }

  try {
    const response = await fetch(targetUrl, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST Handler - Request number & Release number
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'request_number'; // 'request_number' | 'release_number'

    const targetUrl = \`\${ZELAPI_BASE}/\${action}\`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload || body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`,
    },
    python: {
      title: 'Python (Requests & Async Polling)',
      filename: 'zelapi_client.py',
      desc: 'Clean Python integration with automatic polling and error resilience.',
      code: `import time
import requests

BASE_URL = "https://smsku.zelapi.eu.cc/api"

class ZelapiClient:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url

    def get_services(self):
        """Ambil list layanan yang tersedia."""
        resp = requests.get(f"{self.base_url}/services", timeout=10)
        resp.raise_for_status()
        return resp.json()

    def request_number(self, service="WhatsApp", country="Indonesia"):
        """Minta nomor virtual baru."""
        payload = {"service": service, "country": country}
        resp = requests.post(f"{self.base_url}/request_number", json=payload, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def wait_for_otp(self, number: str, timeout_seconds=180, interval=4):
        """Polling kode OTP hingga masuk atau timeout."""
        start_time = time.time()
        clean_num = ''.join(filter(str.isdigit, number))
        print(f"[*] Menunggu OTP untuk {clean_num} (Max {timeout_seconds} detik)...")

        while time.time() - start_time < timeout_seconds:
            try:
                resp = requests.get(
                    f"{self.base_url}/latest_otp",
                    params={"number": clean_num},
                    timeout=8
                )
                if resp.status_code == 200:
                    data = resp.json()
                    otp = data.get("otp")
                    if otp:
                        print(f"[+] OTP Ditemukan: {otp}")
                        return otp
            except Exception as e:
                print(f"[!] Warning polling retry: {e}")

            time.sleep(interval)

        raise TimeoutError(f"OTP tidak diterima setelah {timeout_seconds} detik.")

    def release_number(self, number: str):
        """Lepaskan nomor virtual setelah selesai."""
        resp = requests.post(
            f"{self.base_url}/release_number",
            json={"number": number},
            timeout=10
        )
        return resp.json()

# === Contoh Eksekusi ===
if __name__ == "__main__":
    client = ZelapiClient()
    
    # 1. Minta nomor WhatsApp
    data = client.request_number(service="WhatsApp", country="Indonesia")
    phone = data.get("number")
    print(f"[+] Berhasil dapat nomor: {phone}")

    # 2. Tunggu OTP masuk
    try:
        otp_code = client.wait_for_otp(phone, timeout_seconds=120)
        print(f"[SUCCESS] Kode OTP Anda: {otp_code}")
    finally:
        # 3. Selalu lepaskan nomor
        client.release_number(phone)
        print("[+] Nomor berhasil dilepaskan.")
`,
    },
    php: {
      title: 'PHP (cURL & Guzzle Ready)',
      filename: 'ZelapiOtp.php',
      desc: 'Robust PHP class compatible with Laravel, Symfony, or vanilla PHP.',
      code: `<?php
/**
 * ZELAPI OTP Client for PHP
 * Base URL: https://smsku.zelapi.eu.cc
 */

class ZelapiClient {
    private string $baseUrl = "https://smsku.zelapi.eu.cc/api";

    public function requestNumber(string $service = "WhatsApp", string $country = "Indonesia"): array {
        $ch = curl_init($this->baseUrl . "/request_number");
        $payload = json_encode(['service' => $service, 'country' => $country]);

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true) ?: [];
    }

    public function waitForOtp(string $number, int $timeoutSeconds = 180, int $intervalSeconds = 4): ?string {
        $startTime = time();
        $cleanNumber = preg_replace('/\\D/', '', $number);

        while ((time() - $startTime) < $timeoutSeconds) {
            $url = $this->baseUrl . "/latest_otp?number=" . urlencode($cleanNumber);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);

            $response = curl_exec($ch);
            curl_close($ch);

            $data = json_decode($response, true);
            if (!empty($data['otp'])) {
                return $data['otp'];
            }

            sleep($intervalSeconds);
        }

        return null; // Timeout
    }

    public function releaseNumber(string $number): array {
        $ch = curl_init($this->baseUrl . "/release_number");
        $payload = json_encode(['number' => $number]);

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true) ?: [];
    }
}

// === Contoh Penggunaan ===
$client = new ZelapiClient();
$res = $client->requestNumber("WhatsApp", "Indonesia");
$number = $res['number'] ?? null;

if ($number) {
    echo "Nomor Virtual: " . $number . "\\n";
    $otp = $client->waitForOtp($number, 120);
    echo "Kode OTP: " . ($otp ?: "Timeout / Belum Masuk") . "\\n";
    $client->releaseNumber($number);
}
?>
`,
    },
    curl: {
      title: 'cURL / Bash Script (CLI Automation)',
      filename: 'zelapi-otp.sh',
      desc: 'Simple bash script to automate OTP receiving directly from Terminal.',
      code: `#!/usr/bin/env bash
# ZELAPI OTP Automation Script

SERVICE="\${1:-WhatsApp}"
COUNTRY="\${2:-Indonesia}"
BASE_URL="https://smsku.zelapi.eu.cc/api"

echo "[1/3] Meminta nomor virtual untuk layanan: $SERVICE ($COUNTRY)..."
REQ_RESP=$(curl -s -X POST "$BASE_URL/request_number" \\
  -H "Content-Type: application/json" \\
  -d "{\\"service\\": \\"$SERVICE\\", \\"country\\": \\"$COUNTRY\\"}")

NUMBER=$(echo $REQ_RESP | grep -o '"number":"[^"]*' | grep -o '[^"]*$')

if [ -z "$NUMBER" ]; then
  echo "Error meminta nomor: $REQ_RESP"
  exit 1
fi

echo "[+] Nomor Virtual Didapatkan: $NUMBER"
echo "[2/3] Menunggu SMS OTP (Polling setiap 4 detik)..."

for i in {1..40}; do
  OTP_RESP=$(curl -s "$BASE_URL/latest_otp?number=$NUMBER")
  OTP_CODE=$(echo $OTP_RESP | grep -o '"otp":"[^"]*' | grep -o '[^"]*$')
  
  if [ ! -z "$OTP_CODE" ]; then
    echo "=========================================="
    echo ">> KODE OTP DITERIMA: $OTP_CODE <<"
    echo "=========================================="
    break
  fi
  sleep 4
done

echo "[3/3] Melepaskan nomor virtual..."
curl -s -X POST "$BASE_URL/release_number" \\
  -H "Content-Type: application/json" \\
  -d "{\\"number\\": \\"$NUMBER\\"}" > /dev/null

echo "Selesai!"
`,
    },
    go: {
      title: 'Go (Golang net/http)',
      filename: 'main.go',
      desc: 'High-performance Go implementation with context timeouts.',
      code: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const baseURL = "https://smsku.zelapi.eu.cc/api"

type RequestNumberPayload struct {
	Service string \`json:"service"\`
	Country string \`json:"country"\`
}

type NumberResponse struct {
	Status string \`json:"status"\`
	Number string \`json:"number"\`
}

type OtpResponse struct {
	Status string \`json:"status"\`
	Number string \`json:"number"\`
	Otp    string \`json:"otp"\`
}

func main() {
	// 1. Request virtual number
	payload, _ := json.Marshal(RequestNumberPayload{Service: "WhatsApp", Country: "Indonesia"})
	resp, err := http.Post(baseURL+"/request_number", "application/json", bytes.NewBuffer(payload))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var numData NumberResponse
	json.NewDecoder(resp.Body).Decode(&numData)
	fmt.Printf("Nomor Virtual: %s\\n", numData.Number)

	// 2. Poll for OTP (Timeout 2 minutes)
	ticker := time.NewTicker(4 * time.Second)
	defer ticker.Stop()
	timeout := time.After(2 * time.Minute)

	fmt.Println("Menunggu SMS OTP...")
	for {
		select {
		case <-timeout:
			fmt.Println("Timeout: OTP tidak diterima.")
			return
		case <-ticker.C:
			res, err := http.Get(fmt.Sprintf("%s/latest_otp?number=%s", baseURL, numData.Number))
			if err == nil {
				var otpData OtpResponse
				json.NewDecoder(res.Body).Decode(&otpData)
				res.Body.Close()

				if otpData.Otp != "" {
					fmt.Printf("Sukses! Kode OTP: %s\\n", otpData.Otp)
					return
				}
			}
		}
	}
}
`,
    },
  };

  const activeSnippet = codeSnippets[selectedLanguage];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900 text-base">
                Generator Kode SDK &amp; Contoh Integrasi
              </h2>
              <p className="text-xs text-neutral-500">
                Pilih bahasa pemrograman favorit Anda untuk integrasi siap pakai
              </p>
            </div>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'typescript', label: 'TypeScript / Node' },
            { id: 'nextjs_vercel', label: 'Next.js 15 (Vercel)' },
            { id: 'python', label: 'Python' },
            { id: 'php', label: 'PHP' },
            { id: 'curl', label: 'cURL / Bash' },
            { id: 'go', label: 'Go (Golang)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLanguage(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedLanguage === tab.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code Viewer Card */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-lg overflow-hidden">
        {/* Editor Top Bar */}
        <div className="px-5 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-neutral-300 font-semibold">
              {activeSnippet.filename}
            </span>
          </div>

          <button
            id="btn-copy-code-snippet"
            onClick={() => handleCopy(activeSnippet.code)}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Salin Seluruh Kode</span>
              </>
            )}
          </button>
        </div>

        {/* Description Banner */}
        <div className="px-5 py-2.5 bg-neutral-900/60 border-b border-neutral-800/80 text-xs text-neutral-400 flex items-center space-x-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>{activeSnippet.desc}</span>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-x-auto max-h-[520px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
            {activeSnippet.code}
          </pre>
        </div>
      </div>

      {/* Best Practice Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-neutral-900">Interval Polling yang Tepat</h4>
          </div>
          <p className="text-xs text-neutral-600">
            Gunakan jeda <strong>3–5 detik</strong> saat mengecek <code>/latest_otp</code> agar tidak memicu rate-limiting pada server.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <h4 className="text-xs font-bold text-neutral-900">Auto-Release Nomor</h4>
          </div>
          <p className="text-xs text-neutral-600">
            Selalu panggil <code>POST /release_number</code> di dalam block <code>finally</code> untuk membebaskan nomor virtual.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold text-neutral-900">Deploy Serverless Vercel</h4>
          </div>
          <p className="text-xs text-neutral-600">
            Gunakan API Proxy di Next.js untuk mencegah pemblokiran CORS oleh browser saat memanggil API eksternal.
          </p>
        </div>
      </div>
    </div>
  );
}
