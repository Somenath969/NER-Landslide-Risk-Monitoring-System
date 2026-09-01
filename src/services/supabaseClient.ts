import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  LocationData,
  SensorData,
  IncidentReport,
  DisasterAlert,
  RoadStatus,
  AuditLogItem,
} from '../types';

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (browserClient) return browserClient;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (url && anonKey && url.trim() !== '' && anonKey.trim() !== '') {
    try {
      browserClient = createClient(url, anonKey);
      return browserClient;
    } catch (e) {
      console.warn('Failed to init client-side Supabase:', e);
      return null;
    }
  }
  return null;
}

export interface SupabaseStatusData {
  isConfigured: boolean;
  isConnected: boolean;
  url: string;
  authType: 'service_role' | 'anon_key' | 'none';
  tables: {
    locations: number | null;
    sensors: number | null;
    sensor_telemetry: number | null;
    incidents: number | null;
    disaster_alerts: number | null;
    road_lifelines: number | null;
    audit_logs: number | null;
  };
  lastChecked: string;
  errorMessage?: string;
}

export async function fetchSupabaseStatus(): Promise<SupabaseStatusData> {
  try {
    const res = await fetch('/api/supabase/status');
    const json = await res.json();
    if (json.success && json.status) {
      return json.status;
    }
    throw new Error(json.error || 'Failed to fetch status');
  } catch (err: any) {
    return {
      isConfigured: false,
      isConnected: false,
      url: 'Error reaching server',
      authType: 'none',
      tables: {
        locations: null,
        sensors: null,
        sensor_telemetry: null,
        incidents: null,
        disaster_alerts: null,
        road_lifelines: null,
        audit_logs: null,
      },
      lastChecked: new Date().toISOString(),
      errorMessage: err?.message || 'Server error',
    };
  }
}

export async function seedSupabaseDatabase(): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    const res = await fetch('/api/supabase/seed', { method: 'POST' });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Seed request failed' };
  }
}

export async function fetchSupabaseSQLSchema(): Promise<string> {
  try {
    const res = await fetch('/api/supabase/schema');
    const json = await res.json();
    return json.sql || '';
  } catch {
    return '-- Failed to load schema from server';
  }
}

export async function fetchLocationsAPI(): Promise<LocationData[]> {
  try {
    const res = await fetch('/api/locations');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch locations error:', e);
    return [];
  }
}

export async function fetchSensorsAPI(): Promise<SensorData[]> {
  try {
    const res = await fetch('/api/sensors');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch sensors error:', e);
    return [];
  }
}

export async function fetchIncidentsAPI(): Promise<IncidentReport[]> {
  try {
    const res = await fetch('/api/incidents');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch incidents error:', e);
    return [];
  }
}

export async function fetchAlertsAPI(): Promise<DisasterAlert[]> {
  try {
    const res = await fetch('/api/alerts');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch alerts error:', e);
    return [];
  }
}

export async function fetchRoadsAPI(): Promise<RoadStatus[]> {
  try {
    const res = await fetch('/api/roads');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch roads error:', e);
    return [];
  }
}

export async function fetchAuditLogsAPI(): Promise<AuditLogItem[]> {
  try {
    const res = await fetch('/api/audit-logs');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch audit logs error:', e);
    return [];
  }
}
