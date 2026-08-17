import { NextRequest, NextResponse } from 'next/server';
import {
  MOCK_SERVICES,
  MOCK_COUNTRIES,
  MOCK_LIVE_OTPS,
  MOCK_STATS_DETAILED,
} from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://smsku.zelapi.eu.cc/api';

// In-memory simulation store for active numbers during simulated session
let simulatedActiveNumbers: any[] = [
  {
    id: 'num-sim-1',
    number: '6288269202428',
    service: 'WhatsApp',
    country: 'Indonesia',
    status: 'active',
    created_at: new Date(Date.now() - 60000).toISOString(),
    expires_at: Date.now() + 14 * 60 * 1000,
    latest_otp: '782910',
    otp_message: 'Your WhatsApp registration code: 782-910',
  },
];

let simulatedOtpHistory: any[] = [...MOCK_LIVE_OTPS];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  const targetUrl = `${BASE_URL}/${pathString}${queryString}`;

  const startTime = Date.now();
  const forceMock = req.headers.get('x-mock-mode') === 'true';

  if (forceMock) {
    const mockData = getMockDataForPath(pathString, req.nextUrl.searchParams);
    return NextResponse.json({
      ...mockData,
      _source: 'simulation',
      _latencyMs: Date.now() - startTime,
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ZelapiClient/1.0 (Next.js Dashboard)',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      if (pathString.startsWith('latest_otp')) {
        const number = req.nextUrl.searchParams.get('number') || '';
        return NextResponse.json({
          status: 'waiting',
          message: 'Belum ada SMS OTP masuk untuk nomor ini',
          otp: null,
          number,
          _source: 'live_waiting',
          _latencyMs: latencyMs,
        });
      }

      const mockFallback = getMockDataForPath(pathString, req.nextUrl.searchParams);
      return NextResponse.json({
        ...mockFallback,
        _source: 'fallback',
        _remoteStatus: response.status,
        _remoteStatusText: response.statusText,
        _latencyMs: latencyMs,
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json({
        ...data,
        _source: 'live',
        _latencyMs: latencyMs,
      });
    } else {
      const text = await response.text();
      try {
        const parsed = JSON.parse(text);
        return NextResponse.json({
          ...parsed,
          _source: 'live',
          _latencyMs: latencyMs,
        });
      } catch {
        if (pathString.startsWith('latest_otp')) {
          const number = req.nextUrl.searchParams.get('number') || '';
          return NextResponse.json({
            status: 'waiting',
            message: 'Belum ada SMS OTP masuk untuk nomor ini',
            otp: null,
            number,
            _source: 'live_waiting',
            _latencyMs: latencyMs,
          });
        }
        const mockFallback = getMockDataForPath(pathString, req.nextUrl.searchParams);
        return NextResponse.json({
          ...mockFallback,
          _source: 'fallback',
          _rawText: text.substring(0, 200),
          _latencyMs: latencyMs,
        });
      }
    }
  } catch (error: any) {
    if (pathString.startsWith('latest_otp')) {
      const number = req.nextUrl.searchParams.get('number') || '';
      return NextResponse.json({
        status: 'waiting',
        message: 'Belum ada SMS OTP masuk untuk nomor ini (menunggu pengiriman SMS)',
        otp: null,
        number,
        _source: 'live_waiting',
        _latencyMs: Date.now() - startTime,
      });
    }

    const mockFallback = getMockDataForPath(pathString, req.nextUrl.searchParams);
    return NextResponse.json({
      ...mockFallback,
      _source: 'fallback',
      _error: error?.message || 'Connection timeout',
      _latencyMs: Date.now() - startTime,
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const targetUrl = `${BASE_URL}/${pathString}`;
  const startTime = Date.now();
  const forceMock = req.headers.get('x-mock-mode') === 'true';

  let bodyData: any = {};
  try {
    bodyData = await req.json();
  } catch {
    bodyData = {};
  }

  if (forceMock) {
    const mockResult = handleMockPost(pathString, bodyData);
    return NextResponse.json({
      ...mockResult,
      _source: 'simulation',
      _latencyMs: Date.now() - startTime,
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ZelapiClient/1.0 (Next.js Dashboard)',
      },
      body: JSON.stringify(bodyData),
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const mockResult = handleMockPost(pathString, bodyData);
      return NextResponse.json({
        ...mockResult,
        _source: 'fallback',
        _remoteStatus: response.status,
        _latencyMs: latencyMs,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      ...data,
      _source: 'live',
      _latencyMs: latencyMs,
    });
  } catch (error: any) {
    const mockResult = handleMockPost(pathString, bodyData);
    return NextResponse.json({
      ...mockResult,
      _source: 'fallback',
      _error: error?.message,
      _latencyMs: Date.now() - startTime,
    });
  }
}

function getMockDataForPath(path: string, searchParams: URLSearchParams) {
  if (path.startsWith('services')) {
    return {
      status: 'success',
      services: MOCK_SERVICES,
      count: MOCK_SERVICES.length,
    };
  }

  if (path.startsWith('countries')) {
    const service = searchParams.get('service') || 'WhatsApp';
    return {
      status: 'success',
      service,
      countries: MOCK_COUNTRIES.default,
      count: MOCK_COUNTRIES.default.length,
    };
  }

  if (path.startsWith('my_numbers')) {
    return {
      status: 'success',
      numbers: simulatedActiveNumbers,
      count: simulatedActiveNumbers.length,
    };
  }

  if (path.startsWith('latest_otp')) {
    const number = searchParams.get('number') || '';
    const active = simulatedActiveNumbers.find((n) => n.number === number || n.number.includes(number));
    
    // Generate simulated OTP if number is found
    const otpCode = active?.latest_otp || Math.floor(100000 + Math.random() * 900000).toString();
    const serviceName = active?.service || 'WhatsApp';

    return {
      status: 'success',
      number: number || '6288269202428',
      service: serviceName,
      otp: otpCode,
      message: `Your ${serviceName} verification code is: ${otpCode}. Valid for 10 minutes.`,
      received_at: new Date().toISOString(),
    };
  }

  if (path.startsWith('my_otps')) {
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    return {
      status: 'success',
      otps: simulatedOtpHistory.slice(0, limit),
      total: simulatedOtpHistory.length,
    };
  }

  if (path.startsWith('otp')) {
    const count = parseInt(searchParams.get('count') || '10', 10);
    return {
      status: 'success',
      feed: MOCK_LIVE_OTPS.slice(0, count),
      count: Math.min(count, MOCK_LIVE_OTPS.length),
      timestamp: new Date().toISOString(),
    };
  }

  if (path.startsWith('stats/detailed') || path.startsWith('stats')) {
    const period = searchParams.get('period') || 'daily';
    return {
      status: 'success',
      ...MOCK_STATS_DETAILED,
      period,
    };
  }

  return {
    status: 'success',
    message: `Endpoint ${path} simulated response`,
    timestamp: new Date().toISOString(),
  };
}

function handleMockPost(path: string, body: any) {
  if (path.startsWith('request_number')) {
    const service = body.service || 'WhatsApp';
    const country = body.country || 'Indonesia';
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const prefix = country === 'Indonesia' ? '62882' : '1415';
    const generatedNumber = `${prefix}${randomSuffix}`;

    const newNumber: {
      id: string;
      number: string;
      service: string;
      country: string;
      status: string;
      created_at: string;
      expires_at: number;
      latest_otp: string | null;
      otp_message: string | null;
    } = {
      id: `num-${Date.now()}`,
      number: generatedNumber,
      service,
      country,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: Date.now() + 15 * 60 * 1000,
      latest_otp: null,
      otp_message: null,
    };

    simulatedActiveNumbers.unshift(newNumber);

    // Simulate OTP arriving after 6 seconds in mock mode
    setTimeout(() => {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      newNumber.latest_otp = generatedOtp;
      newNumber.otp_message = `Your ${service} code is ${generatedOtp}. Do not share.`;
      
      simulatedOtpHistory.unshift({
        id: `otp-${Date.now()}`,
        number: generatedNumber,
        service,
        otp: generatedOtp,
        message: newNumber.otp_message,
        received_at: new Date().toISOString(),
        sender: service,
        country,
      });
    }, 6000);

    return {
      status: 'success',
      message: 'Temporary virtual number allocated successfully',
      number: generatedNumber,
      service,
      country,
      expires_in_seconds: 900,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  if (path.startsWith('release_number')) {
    const numberToRelease = body.number || body.id;
    simulatedActiveNumbers = simulatedActiveNumbers.filter(
      (n) => n.number !== numberToRelease && n.id !== numberToRelease
    );
    return {
      status: 'success',
      message: `Number ${numberToRelease || 'virtual'} released successfully`,
      released_number: numberToRelease,
    };
  }

  return {
    status: 'success',
    message: 'Action completed',
    data: body,
  };
}
