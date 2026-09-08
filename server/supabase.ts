import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  initialLocations,
  initialSensors,
  initialRoads,
  initialIncidents,
  initialAlerts,
  initialAuditLogs,
} from '../src/data/nerData';

dotenv.config();

let supabaseInstance: SupabaseClient | null = null;

export interface SupabaseStatusInfo {
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

/**
 * Lazy initialization for Supabase client
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === '' || supabaseKey.trim() === '') {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl.trim(), supabaseKey.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.warn('[Supabase Server] Initialization error:', err);
    return null;
  }
}

/**
 * Check connection status and table counts
 */
export async function checkSupabaseStatus(): Promise<SupabaseStatusInfo> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const authType: 'service_role' | 'anon_key' | 'none' = serviceKey
    ? 'service_role'
    : anonKey
    ? 'anon_key'
    : 'none';

  const client = getSupabaseClient();

  if (!client || !supabaseUrl) {
    return {
      isConfigured: false,
      isConnected: false,
      url: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^/]+).*/, '$1') : 'Not Configured',
      authType,
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
      errorMessage: 'SUPABASE_URL or API keys are not defined in environment variables.',
    };
  }

  try {
    // Probe tables in parallel
    const [locRes, sensRes, incRes, alertRes, roadRes, auditRes] = await Promise.allSettled([
      client.from('locations').select('id', { count: 'exact', head: true }),
      client.from('sensors').select('id', { count: 'exact', head: true }),
      client.from('incidents').select('id', { count: 'exact', head: true }),
      client.from('disaster_alerts').select('id', { count: 'exact', head: true }),
      client.from('road_lifelines').select('id', { count: 'exact', head: true }),
      client.from('audit_logs').select('id', { count: 'exact', head: true }),
    ]);

    const getCount = (res: PromiseSettledResult<{ count: number | null; error: any }>) => {
      if (res.status === 'fulfilled' && !res.value.error) {
        return res.value.count ?? 0;
      }
      return null;
    };

    const isConnected =
      locRes.status === 'fulfilled' ||
      sensRes.status === 'fulfilled' ||
      incRes.status === 'fulfilled';

    return {
      isConfigured: true,
      isConnected,
      url: supabaseUrl.replace(/^(https?:\/\/[^/]+).*/, '$1'),
      authType,
      tables: {
        locations: getCount(locRes),
        sensors: getCount(sensRes),
        sensor_telemetry: null,
        incidents: getCount(incRes),
        disaster_alerts: getCount(alertRes),
        road_lifelines: getCount(roadRes),
        audit_logs: getCount(auditRes),
      },
      lastChecked: new Date().toISOString(),
      errorMessage: isConnected
        ? undefined
        : 'Could not connect or tables do not exist yet. Run SQL Migration or Seed.',
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      url: supabaseUrl.replace(/^(https?:\/\/[^/]+).*/, '$1'),
      authType,
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
      errorMessage: err?.message || 'Connection attempt failed',
    };
  }
}

/**
 * Seed data into Supabase tables
 */
