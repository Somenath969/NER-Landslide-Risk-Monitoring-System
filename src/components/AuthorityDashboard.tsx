import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Truck,
  Activity,
  Radio,
  Send,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle,
  FileSpreadsheet,
  Zap,
  CloudRain,
  MapPin,
  Clock,
  ArrowUpRight,
  Gauge,
  Route,
  Compass,
  Layers,
  Thermometer,
  Wind,
  WifiOff,
  Languages,
  CheckCircle2,
  PhoneCall,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  LocationData,
  DisasterAlert,
  EmergencyPriorityItem,
  SensorData,
  RoadStatus,
  LanguageCode,
} from '../types';
import { translations } from '../locales/translations';

interface AuthorityDashboardProps {
  locations: LocationData[];
  alerts: DisasterAlert[];
  priorities: EmergencyPriorityItem[];
  sensors: SensorData[];
  roads: RoadStatus[];
  onSelectLocation: (loc: LocationData) => void;
  onCreateAlert: (alertData: Partial<DisasterAlert>) => void;
  onSimulateSurgeAll: (rainMm: number) => void;
  currentLang: LanguageCode;
}

type DashboardSection =
  | 'unified_command'
  | 'risk_severity'
  | 'road_connectivity'
  | 'weather_forecasts'
  | 'emergency_priorities'
  | 'multilingual_offline';

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  locations,
  alerts,
  priorities,
  sensors,
  roads,
  onSelectLocation,
  onCreateAlert,
  onSimulateSurgeAll,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const [activeSection, setActiveSection] = useState<DashboardSection>('unified_command');

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertMessage, setNewAlertMessage] = useState('');
  const [newAlertLevel, setNewAlertLevel] = useState<'CRITICAL' | 'HIGH' | 'MODERATE'>('CRITICAL');
  const [newAlertDistrict, setNewAlertDistrict] = useState('Dima Hasao');
  const [newAlertState, setNewAlertState] = useState('Assam');
  const [dispatchedPrios, setDispatchedPrios] = useState<string[]>([]);
  const [isSimulatingAll, setIsSimulatingAll] = useState(false);

  // Multilingual Preview State
  const [broadcastTargetLang, setBroadcastTargetLang] = useState<LanguageCode>('en');

  // Gemini Executive Situation Briefing State
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [geminiBriefing, setGeminiBriefing] = useState<{
    headline?: string;
    operationalStatus?: string;
    keyHighlights?: string[];
    meteorologicalAnalysis?: string;
    tacticalDirectives?: string[];
    publicAdvisorySnippet?: string;
  } | null>(null);

  const handleGenerateBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const res = await fetch('/api/gemini/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations, filterState: 'ALL' }),
      });
      const data = await res.json();
      if (data.success && data.briefing) {
        setGeminiBriefing(data.briefing);
      }
    } catch (err) {
      console.warn('Gemini briefing error:', err);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  // Compute Summary KPIs
  const criticalLocations = locations.filter((l) => l.riskLevel === 'CRITICAL');
  const highLocations = locations.filter((l) => l.riskLevel === 'HIGH');
  const moderateLocations = locations.filter((l) => l.riskLevel === 'MODERATE');
  const lowLocations = locations.filter((l) => l.riskLevel === 'LOW');

  const totalPopAtRisk = locations.reduce(
    (sum, l) => sum + (l.riskScore >= 50 ? l.populationAtRisk : 0),
    0
  );
  const blockedRoads = roads.filter((r) => r.status === 'FULLY_BLOCKED');
  const partialRoads = roads.filter((r) => r.status === 'PARTIALLY_BLOCKED');
  const clearRoads = roads.filter((r) => r.status === 'OPEN');

  const criticalSensorsCount = sensors.filter(
    (s) => s.status === 'CRITICAL' || s.status === 'WARNING'
  ).length;

  // Chart Data: Risk by District
  const districtRiskData = locations.map((loc) => ({
    name: loc.district.split(' ')[0],
    riskScore: loc.riskScore,
    rainfall24h: loc.rainfall24h,
    soilMoisture: loc.soilMoisture,
    population: Math.round(loc.populationAtRisk / 1000),
    riskLevel: loc.riskLevel,
  }));

  // Chart Data: Risk Level Distribution Pie
  const riskPieData = [
    { name: 'Critical (76-100)', value: criticalLocations.length, color: '#ef4444' },
    { name: 'High (51-75)', value: highLocations.length, color: '#f97316' },
    { name: 'Moderate (26-50)', value: moderateLocations.length, color: '#eab308' },
    { name: 'Low (0-25)', value: lowLocations.length, color: '#10b981' },
  ];

  // Weather-Linked Forecasts: 24h Rainfall vs Threshold Probability Curve
  const weatherRiskForecastData = [
    { hour: '00:00', actualRain: 12, predictedRain: 15, riskProbability: 18, soilSat: 62 },
    { hour: '04:00', actualRain: 25, predictedRain: 28, riskProbability: 32, soilSat: 68 },
    { hour: '08:00', actualRain: 48, predictedRain: 52, riskProbability: 58, soilSat: 79 },
    { hour: '12:00', actualRain: 78, predictedRain: 84, riskProbability: 82, soilSat: 88 },
    { hour: '16:00 (Surge)', actualRain: 110, predictedRain: 125, riskProbability: 94, soilSat: 96 },
    { hour: '20:00', actualRain: 95, predictedRain: 105, riskProbability: 89, soilSat: 94 },
    { hour: '24:00 (Proj)', actualRain: 60, predictedRain: 70, riskProbability: 71, soilSat: 89 },
  ];

  // Road Lifeline Stats for Pie
  const roadPieData = [
    { name: 'Fully Blocked', value: blockedRoads.length, color: '#ef4444' },
    { name: 'Partially Blocked', value: partialRoads.length, color: '#f97316' },
    { name: 'Clear Lifeline', value: clearRoads.length, color: '#10b981' },
  ];

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle || !newAlertMessage) return;

    onCreateAlert({
      title: newAlertTitle,
      message: newAlertMessage,
      riskLevel: newAlertLevel,
      state: newAlertState,
      district: newAlertDistrict,
      locationName: `${newAlertDistrict} Hazard Zone`,
      affectedPopulation: 14500,
      triggeredBy: 'National Disaster Authority (NDMA) CAP Broadcast Center',
      channels: ['CAP India Gateway', 'SMS / Cell Broadcast', 'Police Radio', 'NER PWA Mesh'],
    });

    setNewAlertTitle('');
    setNewAlertMessage('');
    setShowBroadcastModal(false);
  };

  const handleDispatchPriority = (prioId: string) => {
    setDispatchedPrios((prev) => [...prev, prioId]);
  };

  const handleTriggerSimAll = (rainMm: number) => {
    setIsSimulatingAll(true);
    onSimulateSurgeAll(rainMm);
    setTimeout(() => setIsSimulatingAll(false), 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Section Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-black text-slate-100 tracking-tight font-['Outfit']">
              NER Landslide Early Warning & Operational Command
            </h2>
            <span className="bg-red-500/20 text-red-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-500/30">
              Live Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial analytics, risk severity indexes, lifeline corridor connectivity, and weather-linked forecasts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => handleTriggerSimAll(75)}
            disabled={isSimulatingAll}
            className="bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
          >
            <CloudRain className="w-4 h-4 text-amber-400" />
            <span>Simulate +75mm Rain</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            <Radio className="w-4 h-4 text-white animate-pulse" />
            <span>Broadcast CAP Alert</span>
          </button>
        </div>
      </div>

      {/* Dashboard Sub-Views Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveSection('unified_command')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeSection === 'unified_command'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Unified Overview</span>
        </button>

        <button
          onClick={() => setActiveSection('risk_severity')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeSection === 'risk_severity'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{t.riskSeverityLevels}</span>
        </button>

        <button
          onClick={() => setActiveSection('road_connectivity')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeSection === 'road_connectivity'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{t.roadConnectivityStatus}</span>
        </button>

        <button
          onClick={() => setActiveSection('weather_forecasts')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeSection === 'weather_forecasts'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <CloudRain className="w-4 h-4" />
          <span>{t.weatherRiskForecasts}</span>
        </button>

        <button
          onClick={() => setActiveSection('emergency_priorities')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeSection === 'emergency_priorities'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>{t.emergencyPrioritisation}</span>
        </button>

        <button
          onClick={() => setActiveSection('multilingual_offline')}
          className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeSection === 'multilingual_offline'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>Multilingual & Offline Mesh</span>
        </button>
      </div>

      {/* KPI Cards Row (Always Visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Hazard Zones */}
        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Critical Slopes</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2">
            {criticalLocations.length} <span className="text-xs font-normal text-slate-400">Zones (&gt;75/100)</span>
          </p>
          <p className="text-[11px] text-red-300 mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            {highLocations.length} additional slopes at High risk
          </p>
        </div>

        {/* Population at Risk */}
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Population Exposure</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2">
            {totalPopAtRisk.toLocaleString()} <span className="text-xs font-normal text-slate-400">Citizens</span>
          </p>
          <p className="text-[11px] text-amber-300 mt-1">Across high-vulnerability hill hamlets</p>
        </div>

        {/* Highway Lifelines Blocked */}
        <div className="bg-slate-900 border border-orange-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Lifelines Disrupted</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2">
            {blockedRoads.length + partialRoads.length}{' '}
            <span className="text-xs font-normal text-slate-400">Corridors ({blockedRoads.length} Blocked)</span>
          </p>
          <p className="text-[11px] text-orange-300 mt-1">Active clearance operations ongoing</p>
        </div>

        {/* Sensor Network Health */}
        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">IoT Telemetry Mesh</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2">
            {sensors.length} <span className="text-xs font-normal text-slate-400">Sensors</span>
          </p>
          <p className="text-[11px] text-emerald-300 mt-1">
            {criticalSensorsCount} threshold alerts active
          </p>
        </div>
      </div>

      {/* VIEW 1: UNIFIED COMMAND OVERVIEW */}
      {activeSection === 'unified_command' && (
        <div className="space-y-6">
          {/* Gemini AI Executive Situation Briefing Card */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/30 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Executive Disaster Situation Briefing
                    <span className="text-[10px] bg-purple-900/80 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700 font-mono">
                      Gemini 3.7 Flash
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time situational intelligence synthesized across all 8 NER states, weather feeds, and IoT sensors.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateBriefing}
                disabled={isGeneratingBriefing}
                className="self-start sm:self-auto px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-900/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isGeneratingBriefing ? (
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingBriefing ? 'Synthesizing...' : geminiBriefing ? 'Refresh AI Briefing' : 'Generate AI Briefing'}</span>
              </button>
            </div>

            {geminiBriefing ? (
              <div className="space-y-3.5 animate-fadeIn text-xs">
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-purple-500/30 flex items-start gap-3">
                  <div className="p-1 rounded bg-purple-500/20 text-purple-400 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 text-sm block mb-1">
                      {geminiBriefing.headline}
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {geminiBriefing.meteorologicalAnalysis}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                      Key Regional Risk Highlights:
                    </span>
                    <ul className="space-y-1.5 text-slate-300 text-xs">
                      {geminiBriefing.keyHighlights?.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
                      Immediate Tactical Directives:
                    </span>
                    <ul className="space-y-1.5 text-slate-300 text-xs">
                      {geminiBriefing.tacticalDirectives?.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5 font-bold">{i + 1}.</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {geminiBriefing.publicAdvisorySnippet && (
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span><strong>Broadcast Snippet:</strong> &ldquo;{geminiBriefing.publicAdvisorySnippet}&rdquo;</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <span>Click &ldquo;Generate AI Briefing&rdquo; to query Gemini 3.7 Flash for an executive summary of current hazards across NER hill corridors.</span>
              </div>
            )}
          </div>

          {/* Emergency Response Action Priorities (Multi-Agency Matrix) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Top Emergency Response Action Priorities
                  </h3>
                  <p className="text-xs text-slate-400">
                    Auto-ranked by AI risk score, population density, and lifeline connectivity state
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('emergency_priorities')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center"
              >
                View Full Triage Matrix <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {priorities.slice(0, 3).map((item) => {
                const isDispatched = dispatchedPrios.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.priorityTitle}
                        </span>
                        <span className="text-sm font-bold text-slate-100">{item.locationName}</span>
                        <span className="text-xs text-slate-400">
                          ({item.district}, {item.state})
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong className="text-amber-400">Diagnostic Factor:</strong> {item.reasoning}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="text-blue-300">
                          👥 <strong>{item.populationAffected.toLocaleString()}</strong> residents
                        </span>
                        <span>•</span>
                        <span className="text-orange-300">
                          🛣️ <strong>{item.roadConnectivityState}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          🏥 Hospital: <strong>{item.hospitalAccessible ? 'Accessible' : 'Cut Off'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const match = locations.find((l) => l.name.includes(item.locationName.split(' ')[0]));
                          if (match) onSelectLocation(match);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                      >
                        View Slope
                      </button>

                      <button
                        onClick={() => handleDispatchPriority(item.id)}
                        disabled={isDispatched}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                          isDispatched
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 active:scale-95'
                        }`}
                      >
                        {isDispatched ? '✓ Units Dispatched' : 'Dispatch NDRF/PWD'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Rainfall vs Risk by District */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  24h Rainfall vs Landslide Risk Score
                </h3>
                <span className="text-[11px] text-slate-400">By District</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtRiskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="riskScore" name="Risk Score (0-100)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rainfall24h" name="24h Rain (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Risk Level Distribution & Telemetry */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Landslide Hazard Distribution
                </h3>
                <span className="text-[11px] text-slate-400">Active NER Slopes</span>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RISK SEVERITY LEVELS DASHBOARD */}
      {activeSection === 'risk_severity' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-100 font-['Outfit'] flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 text-red-400" />
                  Risk Severity Levels & Slope Vulnerability Index
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Categorized by geotechnical slope angle, soil saturation, and historical landslide recurrence
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 font-bold border border-red-800">
                  Critical: {criticalLocations.length}
                </span>
                <span className="px-2.5 py-1 rounded bg-orange-950 text-orange-300 font-bold border border-orange-800">
                  High: {highLocations.length}
                </span>
                <span className="px-2.5 py-1 rounded bg-yellow-950 text-yellow-300 font-bold border border-yellow-800">
                  Moderate: {moderateLocations.length}
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  Low: {lowLocations.length}
                </span>
              </div>
            </div>

            {/* Severity Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Critical Severity Card */}
              <div className="bg-red-950/30 border border-red-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                    CRITICAL HAZARD (76-100)
                  </span>
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                </div>
                <p className="text-2xl font-extrabold text-red-200">{criticalLocations.length} Slopes</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Immediate mass movement imminent. Soil saturation &gt;85%, slope &gt;45°. Evacuate toe settlement zones.
                </p>
                <div className="pt-2 border-t border-red-900/40 space-y-1">
                  {criticalLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left px-2 py-1 rounded bg-red-900/40 hover:bg-red-800/60 text-red-200 text-[11px] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name} ({loc.district})</span>
                      <span className="font-mono font-bold text-red-300 ml-1">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* High Severity Card */}
              <div className="bg-orange-950/30 border border-orange-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wider">
                    HIGH RISK (51-75)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                </div>
                <p className="text-2xl font-extrabold text-orange-200">{highLocations.length} Slopes</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Severe instability triggered by continuous monsoon rain. Restrict night highway transit.
                </p>
                <div className="pt-2 border-t border-orange-900/40 space-y-1">
                  {highLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left px-2 py-1 rounded bg-orange-900/40 hover:bg-orange-800/60 text-orange-200 text-[11px] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="font-mono font-bold text-orange-300 ml-1">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Moderate Severity Card */}
              <div className="bg-yellow-950/30 border border-yellow-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">
                    MODERATE (26-50)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                </div>
                <p className="text-2xl font-extrabold text-yellow-200">{moderateLocations.length} Slopes</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Heightened vigilance. IoT piezometers and rainfall sensors reporting elevated pore water pressure.
                </p>
                <div className="pt-2 border-t border-yellow-900/40 space-y-1">
                  {moderateLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left px-2 py-1 rounded bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-200 text-[11px] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="font-mono font-bold text-yellow-300 ml-1">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Low Severity Card */}
              <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    LOW RISK (0-25)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-2xl font-extrabold text-emerald-200">{lowLocations.length} Slopes</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Stable geotechnical parameters. Standard baseline monitoring active.
                </p>
                <div className="pt-2 border-t border-emerald-900/40 space-y-1">
                  {lowLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left px-2 py-1 rounded bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 text-[11px] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="font-mono font-bold text-emerald-300 ml-1">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ROAD CONNECTIVITY STATUS DASHBOARD */}
      {activeSection === 'road_connectivity' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-100 font-['Outfit'] flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-amber-400" />
                  Highway Lifeline Connectivity & Blockage Clearance Radar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Critical supply corridors connecting remote hill districts across 8 NER states
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-700">
                  {blockedRoads.length} Fully Blocked
                </span>
                <span className="px-2.5 py-1 rounded bg-orange-950 text-orange-300 border border-orange-700">
                  {partialRoads.length} Partially Blocked
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {clearRoads.length} Clear Corridors
                </span>
              </div>
            </div>

            {/* List of All Monitored Highway Lifelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roads.map((road) => {
                const isBlocked = road.status === 'FULLY_BLOCKED';
                const isPartial = road.status === 'PARTIALLY_BLOCKED';
                return (
                  <div
                    key={road.id}
                    className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                      isBlocked
                        ? 'bg-red-950/20 border-red-600/40'
                        : isPartial
                        ? 'bg-orange-950/20 border-orange-600/40'
                        : 'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-100 flex items-center">
                        <Route className="w-4 h-4 mr-1 text-amber-400" />
                        {road.roadNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isBlocked
                            ? 'bg-red-600 text-white animate-pulse'
                            : isPartial
                            ? 'bg-orange-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {road.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200">{road.name}</p>

                    {road.blockageLocation && (
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-1 text-slate-300">
                        <p className="text-red-400 font-bold flex items-center">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          Blockage: {road.blockageLocation.landmark}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Clearance ETA: <strong className="text-slate-200">{road.clearanceETA || 'Under Assessment'}</strong>
                        </p>
                        <p className="text-emerald-400 text-[11px] font-medium">
                          Safe Alternate: {road.alternateRouteName}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>District: {road.district || 'NER Corridor'} ({road.state})</span>
                      <span className="text-[10px] text-slate-500 font-mono">{road.importance}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: WEATHER-LINKED RISK FORECASTS DASHBOARD */}
      {activeSection === 'weather_forecasts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-100 font-['Outfit'] flex items-center">
                  <CloudRain className="w-5 h-5 mr-2 text-cyan-400" />
                  Weather-Linked Risk Forecasts & Threshold Probability Modeling
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Doppler radar precipitation trends, soil moisture saturation (%), and 24h predictive slope failure probability
                </p>
              </div>
              <span className="text-xs text-cyan-300 font-mono bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800">
                IMD Doppler Radar Sync: LIVE
              </span>
            </div>

            {/* Weather Risk Correlation Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weatherRiskForecastData}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="riskProbability"
                    name="Landslide Failure Probability (%)"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#riskGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="actualRain"
                    name="Rainfall Intensity (mm/h)"
                    stroke="#38bdf8"
                    fillOpacity={1}
                    fill="url(#rainGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="soilSat"
                    name="Soil Saturation Index (%)"
                    stroke="#eab308"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Explanatory Technical Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-cyan-300">Antecedent Moisture Threshold</span>
                <p className="text-slate-300">
                  Continuous 3-day rainfall &gt;120mm saturates bedrock porosity, accelerating critical pore pressure build-up.
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-amber-300">Caine Intensity-Duration Formula</span>
                <p className="text-slate-300">
                  <code className="text-amber-200">I = 14.82 * D^(-0.39)</code> defines threshold breach curve in eastern Himalayas.
                </p>
              </div>
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-red-300">Flash Warning Protocol</span>
                <p className="text-slate-300">
                  Automatic CAP broadcast triggers if 1-hour rainfall rate exceeds 45mm/hr in steep terrain.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: EMERGENCY RESPONSE PRIORITISATION */}
      {activeSection === 'emergency_priorities' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-100 font-['Outfit'] flex items-center">
                  <Flame className="w-5 h-5 mr-2 text-red-400" />
                  Emergency Response Prioritisation & Resource Allocation Grid
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Algorithmic dispatch prioritization calculated from hazard severity, road blockage criticality, and vulnerable population density
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                NDMA / NDRF Protocol Active
              </span>
            </div>

            <div className="space-y-3">
              {priorities.map((item, index) => {
                const isDispatched = dispatchedPrios.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-400">#{index + 1}</span>
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.priorityTitle}
                        </span>
                        <span className="text-sm font-bold text-slate-100">{item.locationName}</span>
                        <span className="text-xs text-slate-400">
                          ({item.district}, {item.state})
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong className="text-amber-400">Diagnostic Factor:</strong> {item.reasoning}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="text-blue-300">
                          👥 <strong>{item.populationAffected.toLocaleString()}</strong> residents
                        </span>
                        <span>•</span>
                        <span className="text-orange-300">
                          🛣️ <strong>{item.roadConnectivityState}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          🏥 Hospital Access: <strong>{item.hospitalAccessible ? 'Accessible' : 'Severely Cut Off'}</strong>
                        </span>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs text-emerald-300 flex items-center justify-between">
                        <div>
                          <strong>Operational Directive:</strong> {item.suggestedAction}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const match = locations.find((l) => l.name.includes(item.locationName.split(' ')[0]));
                          if (match) onSelectLocation(match);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                      >
                        Inspect Slope
                      </button>

                      <button
                        onClick={() => handleDispatchPriority(item.id)}
                        disabled={isDispatched}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                          isDispatched
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 active:scale-95'
                        }`}
                      >
                        {isDispatched ? '✓ Units Dispatched' : 'Dispatch NDRF / SDRF'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: MULTILINGUAL NOTIFICATIONS & LOW-NETWORK / OFFLINE SUPPORT */}
      {activeSection === 'multilingual_offline' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-100 font-['Outfit'] flex items-center">
                <Languages className="w-5 h-5 mr-2 text-amber-400" />
                Multilingual Alert Broadcast & Low-Network Remote Mesh System
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Delivering verified early warnings in 6 regional languages with zero-data offline caching for remote hills
              </p>
            </div>

            {/* Language Selector for Live Preview */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Preview Translation Matrix:</span>
              {(['en', 'hi', 'as', 'bn', 'lus', 'mni'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setBroadcastTargetLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    broadcastTargetLang === lang
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {lang.toUpperCase()} ({lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : lang === 'as' ? 'অসমীয়া' : lang === 'bn' ? 'বাংলা' : lang === 'lus' ? 'Mizo' : 'Manipuri'})
                </button>
              ))}
            </div>

            {/* Broadcast Message Preview Card */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Live Multilingual CAP Emergency Message
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                  RED ALERT
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <h4 className="text-sm font-bold text-slate-100">
                  {broadcastTargetLang === 'en' && 'EMERGENCY: Immediate Evacuation Order for Haflong-Jatinga Slopes'}
                  {broadcastTargetLang === 'hi' && 'आपातकालीन सूचना: हाफलोंग-जटिंगा ढलानों के लिए तत्काल निकासी आदेश'}
                  {broadcastTargetLang === 'as' && 'জৰুৰী সতৰ্কবাৰ্তা: হাফলোং-জাতিংগা অঞ্চলৰ লোকসকলক সুৰক্ষিত স্থানলৈ যোৱাৰ নিৰ্দেশ'}
                  {broadcastTargetLang === 'bn' && 'জরুরি সতর্কতা: হাফলং-জাতিঙ্গা এলাকার বাসিন্দাদের অবিলম্বে নিরাপদ স্থানে যাওয়ার নির্দেশ'}
                  {broadcastTargetLang === 'lus' && 'EMERGENCY: Haflong-Jatinga leimin hlauhawm avangin hmun him pan vat tur'}
                  {broadcastTargetLang === 'mni' && 'জৰুৰী ꯆꯦꯛꯁꯤꯟꯋꯥ: ꯍꯥꯐꯂꯣꯡ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ ꯊꯣꯛꯄꯅ ꯁꯥꯐꯕ ꯃꯐꯝꯗ ꯆꯠꯈꯤꯌꯨ'}
                </h4>
                <p className="text-xs text-slate-300">
                  {broadcastTargetLang === 'en' &&
                    'Torrential monsoon rain has triggered critical debris movement. NH-27 is blocked. Relocate to Higher Secondary School Emergency Shelter. Call 1070/112 for rescue.'}
                  {broadcastTargetLang === 'hi' &&
                    'मूसलाधार मानसूनी बारिश से भूस्खलन का गंभीर खतरा। एनएच-27 अवरुद्ध है। नजदीकी राहत शिविर में शरण लें। बचाव के लिए 1070 या 112 पर संपर्क करें।'}
                  {broadcastTargetLang === 'as' &&
                    'অবিৰাম বৰষুণৰ বাবে ভূমিস্খলনৰ প্ৰচণ্ড আশংকা। NH-27 পথ বন্ধ হৈ পৰিছে। ওচৰৰ সাহায্য শিবিৰলৈ যাওক। সাহায্যৰ বাবে ১০৭০/১১২ ত যোগাযোগ কৰক।'}
                  {broadcastTargetLang === 'bn' &&
                    'ভারী বর্ষণে চরম ভূমিধসের আশঙ্কা। এনএইচ-২৭ অবরুদ্ধ। নিকটস্থ আশ্রয়কেন্দ্রে চলে যান। জরুরি প্রয়োজনে ১০৭০/১১২ নম্বরে যোগাযোগ করুন।'}
                  {broadcastTargetLang === 'lus' &&
                    'Ruah nasa tak sur avangin leimin a hlauhawm hle. NH-27 kawng a ping. Himna hmun pan rawh le. Helpline 1070/112 be rawh.'}
                  {broadcastTargetLang === 'mni' &&
                    'ꯅꯣꯡ ꯀꯟꯅ ꯆꯨꯕꯅ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯔꯦ꯫ NH-27 ꯂꯝꯕꯤ ꯊꯤꯡꯖꯤꯜꯂꯦ꯫ ꯈꯨꯗꯛꯇ ꯉꯥꯛꯊꯣꯛꯐꯝ ꯃꯐꯝꯗ ꯆꯠꯎ꯫ 1070/112 ꯗ ꯄꯥꯎ ꯄꯤꯔꯛꯎ꯫'}
                </p>
              </div>

              {/* Low-Network Delivery Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CAP Cell Broadcast</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Works on GSM 2G towers without active data connection.
                  </p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PWA Local Cache</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Offline service worker queues incident reports with GPS & photos.
                  </p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ham & VHF Radio Relay</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    State Police grid synchronized with 1st & 12th NDRF Battalion command.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-slate-100">Issue Emergency CAP Alert</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alert Severity Level
                </label>
                <select
                  value={newAlertLevel}
                  onChange={(e) => setNewAlertLevel(e.target.value as any)}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:ring-1 focus:ring-red-500"
                >
                  <option value="CRITICAL">RED ALERT (Imminent Debris Flow / Evacuate)</option>
                  <option value="HIGH">ORANGE ALERT (Severe Landslide Watch)</option>
                  <option value="MODERATE">YELLOW ALERT (Heightened Vigilance)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target State</label>
                  <input
                    type="text"
                    value={newAlertState}
                    onChange={(e) => setNewAlertState(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700"
                    placeholder="e.g. Assam"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target District</label>
                  <input
                    type="text"
                    value={newAlertDistrict}
                    onChange={(e) => setNewAlertDistrict(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700"
                    placeholder="e.g. Dima Hasao"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Headline</label>
                <input
                  type="text"
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700"
                  placeholder="e.g. RED ALERT: Evacuation Advisory for Haflong-Jatinga"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Advisory Message (Broadcast via SMS / Mobile / Radio)
                </label>
                <textarea
                  value={newAlertMessage}
                  onChange={(e) => setNewAlertMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700"
                  placeholder="Provide precise safety instructions and emergency shelter locations..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/30 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit CAP Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
