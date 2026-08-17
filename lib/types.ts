export interface ZelapiService {
  name: string;
  code?: string;
  available: number;
  price?: string | number;
  category?: string;
}

export interface ZelapiCountry {
  name: string;
  code: string;
  prefix: string;
  available?: number;
}

export interface ZelapiNumber {
  id?: string;
  number: string;
  service: string;
  country?: string;
  status: 'active' | 'waiting_otp' | 'otp_received' | 'expired' | 'released';
  created_at: string;
  expires_at?: string | number;
  latest_otp?: string | null;
  otp_message?: string | null;
  last_checked?: string;
}

export interface ZelapiOtpItem {
  id?: string | number;
  number: string;
  service: string;
  otp: string;
  message?: string;
  received_at: string;
  sender?: string;
  country?: string;
}

export interface ZelapiDetailedStats {
  period: string;
  total_requests: number;
  successful_otps: number;
  success_rate: number;
  active_virtual_numbers: number;
  avg_delivery_time_seconds: number;
  server_status: 'online' | 'degraded' | 'maintenance';
  uptime_percentage: number;
  top_services?: Array<{
    name: string;
    requests: number;
    success_rate: number;
  }>;
  hourly_distribution?: Array<{
    hour: string;
    count: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  isMockFallback?: boolean;
  latencyMs?: number;
  status?: number;
}
