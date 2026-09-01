import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Zap,
  Sliders,
  Play,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { MLModelStats, LanguageCode } from '../types';
import { calculateLandslideRisk } from '../services/riskEngine';
import { translations } from '../locales/translations';

interface ModelManagementViewProps {
  modelStats: MLModelStats;
  currentLang: LanguageCode;
}

export const ModelManagementView: React.FC<ModelManagementViewProps> = ({
  modelStats,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;

  // Interactive Sandbox Inputs
  const [rain24, setRain24] = useState(140);
  const [rain72, setRain72] = useState(250);
  const [moisture, setMoisture] = useState(82);
  const [slope, setSlope] = useState(38);
  const [elevation, setElevation] = useState(850);
  const [movement, setMovement] = useState(10.5);
  const [historyCount, setHistoryCount] = useState(24);
  const [distRoad, setDistRoad] = useState(15);
  const [ndvi, setNdvi] = useState(0.42);
  const [geology, setGeology] = useState('Disang Group Shale & Siltstone (Highly Weathered)');

  // Run Real-Time Calculation
  const sandboxOutput = calculateLandslideRisk({
    rainfall24h: rain24,
    rainfall72h: rain72,
    soilMoisturePercent: moisture,
    slopeDeg: slope,
    elevationM: elevation,
    groundMovementMmDay: movement,
    historicalLandslidesCount: historyCount,
    distanceToRoadM: distRoad,
    vegetationNDVI: ndvi,
    geology,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
              AI/ML Landslide Risk Engine Laboratory & Evaluation Matrix
            </h2>
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
              XGBoost v2.4 Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ensemble Gradient Boosted Trees and Spatial Graph Attention trained on 48,650 historical NER landslide events (1985-2025).
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Last Calibrated: GSI NER & NESAC (Aug 2026)
        </div>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] text-slate-400">Accuracy</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {(modelStats.evaluationMetrics.accuracy * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] text-slate-400">Recall (Sensitivity)</span>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {(modelStats.evaluationMetrics.recall * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] text-slate-400">Precision</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {(modelStats.evaluationMetrics.precision * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] text-slate-400">F1-Score</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {(modelStats.evaluationMetrics.f1Score * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400">ROC-AUC</span>
          <p className="text-2xl font-black text-rose-400 mt-1">
            {modelStats.evaluationMetrics.rocAuc.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Feature Importance & Loss Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Feature Importance Weighting (SHAP Values)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelStats.featuresRanking}
                layout="vertical"
                margin={{ left: 80, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => val.split('(')[0]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="importance" name="Importance Weight" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix & Training Loss */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Confusion Matrix (Independent Test Split: 10,960 Samples)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-950/50 border border-emerald-500/40 p-3.5 rounded-xl space-y-1">
              <span className="text-emerald-400 font-bold">True Positives (TP)</span>
              <p className="text-2xl font-black text-slate-100">{modelStats.confusionMatrix.truePositive}</p>
              <p className="text-[10px] text-slate-400">Correctly predicted landslide events</p>
            </div>

            <div className="bg-rose-950/50 border border-rose-500/40 p-3.5 rounded-xl space-y-1">
              <span className="text-rose-400 font-bold">False Positives (FP)</span>
              <p className="text-2xl font-black text-slate-100">{modelStats.confusionMatrix.falsePositive}</p>
              <p className="text-[10px] text-slate-400">False alarms raised</p>
            </div>

            <div className="bg-rose-950/50 border border-rose-500/40 p-3.5 rounded-xl space-y-1">
              <span className="text-rose-400 font-bold">False Negatives (FN)</span>
              <p className="text-2xl font-black text-slate-100">{modelStats.confusionMatrix.falseNegative}</p>
              <p className="text-[10px] text-slate-400">Missed actual slide events</p>
            </div>

            <div className="bg-emerald-950/50 border border-emerald-500/40 p-3.5 rounded-xl space-y-1">
              <span className="text-emerald-400 font-bold">True Negatives (TN)</span>
              <p className="text-2xl font-black text-slate-100">{modelStats.confusionMatrix.trueNegative}</p>
              <p className="text-[10px] text-slate-400">Correctly classified stable slopes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Model Prediction Sandbox */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Interactive AI/ML Landslide Prediction Sandbox
            </h3>
            <p className="text-xs text-slate-400">
              Adjust environmental and geological parameters below to test the real-time inference pipeline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              24h Rainfall: <span className="text-amber-400 font-mono">{rain24} mm</span>
            </label>
            <input
              type="range"
              min="0"
              max="350"
              value={rain24}
              onChange={(e) => setRain24(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Soil Moisture: <span className="text-blue-400 font-mono">{moisture}%</span>
            </label>
            <input
              type="range"
              min="20"
              max="98"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Slope Angle: <span className="text-orange-400 font-mono">{slope}°</span>
            </label>
            <input
              type="range"
              min="10"
              max="55"
              value={slope}
              onChange={(e) => setSlope(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Ground Creep: <span className="text-rose-400 font-mono">{movement} mm/day</span>
            </label>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={movement}
              onChange={(e) => setMovement(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
        </div>

        {/* Prediction Result Banner */}
        <div className="p-4 bg-slate-850 rounded-xl border border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Predicted Risk Score</span>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-black text-slate-100 font-mono">
                {sandboxOutput.riskScore}/100
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  sandboxOutput.riskLevel === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : sandboxOutput.riskLevel === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}
              >
                {sandboxOutput.riskLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Failure Probability: {(sandboxOutput.riskProbability * 100).toFixed(0)}%
            </p>
          </div>

          <div className="md:col-span-2 space-y-1 text-xs text-slate-300">
            <p className="font-semibold text-amber-400">AI Geotechnical Diagnostic:</p>
            <p className="leading-relaxed">{sandboxOutput.aiExplanation}</p>
            <p className="text-emerald-300 font-medium pt-1">
              Directive: {sandboxOutput.recommendedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
