import React, { useState } from 'react';
import {
  Workflow,
  Cpu,
  Layers,
  Sparkles,
  ShieldAlert,
  Database,
  Radio,
  MapPin,
  Truck,
  Activity,
  Sliders,
  Send,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CloudRain,
  Satellite,
  Mountain,
  Users,
  Compass,
  ArrowDown,
  RefreshCw,
  Eye,
  FileCheck,
  TrendingUp,
  Share2,
  Lock,
  Zap,
} from 'lucide-react';
import {
  LocationData,
  SensorData,
  RoadStatus,
  DisasterAlert,
  EmergencyPriorityItem,
  LanguageCode,
  RiskLevel,
} from '../types';
import { translations } from '../locales/translations';
import { MultiModalFusionEngine } from './MultiModalFusionEngine';
import { SpatioTemporalTrajectory } from './SpatioTemporalTrajectory';
import { DigitalTwinExplorer } from './DigitalTwinExplorer';
import { ConnectivityRiskGraph } from './ConnectivityRiskGraph';
import { ExplainableAIShapView } from './ExplainableAIShapView';
import { EdgeOfflineResilience } from './EdgeOfflineResilience';
import { ClosedLoopLearningView } from './ClosedLoopLearningView';

interface DisasterDecisionEcosystemProps {
  locations: LocationData[];
  sensors: SensorData[];
  roads: RoadStatus[];
  alerts: DisasterAlert[];
  priorities: EmergencyPriorityItem[];
  currentLang: LanguageCode;
  onNavigateTab?: (tab: string) => void;
  onSelectLocation?: (loc: LocationData) => void;
  onOpenSimulateModal?: () => void;
  onTriggerAlertDispatch?: (message: string) => void;
}

