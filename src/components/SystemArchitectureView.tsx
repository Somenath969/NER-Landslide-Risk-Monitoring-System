import React from 'react';
import {
  Workflow,
  Cpu,
  Database,
  CloudRain,
  Radio,
  ShieldAlert,
  Activity,
  Layers,
  ArrowRight,
  Server,
  Bell,
  Smartphone,
  Globe,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../locales/translations';

interface SystemArchitectureViewProps {
  currentLang: LanguageCode;
}

export const SystemArchitectureView: React.FC<SystemArchitectureViewProps> = ({ currentLang }) => {
  const t = translations[currentLang] || translations.en;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-2">
          <Workflow className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
            End-to-End System & AI Architecture
          </h2>
          <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
            System Design Specification
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          High-throughput data ingestion, PostgreSQL/PostGIS spatial database, XGBoost ensemble risk engine, and multi-channel CAP alert dissemination.
        </p>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stage 1: Data Ingestion */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              1. Ingestion Pipeline
            </span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">Meteorological Feeds</span>
              <p className="text-[11px] text-slate-400">IMD Doppler Radar, GPM satellite rainfall, 1h/6h/24h/72h rainfall series</p>
            </div>

            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">IoT Telemetry Mesh</span>
              <p className="text-[11px] text-slate-400">Subsurface Inclinometers, Piezometers, Soil Moisture Probes & Rain Gauges</p>
            </div>

            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">Citizen & Field Reports</span>
              <p className="text-[11px] text-slate-400">Mobile PWA GPS geocoded photos, tension crack alerts, PWD obstacle logs</p>
            </div>
          </div>
        </div>

        {/* Stage 2: Processing & Spatial DB */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              2. Spatial Processing
            </span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">PostgreSQL / PostGIS</span>
              <p className="text-[11px] text-slate-400">DEM elevation raster, slope calculations, aspect, curvature, and lithology</p>
            </div>

            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">Spatial Topology Matching</span>
              <p className="text-[11px] text-slate-400">Proximity to national highways (NH-27, NH-10, NH-29), settlements & rivers</p>
            </div>

            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">Anomaly Detection</span>
              <p className="text-[11px] text-slate-400">Telemetry threshold validator for sudden pore water spikes (&gt;140 kPa)</p>
            </div>
          </div>
        </div>

        {/* Stage 3: AI/ML Inference */}
        <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              3. AI/ML Risk Core
            </span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">XGBoost Susceptibility Net</span>
              <p className="text-[11px] text-slate-400">Ensemble trees evaluating dynamic pore pressure + static geomorphology</p>
            </div>

            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">Explainable AI (SHAP)</span>
              <p className="text-[11px] text-slate-400">Factor weight decomposition and plain-language diagnostic generation</p>
            </div>

            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">Gemini Vision AI</span>
              <p className="text-[11px] text-slate-400">Reconnaissance photo fracture classification & debris volume estimation</p>
            </div>
          </div>
        </div>

        {/* Stage 4: Alert Dissemination */}
        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              4. Multi-Agency Dispatch
            </span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">CAP India Protocol</span>
              <p className="text-[11px] text-slate-400">Common Alerting Protocol XML feeds to NDMA, telecom operators & TV/Radio</p>
            </div>

            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">Emergency Priority SOP</span>
              <p className="text-[11px] text-slate-400">Direct tactical orders for NDRF battalions, SDRF, PWD dozers & district magistrates</p>
            </div>

            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-slate-100">Multilingual Portals</span>
              <p className="text-[11px] text-slate-400">Public notifications in English, Hindi, Assamese, Bengali, Manipuri & Mizo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Enterprise Technology Stack & Reliability Standards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="space-y-1">
            <span className="font-bold text-amber-400">Frontend & GIS Layer</span>
            <p className="text-slate-400">React 18, Vite, Leaflet GIS, Recharts, Tailwind CSS, Lucide Icons, Mobile PWA offline caching.</p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-amber-400">Backend & API Gateway</span>
            <p className="text-slate-400">Node.js Express + TSX full-stack server, REST API endpoints, WebSockets telemetry ingestion.</p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-amber-400">AI / ML Pipeline</span>
            <p className="text-slate-400">XGBoost ensemble susceptibility model, SHAP feature importance, Gemini Vision reconnaissance.</p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-amber-400">Security & RBAC</span>
            <p className="text-slate-400">Role-based access control (Super Admin, ASDMA, NDRF, PWD, Citizen), Tamper-evident audit logging.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
