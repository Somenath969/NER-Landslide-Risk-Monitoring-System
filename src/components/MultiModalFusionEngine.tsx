import React, { useState } from 'react';
import {
  Layers,
  Sliders,
  Sparkles,
  RefreshCw,
  Info,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { LocationData, MultiModalFusionScores, RiskLevel } from '../types';

interface MultiModalFusionEngineProps {
  selectedLocation: LocationData;
  onApplyFusionScore?: (newScore: number, newLevel: RiskLevel) => void;
}

export const MultiModalFusionEngine: React.FC<MultiModalFusionEngineProps> = ({
  selectedLocation,
  onApplyFusionScore,
}) => {
  // Preset or custom weights
  const [weightsPreset, setWeightsPreset] = useState<'MONSOON_DELUGE' | 'DRY_SEASON' | 'SEISMIC_TRIGGER' | 'BALANCED_ENSEMBLE'>('MONSOON_DELUGE');

  // Sub-model risk values (0-100)
  const initialScores = selectedLocation.fusionScores || {
    rainfallRisk: 82,
    soilMoistureRisk: 74,
    slopeRisk: 91,
    groundMovementRisk: 68,
    historicalRisk: 77,
    satelliteRisk: 63,
    citizenReportRisk: 80,
    fusedRiskScore: 86,
    fusedProbability: 0.86,
    fusedLevel: 'CRITICAL',
    confidence: 'HIGH',
    dataQualityPercent: 91,
    weights: {
      rainfall: 0.28,
      soil: 0.22,
      terrain: 0.18,
      iot: 0.14,
      historical: 0.08,
      satellite: 0.06,
      citizen: 0.04,
    },
  };

  const [rainfallRisk, setRainfallRisk] = useState<number>(initialScores.rainfallRisk);
  const [soilRisk, setSoilRisk] = useState<number>(initialScores.soilMoistureRisk);
  const [slopeRisk, setSlopeRisk] = useState<number>(initialScores.slopeRisk);
  const [groundRisk, setGroundRisk] = useState<number>(initialScores.groundMovementRisk);
  const [historicalRisk, setHistoricalRisk] = useState<number>(initialScores.historicalRisk);
  const [satelliteRisk, setSatelliteRisk] = useState<number>(initialScores.satelliteRisk);
  const [citizenRisk, setCitizenRisk] = useState<number>(initialScores.citizenReportRisk);

  // Weights based on preset
  const getWeights = () => {
    switch (weightsPreset) {
      case 'MONSOON_DELUGE':
        return { rainfall: 0.35, soil: 0.25, terrain: 0.15, iot: 0.12, historical: 0.06, satellite: 0.04, citizen: 0.03 };
      case 'DRY_SEASON':
        return { rainfall: 0.10, soil: 0.15, terrain: 0.30, iot: 0.25, historical: 0.12, satellite: 0.05, citizen: 0.03 };
      case 'SEISMIC_TRIGGER':
        return { rainfall: 0.15, soil: 0.15, terrain: 0.35, iot: 0.25, historical: 0.05, satellite: 0.03, citizen: 0.02 };
      case 'BALANCED_ENSEMBLE':
      default:
        return { rainfall: 0.25, soil: 0.20, terrain: 0.20, iot: 0.15, historical: 0.10, satellite: 0.05, citizen: 0.05 };
    }
  };

  const currentWeights = getWeights();

  // Calculate fused risk score
  const calculatedFusedScore = Math.round(
    rainfallRisk * currentWeights.rainfall +
    soilRisk * currentWeights.soil +
    slopeRisk * currentWeights.terrain +
    groundRisk * currentWeights.iot +
    historicalRisk * currentWeights.historical +
    satelliteRisk * currentWeights.satellite +
    citizenRisk * currentWeights.citizen
  );

  const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MODERATE';
    return 'LOW';
  };

  const fusedLevel = getRiskLevel(calculatedFusedScore);
  const fusedProbability = (calculatedFusedScore / 100).toFixed(2);

  const handleApply = () => {
    if (onApplyFusionScore) {
      onApplyFusionScore(calculatedFusedScore, fusedLevel);
    }
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Multi-Modal Risk Fusion Engine
                <span className="text-xs bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-800">
                  Ensemble Core
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Fuses physical sensor telemetry, satellite InSAR, geomorphological DEM, and crowdsourced intelligence into a unified probability score.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2 bg-slate-850 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Fusion Preset:</span>
          {(['MONSOON_DELUGE', 'BALANCED_ENSEMBLE', 'DRY_SEASON', 'SEISMIC_TRIGGER'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setWeightsPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                weightsPreset === preset
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Model Fusion Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: 7 Sub-Models (Inputs) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span>7 Sub-Model Ensembles</span>
            <span>Weight Contribution</span>
          </div>

          {/* Model 1: Rainfall Model */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <strong className="text-slate-200">1. Rainfall Model (IMD + GSI Intensity Curve)</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-cyan-400 font-bold">{rainfallRisk}% Risk</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {(currentWeights.rainfall * 100).toFixed(0)}% Wt
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rainfallRisk}
              onChange={(e) => setRainfallRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Model 2: Soil Moisture Model */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <strong className="text-slate-200">2. Soil Moisture & Pore Pressure Model</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-amber-400 font-bold">{soilRisk}% Risk</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {(currentWeights.soil * 100).toFixed(0)}% Wt
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soilRisk}
              onChange={(e) => setSoilRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Model 3: Terrain / Slope Model */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <strong className="text-slate-200">3. Terrain Slope & Lithology Model</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-emerald-400 font-bold">{slopeRisk}% Risk</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {(currentWeights.terrain * 100).toFixed(0)}% Wt
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={slopeRisk}
              onChange={(e) => setSlopeRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Model 4: IoT Ground Movement Model */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <strong className="text-slate-200">4. IoT Tiltmeter & Geophone Creep Model</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-purple-400 font-bold">{groundRisk}% Risk</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {(currentWeights.iot * 100).toFixed(0)}% Wt
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={groundRisk}
              onChange={(e) => setGroundRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Model 5: Historical GSI Model */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <strong className="text-slate-200">5. Historical Susceptibility Model (1970–2025)</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-rose-400 font-bold">{historicalRisk}% Risk</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {(currentWeights.historical * 100).toFixed(0)}% Wt
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={historicalRisk}
              onChange={(e) => setHistoricalRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>

          {/* Model 6: Satellite InSAR Model */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <strong className="text-slate-200">6. Satellite Sentinel-1 InSAR Deformation</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-blue-400 font-bold">{satelliteRisk}% Risk</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {(currentWeights.satellite * 100).toFixed(0)}% Wt
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={satelliteRisk}
              onChange={(e) => setSatelliteRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />
          </div>

          {/* Model 7: Citizen Crowdsourced Intelligence */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                <strong className="text-slate-200">7. Citizen Reports & AI Crack Verification</strong>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-indigo-400 font-bold">{citizenRisk}% Risk</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {(currentWeights.citizen * 100).toFixed(0)}% Wt
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={citizenRisk}
              onChange={(e) => setCitizenRisk(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>

        {/* Right Column: FUSION ENGINE OUTPUT CARD */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
          <div className="p-6 bg-gradient-to-b from-slate-850 to-slate-900 rounded-2xl border border-indigo-500/40 shadow-xl space-y-4 text-center">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-950/80 border border-indigo-800 px-3 py-1 rounded-full text-xs text-indigo-300 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FUSION MODEL RESULT</span>
            </div>

            {/* Fused Risk Display */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Multi-Modal Risk Score
              </span>
              <div className="text-5xl font-extrabold font-['Outfit'] tracking-tight text-white flex items-center justify-center gap-1">
                <span>{calculatedFusedScore}</span>
                <span className="text-2xl text-slate-500 font-normal">/100</span>
              </div>
            </div>

            {/* Status Level Badge */}
            <div className="flex items-center justify-center space-x-2">
              <span
                className={`px-4 py-1.5 rounded-xl font-extrabold text-sm border shadow-lg ${
                  fusedLevel === 'CRITICAL'
                    ? 'bg-red-950/90 text-red-300 border-red-700'
                    : fusedLevel === 'HIGH'
                    ? 'bg-amber-950/90 text-amber-300 border-amber-700'
                    : fusedLevel === 'MODERATE'
                    ? 'bg-yellow-950/90 text-yellow-300 border-yellow-700'
                    : 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                }`}
              >
                {fusedLevel} RISK LEVEL
              </span>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block text-[10px]">Risk Probability</span>
                <strong className="text-cyan-300 text-sm font-mono">{fusedProbability}</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-left">
                <span className="text-slate-400 block text-[10px]">Confidence Level</span>
                <strong className="text-emerald-400 text-sm">HIGH (91% Q)</strong>
              </div>
            </div>

            {/* Formula Summary Box */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono text-left space-y-1">
              <div className="text-indigo-300 font-bold">Fusion Equation:</div>
              <div className="truncate">
                Score = ∑ (W_i × S_i) = {(rainfallRisk * currentWeights.rainfall).toFixed(1)} + {(soilRisk * currentWeights.soil).toFixed(1)} + {(slopeRisk * currentWeights.terrain).toFixed(1)} + {(groundRisk * currentWeights.iot).toFixed(1)} + ...
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApply}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Fused Score to Active Monitoring</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