export async function seedSupabaseData(): Promise<{
  success: boolean;
  inserted: {
    locations: number;
    sensors: number;
    incidents: number;
    alerts: number;
    roads: number;
    auditLogs: number;
  };
  errors: string[];
}> {
  const client = getSupabaseClient();
  const errors: string[] = [];

  if (!client) {
    throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY.');
  }

  const result = {
    locations: 0,
    sensors: 0,
    incidents: 0,
    alerts: 0,
    roads: 0,
    auditLogs: 0,
  };

  // 1. Locations
  try {
    const formattedLocations = initialLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      district: loc.district,
      state: loc.state,
      lat: loc.lat,
      lng: loc.lng,
      elevation_m: loc.elevationM,
      slope_deg: loc.slopeDeg,
      aspect: loc.aspect,
      curvature: loc.curvature,
      geology: loc.geology,
      soil_moisture_percent: loc.soilMoisturePercent,
      rainfall_1h: loc.rainfall1h,
      rainfall_6h: loc.rainfall6h,
      rainfall_24h: loc.rainfall24h,
      rainfall_72h: loc.rainfall72h,
      rainfall_7d: loc.rainfall7d,
      rainfall_forecast_24h: loc.rainfallForecast24h,
      ground_movement_mm_day: loc.groundMovementMmDay,
      historical_landslides_count: loc.historicalLandslidesCount,
      distance_to_road_m: loc.distanceToRoadM,
      vegetation_ndvi: loc.vegetationNDVI,
      population_at_risk: loc.populationAtRisk,
      vulnerable_villages: loc.vulnerableVillages,
      nearby_infrastructure: loc.nearbyInfrastructure,
      risk_score: loc.riskScore,
      risk_probability: loc.riskProbability,
      risk_level: loc.riskLevel,
      major_factors: loc.majorFactors,
      ai_explanation: loc.aiExplanation,
      recommended_action: loc.recommendedAction,
      last_updated: loc.lastUpdated,
    }));

    const { data, error } = await client.from('locations').upsert(formattedLocations, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.locations = data?.length || formattedLocations.length;
  } catch (err: any) {
    errors.push(`locations: ${err.message}`);
  }

  // 2. Sensors
  try {
    const formattedSensors = initialSensors.map((s) => ({
      id: s.id,
      sensor_code: s.sensorCode,
      name: s.name,
      sensor_type: s.sensorType,
      location_name: s.locationName,
      state: s.state,
      district: s.district,
      lat: s.lat,
      lng: s.lng,
      battery_percent: s.batteryPercent,
      signal_strength: s.signalStrength,
      status: s.status,
      last_reading: s.lastReading,
      telemetry_history: s.telemetryHistory,
      installation_date: s.installationDate,
    }));

    const { data, error } = await client.from('sensors').upsert(formattedSensors, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.sensors = data?.length || formattedSensors.length;
  } catch (err: any) {
    errors.push(`sensors: ${err.message}`);
  }

  // 3. Incidents
  try {
    const formattedIncidents = initialIncidents.map((inc) => ({
      id: inc.id,
      reported_at: inc.reportedAt,
      status: inc.status,
      title: inc.title,
      hazard_type: inc.hazardType,
      severity: inc.severity,
      description: inc.description,
      state: inc.state,
      district: inc.district,
      location_name: inc.locationName,
      lat: inc.lat,
      lng: inc.lng,
      reported_by: inc.reportedBy,
      reporter_phone: inc.reporterPhone,
      reporter_role: inc.reporterRole,
      photo_url: inc.photoUrl,
      video_url: inc.videoUrl,
      ai_assessment: inc.aiAssessment,
    }));

    const { data, error } = await client.from('incidents').upsert(formattedIncidents, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.incidents = data?.length || formattedIncidents.length;
  } catch (err: any) {
    errors.push(`incidents: ${err.message}`);
  }

  // 4. Disaster Alerts
  try {
    const formattedAlerts = initialAlerts.map((a) => ({
      id: a.id,
      alert_code: a.alertCode,
      issued_at: a.issuedAt,
      expires_at: a.expiresAt,
      status: a.status,
      title: a.title,
      message: a.message,
      risk_level: a.riskLevel,
      state: a.state,
      district: a.district,
      location_name: a.locationName,
      affected_population: a.affectedPopulation,
      triggered_by: a.triggeredBy,
      channels: a.channels,
    }));

    const { data, error } = await client.from('disaster_alerts').upsert(formattedAlerts, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.alerts = data?.length || formattedAlerts.length;
  } catch (err: any) {
    errors.push(`disaster_alerts: ${err.message}`);
  }

  // 5. Road Lifelines
  try {
    const formattedRoads = initialRoads.map((r) => ({
      id: r.id,
      road_number: r.roadNumber,
      name: r.name,
      state: r.state,
      district: r.district,
      start_point: r.startPoint,
      end_point: r.endPoint,
      status: r.status,
      importance: r.importance,
      blockage_location: r.blockageLocation,
      clearance_eta: r.clearanceETA,
      alternate_route_name: r.alternateRouteName,
      alternate_route_description: r.alternateRouteDescription,
      path_coords: r.pathCoords,
      last_updated: r.lastUpdated,
    }));

    const { data, error } = await client.from('road_lifelines').upsert(formattedRoads, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.roads = data?.length || formattedRoads.length;
  } catch (err: any) {
    errors.push(`road_lifelines: ${err.message}`);
  }

  // 6. Audit Logs
  try {
    const formattedLogs = initialAuditLogs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      actor_name: log.actorName,
      actor_role: log.actorRole,
      action: log.action,
      target_entity: log.targetEntity,
      details: log.details,
      ip_address: log.ipAddress,
    }));

    const { data, error } = await client.from('audit_logs').upsert(formattedLogs, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.auditLogs = data?.length || formattedLogs.length;
  } catch (err: any) {
    errors.push(`audit_logs: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    inserted: result,
    errors,
  };
}

/**
 * Returns SQL Schema script for copying into Supabase SQL Editor
 */
export function getSupabaseSQLSchema(): string {
  return `-- =========================================================================
-- NER Landslide Early Warning & Risk Monitoring System
-- Supabase / PostgreSQL + PostGIS BaaS Schema & RLS Policies
-- =========================================================================

-- 1. Enable PostGIS & UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Locations Table (GIS Spatial Risk Grid)
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    geom geometry(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
    elevation_m DOUBLE PRECISION DEFAULT 0,
    slope_deg DOUBLE PRECISION DEFAULT 0,
    aspect TEXT,
    curvature TEXT,
    geology TEXT,
    soil_moisture_percent DOUBLE PRECISION DEFAULT 0,
    rainfall_1h DOUBLE PRECISION DEFAULT 0,
    rainfall_6h DOUBLE PRECISION DEFAULT 0,
    rainfall_24h DOUBLE PRECISION DEFAULT 0,
    rainfall_72h DOUBLE PRECISION DEFAULT 0,
    rainfall_7d DOUBLE PRECISION DEFAULT 0,
    rainfall_forecast_24h DOUBLE PRECISION DEFAULT 0,
    ground_movement_mm_day DOUBLE PRECISION DEFAULT 0,
    historical_landslides_count INTEGER DEFAULT 0,
    distance_to_road_m DOUBLE PRECISION DEFAULT 0,
    vegetation_ndvi DOUBLE PRECISION DEFAULT 0,
    population_at_risk INTEGER DEFAULT 0,
    vulnerable_villages JSONB DEFAULT '[]'::jsonb,
    nearby_infrastructure JSONB DEFAULT '[]'::jsonb,
    risk_score INTEGER DEFAULT 0,
    risk_probability DOUBLE PRECISION DEFAULT 0,
    risk_level TEXT NOT NULL DEFAULT 'LOW',
    major_factors JSONB DEFAULT '[]'::jsonb,
    ai_explanation TEXT,
    recommended_action TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast spatial & attribute lookups
CREATE INDEX IF NOT EXISTS idx_locations_geom ON public.locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_locations_state_risk ON public.locations (state, risk_level);

-- 3. IoT Sensors Table
CREATE TABLE IF NOT EXISTS public.sensors (
    id TEXT PRIMARY KEY,
    sensor_code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    location_name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    depth_m DOUBLE PRECISION DEFAULT 0,
    battery_percent INTEGER DEFAULT 100,
    signal_strength TEXT DEFAULT 'EXCELLENT',
    status TEXT NOT NULL DEFAULT 'ONLINE',
    transmission_mode TEXT DEFAULT '4G/LoRaWAN Mesh',
    last_reading JSONB DEFAULT '{}'::jsonb,
    telemetry_history JSONB DEFAULT '[]'::jsonb,
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Incident Reports Table (Field & Citizen Reports)
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Pending Verification',
    title TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    location_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    reported_by TEXT NOT NULL,
    reporter_phone TEXT,
    reporter_role TEXT DEFAULT 'Citizen',
    photo_url TEXT,
    ai_assessment JSONB DEFAULT '{}'::jsonb,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_state ON public.incidents (state, status);

-- 5. Disaster Alerts Table (CAP India Broadcast)
CREATE TABLE IF NOT EXISTS public.disaster_alerts (
    id TEXT PRIMARY KEY,
    alert_code TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    location_name TEXT NOT NULL,
    affected_population INTEGER DEFAULT 0,
    triggered_by TEXT NOT NULL,
    channels JSONB DEFAULT '["CAP India Protocol", "SMS Broadcast", "Mobile App"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Road Lifelines & Strategic Corridors Table
CREATE TABLE IF NOT EXISTS public.road_lifelines (
    id TEXT PRIMARY KEY,
    road_number TEXT NOT NULL,
    section_name TEXT NOT NULL,
    state TEXT NOT NULL,
    districts_covered JSONB DEFAULT '[]'::jsonb,
    coordinates JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'CLEAR',
    blockage_reason TEXT,
    estimated_clearance_hours INTEGER DEFAULT 0,
    alternate_route_name TEXT,
    alternate_route_extra_km INTEGER DEFAULT 0,
    criticality TEXT DEFAULT 'High',
    dispatched_machinery JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit & Provenance Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row-Level Security (RLS) & Public Read / Authenticated Write
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disaster_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_lifelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to all clients
CREATE POLICY "Allow public read on locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on locations" ON public.locations FOR ALL USING (true);

CREATE POLICY "Allow public read on sensors" ON public.sensors FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on sensors" ON public.sensors FOR ALL USING (true);

CREATE POLICY "Allow public read on incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on incidents" ON public.incidents FOR ALL USING (true);

CREATE POLICY "Allow public read on disaster_alerts" ON public.disaster_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on disaster_alerts" ON public.disaster_alerts FOR ALL USING (true);

CREATE POLICY "Allow public read on road_lifelines" ON public.road_lifelines FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on road_lifelines" ON public.road_lifelines FOR ALL USING (true);

CREATE POLICY "Allow public read on audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on audit_logs" ON public.audit_logs FOR ALL USING (true);
`;
}