export const DisasterDecisionEcosystemView: React.FC<DisasterDecisionEcosystemProps> = ({
  locations,
  sensors,
  roads,
  alerts,
  priorities,
  currentLang,
  onNavigateTab,
  onSelectLocation,
  onOpenSimulateModal,
  onTriggerAlertDispatch,
}) => {
  const t = translations[currentLang] || translations.en;

  // Selected Location for Deep Dive
  const [selectedLoc, setSelectedLoc] = useState<LocationData>(locations[0] || {} as LocationData);

  // Active View Tab Filter
  const [activeTab, setActiveTab] = useState<
    | 'ALL_OVERVIEW'
    | 'FUSION_ENGINE'
    | 'SPATIO_TEMPORAL'
    | 'DIGITAL_TWIN'
    | 'WHAT_IF_SIMULATOR'
    | 'CONNECTIVITY_GRAPH'
    | 'EDGE_OFFLINE'
    | 'EXPLAINABLE_AI'
    | 'CLOSED_LOOP'
    | 'MULTI_LAYER_MAP'
  >('ALL_OVERVIEW');

  // Interactive What-If Simulation State
  const [rainfallSurgePercent, setRainfallSurgePercent] = useState<number>(50); // 10, 25, 50, 100
  const [soilMoistureLevel, setSoilMoistureLevel] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [sensorAnomalyState, setSensorAnomalyState] = useState<'NORMAL' | 'GROUND_MOVEMENT_DETECTED'>('GROUND_MOVEMENT_DETECTED');
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Interactive Sensor Availability Stress Toggle (Feature 13: Risk Confidence & Data Quality)
  const [sensorAvailabilityMode, setSensorAvailabilityMode] = useState<'FULL_TELEMETRY' | 'PARTIAL_OUTAGE'>('FULL_TELEMETRY');

  // Recalculated What-If Impact Metrics
  const baseVulnerablePop = locations.reduce(
    (sum, l) => sum + (l.riskScore >= 50 ? l.populationAtRisk : 0),
    0
  );

  const surgeMultiplier = rainfallSurgePercent / 100;
  const soilMultiplier = soilMoistureLevel === 'CRITICAL' ? 1.4 : soilMoistureLevel === 'HIGH' ? 1.2 : 1.0;
  const sensorMultiplier = sensorAnomalyState === 'GROUND_MOVEMENT_DETECTED' ? 1.3 : 1.0;

  const simulatedRiskScore = Math.min(
    98,
    Math.round((selectedLoc.riskScore || 70) * (1 + surgeMultiplier * 0.4) * (soilMultiplier * 0.9) * (sensorMultiplier * 0.95))
  );

  const simulatedPop = Math.round(
    baseVulnerablePop * (1 + surgeMultiplier * 1.25)
  );

  const simulatedCriticalLocations = locations.filter((loc) => {
    const adjusted = loc.riskScore * (1 + surgeMultiplier * 0.5);
    return adjusted >= 75;
  }).length;

  const simulatedBlockedRoadsCount =
    rainfallSurgePercent >= 100
      ? roads.length
      : rainfallSurgePercent >= 50
      ? Math.min(roads.length, roads.filter((r) => r.status !== 'OPEN').length + 3)
      : roads.filter((r) => r.status === 'FULLY_BLOCKED').length;

  const handleSimulateBroadcast = () => {
    const msg = `CRITICAL NER RED ALERT: Deluge threshold surge +${rainfallSurgePercent}% active. Soil moisture ${soilMoistureLevel}. Immediate evacuation ordered for ${simulatedCriticalLocations} hill sectors across Dima Hasao & Sikkim. Follow NH alternate detours.`;
    if (onTriggerAlertDispatch) {
      onTriggerAlertDispatch(msg);
    }
    setDispatchSuccess('Multi-channel CAP broadcast, SMS, and VHF radio alert transmitted across 8 NER State EOCs.');
    setTimeout(() => setDispatchSuccess(null), 5000);
  };

  const handleApplyFusionScore = (newScore: number, newLevel: RiskLevel) => {
    setSelectedLoc((prev) => ({
      ...prev,
      riskScore: newScore,
      riskLevel: newLevel,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* ROW 1: ECOSYSTEM HEADER & PHILOSOPHY BANNER */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
                <Workflow className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-100">
                  AI-Driven Disaster Decision & Response Ecosystem
                </h2>
                <p className="text-xs sm:text-sm text-cyan-300/90 font-medium">
                  &ldquo;The important innovation is not another prediction model. It is an AI-driven disaster decision and response ecosystem.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-slate-300">
              14 Architecture Modules Active
            </span>
            <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800 font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>

        {/* 10 Architecture Filter Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 pt-1">
          {[
            { id: 'ALL_OVERVIEW', label: '1. All Modules' },
            { id: 'FUSION_ENGINE', label: '2. Fusion Engine' },
            { id: 'SPATIO_TEMPORAL', label: '3. Trajectory AI' },
            { id: 'DIGITAL_TWIN', label: '4. Digital Twin' },
            { id: 'WHAT_IF_SIMULATOR', label: '5. What-If Sim' },
            { id: 'CONNECTIVITY_GRAPH', label: '6. Risk Graph' },
            { id: 'EDGE_OFFLINE', label: '7. Edge TinyML' },
            { id: 'EXPLAINABLE_AI', label: '8. SHAP XAI' },
            { id: 'CLOSED_LOOP', label: '9. Closed Loop' },
            { id: 'MULTI_LAYER_MAP', label: '10. 5-Layer Map' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`p-2 rounded-xl text-[11px] font-bold text-center border transition-all truncate ${
                activeTab === item.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold'
                  : 'bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: 1. MULTI-MODAL RISK FUSION ENGINE */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'FUSION_ENGINE') && (
        <MultiModalFusionEngine
          selectedLocation={selectedLoc}
          onApplyFusionScore={handleApplyFusionScore}
        />
      )}

      {/* VIEW: 2. SPATIO-TEMPORAL AI & RISK TRAJECTORY */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'SPATIO_TEMPORAL') && (
        <SpatioTemporalTrajectory
          locations={locations}
          selectedLocation={selectedLoc}
          onSelectLocation={(l) => {
            setSelectedLoc(l);
            if (onSelectLocation) onSelectLocation(l);
          }}
        />
      )}

      {/* VIEW: 3. DIGITAL TWIN OF VULNERABLE ZONES */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'DIGITAL_TWIN') && (
        <DigitalTwinExplorer
          locations={locations}
          selectedLocation={selectedLoc}
          onSelectLocation={(l) => {
            setSelectedLoc(l);
            if (onSelectLocation) onSelectLocation(l);
          }}
        />
      )}

      {/* VIEW: 4. "WHAT-IF" DISASTER DECISION SIMULATOR */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'WHAT_IF_SIMULATOR') && (
        <div className="bg-slate-900 border border-purple-500/30 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-['Outfit'] text-slate-100">
                  &ldquo;What-If&rdquo; Disaster Decision Simulator (Killer SIH Feature)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Interactive disaster scenario generator. Answers: What if rainfall increases? What if soil saturation peaks? Which road fails?
              </p>
            </div>

            <button
              onClick={() => {
                setRainfallSurgePercent(0);
                setSoilMoistureLevel('NORMAL');
                setSensorAnomalyState('NORMAL');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>

          {/* Interactive Simulation Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Control 1: Rainfall Surge */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">1. Rainfall Surge:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {rainfallSurgePercent === 0 ? 'Baseline (0%)' : `+${rainfallSurgePercent}%`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { val: 10, label: '+10%' },
                  { val: 25, label: '+25%' },
                  { val: 50, label: '+50%' },
                  { val: 100, label: '+100%' },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    onClick={() => setRainfallSurgePercent(btn.val)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      rainfallSurgePercent === btn.val
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                Simulates severe monsoon cloudburst over fragile escarpment.
              </p>
            </div>

            {/* Control 2: Soil Moisture */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">2. Soil Moisture Saturation:</span>
                <span className="font-bold text-amber-400">{soilMoistureLevel}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['NORMAL', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSoilMoistureLevel(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      soilMoistureLevel === lvl
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                Pore water pressure accumulation in colluvial overburden.
              </p>
            </div>

            {/* Control 3: Sensor Anomaly */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">3. Sensor Ground Movement:</span>
                <span className="font-bold text-rose-400 font-mono">
                  {sensorAnomalyState === 'GROUND_MOVEMENT_DETECTED' ? 'Movement (>10mm)' : 'Normal'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['NORMAL', 'GROUND_MOVEMENT_DETECTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSensorAnomalyState(st)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      sensorAnomalyState === st
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {st === 'NORMAL' ? 'Normal Baseline' : 'Creep Detected'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                InSAR & borehole tiltmeter subsurface shear rate.
              </p>
            </div>
          </div>

          {/* Recalculated What-If Decision Outputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">Recalculated Landslide Risk</span>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                {simulatedRiskScore}% <span className="text-xs text-rose-300 font-bold">CRITICAL</span>
              </div>
              <span className="text-[11px] text-slate-400">+{(simulatedRiskScore - (selectedLoc.riskScore || 70))} pts above baseline</span>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">Affected Downslope Villages</span>
              <div className="text-2xl font-extrabold text-amber-300 font-mono">
                {selectedLoc.vulnerableVillages?.length || 4} Villages
              </div>
              <span className="text-[11px] text-slate-400">{simulatedPop.toLocaleString()} Exposed Citizens</span>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">Critical Roads Severed</span>
              <div className="text-2xl font-extrabold text-cyan-300 font-mono">
                {simulatedBlockedRoadsCount} Lifelines
              </div>
              <span className="text-[11px] text-slate-400">NH-27 & Lumding Rail Link</span>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">Hospital Accessibility Impact</span>
              <div className="text-2xl font-extrabold text-purple-300 font-mono">
                100% Severed
              </div>
              <span className="text-[11px] text-slate-400">Requires Air-Lift / Detour B</span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Protocol: <strong className="text-rose-400">Pre-Position NDRF 1st Bn at KM 142</strong> | <strong className="text-amber-400">Issue SMS CAP Alert</strong>
            </div>

            <button
              onClick={handleSimulateBroadcast}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Synchronized Multi-Channel Alert</span>
            </button>
          </div>

          {dispatchSuccess && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-600/50 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{dispatchSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* VIEW: 5. CONNECTIVITY RISK GRAPH & ISOLATION ENGINE */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'CONNECTIVITY_GRAPH') && (
        <ConnectivityRiskGraph />
      )}

      {/* VIEW: 6. EDGE AI & OFFLINE INTELLIGENCE */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'EDGE_OFFLINE') && (
        <EdgeOfflineResilience />
      )}

      {/* VIEW: 7. EXPLAINABLE AI (SHAP) ATTRIBUTION */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'EXPLAINABLE_AI') && (
        <ExplainableAIShapView
          locations={locations}
          selectedLocation={selectedLoc}
          onSelectLocation={(l) => {
            setSelectedLoc(l);
            if (onSelectLocation) onSelectLocation(l);
          }}
        />
      )}

      {/* VIEW: 8. CLOSED-LOOP LEARNING & RECALIBRATION */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'CLOSED_LOOP') && (
        <ClosedLoopLearningView />
      )}

      {/* VIEW: 9 & 10. MULTI-LAYER RISK MAP & RISK CONFIDENCE SCORECARD */}
      {(activeTab === 'ALL_OVERVIEW' || activeTab === 'MULTI_LAYER_MAP') && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold font-['Outfit'] text-slate-100">
                  Multi-Layer Risk Synthesis & Data Confidence Scorecard (Features 13 & 14)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Synthesizes 5 distinct geospatial risk dimensions into an actionable operational triage priority.
              </p>
            </div>

            {/* Sensor Availability Toggle (Feature 13) */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Sensor Availability:</span>
              <button
                onClick={() =>
                  setSensorAvailabilityMode(
                    sensorAvailabilityMode === 'FULL_TELEMETRY' ? 'PARTIAL_OUTAGE' : 'FULL_TELEMETRY'
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  sensorAvailabilityMode === 'FULL_TELEMETRY'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-amber-950 text-amber-300 border-amber-700'
                }`}
              >
                {sensorAvailabilityMode === 'FULL_TELEMETRY' ? 'Full Telemetry (91% Q)' : 'Simulate 2 Outages (46% Q)'}
              </button>
            </div>
          </div>

          {/* 5-Layer Stack Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] block">
                Layer 1: Hazard Risk
              </span>
              <div className="text-2xl font-extrabold text-slate-100 font-mono">
                {selectedLoc.multiLayerScores?.hazardScore || 88}%
              </div>
              <p className="text-[11px] text-slate-400">Rainfall + Slope + Soil Saturation</p>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                Layer 2: Exposure
              </span>
              <div className="text-2xl font-extrabold text-slate-100 font-mono">
                {selectedLoc.multiLayerScores?.exposureScore || 79}%
              </div>
              <p className="text-[11px] text-slate-400">Population + Houses + Roads</p>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-yellow-400 font-bold uppercase tracking-wider text-[10px] block">
                Layer 3: Vulnerability
              </span>
              <div className="text-2xl font-extrabold text-slate-100 font-mono">
                {selectedLoc.multiLayerScores?.vulnerabilityScore || 84}%
              </div>
              <p className="text-[11px] text-slate-400">Elderly + Remote Kutcha Houses</p>
            </div>

            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
                Layer 4: Connectivity
              </span>
              <div className="text-2xl font-extrabold text-slate-100 font-mono">
                {selectedLoc.multiLayerScores?.connectivityScore || 92}%
              </div>
              <p className="text-[11px] text-slate-400">Single Access Road (Isolation Risk)</p>
            </div>

            <div className="bg-gradient-to-b from-indigo-950 to-slate-900 p-4 rounded-xl border border-indigo-500/50 space-y-1.5">
              <span className="text-indigo-300 font-bold uppercase tracking-wider text-[10px] block">
                Layer 5: Response Priority
              </span>
              <div className="text-2xl font-extrabold text-indigo-300 font-mono">
                #{selectedLoc.multiLayerScores?.compositePriority ? Math.round((100 - selectedLoc.multiLayerScores.compositePriority) / 25) + 1 : 1} CRITICAL
              </div>
              <p className="text-[11px] text-slate-400">Synthesis = Priority 1 Triage</p>
            </div>
          </div>

          {/* Feature 13: Risk Confidence & Data Quality Scorecard */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-200">
                Data Quality & Confidence Index for {selectedLoc.name}:
              </span>
              <p className="text-slate-400 text-[11px]">
                {sensorAvailabilityMode === 'FULL_TELEMETRY'
                  ? 'All 6 IoT tiltmeters, rainfall gauges, and InSAR baselines active. Confidence: HIGH.'
                  : '⚠ Sensor outage: 2 station batteries depleted. Model operating on satellite SAR + DEM physics. Alerting geologists for ground check.'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Quality Score</span>
                <strong className={`font-mono text-sm ${sensorAvailabilityMode === 'FULL_TELEMETRY' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {sensorAvailabilityMode === 'FULL_TELEMETRY' ? '91% Quality' : '46% Quality'}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Confidence</span>
                <span className={`px-2.5 py-1 rounded font-bold text-xs ${sensorAvailabilityMode === 'FULL_TELEMETRY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                  {sensorAvailabilityMode === 'FULL_TELEMETRY' ? 'HIGH CONFIDENCE' : 'LOW CONFIDENCE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
