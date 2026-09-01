import React, { useState, useMemo } from 'react';
import {
  Share2,
  Truck,
  Building2,
  HeartPulse,
  Home,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  Navigation,
  Radio,
  Download,
  Copy,
  Check,
  FileCode,
  MapPin,
  Layers,
  UploadCloud,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { ConnectivityGraphNode, ConnectivityGraphEdge } from '../types';
import { initialConnectivityNodes, initialConnectivityEdges } from '../data/nerData';
import { dimaHasaoGeoJSON } from '../data/dimaHasaoGeoJSON';
import {
  parseGeoJsonToConnectivityGraph,
  calculateNetworkIsolation,
  exportConnectivityRiskGraphToGeoJson,
} from '../services/connectivityGeoJsonEngine';

interface ConnectivityRiskGraphProps {
  initialNodes?: ConnectivityGraphNode[];
  initialEdges?: ConnectivityGraphEdge[];
}

export const ConnectivityRiskGraph: React.FC<ConnectivityRiskGraphProps> = ({
  initialNodes = initialConnectivityNodes,
  initialEdges = initialConnectivityEdges,
}) => {
  // Mode selection: 'GEOJSON_OSM' (Real OpenStreetMap Dima Hasao Grid) | 'SCHEMATIC' (Topological Diagram)
  const [activeDataset, setActiveDataset] = useState<'GEOJSON_OSM' | 'SCHEMATIC'>('GEOJSON_OSM');
  const [nodes, setNodes] = useState<ConnectivityGraphNode[]>(() => {
    const { nodes: osmNodes } = parseGeoJsonToConnectivityGraph(dimaHasaoGeoJSON);
    return osmNodes.length > 0 ? osmNodes : initialNodes;
  });
  const [edges, setEdges] = useState<ConnectivityGraphEdge[]>(() => {
    const { edges: osmEdges } = parseGeoJsonToConnectivityGraph(dimaHasaoGeoJSON);
    return osmEdges.length > 0 ? osmEdges : initialEdges;
  });

  const [selectedElement, setSelectedElement] = useState<{ type: 'NODE' | 'EDGE'; id: string } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);

  // Switch between Real OSM GeoJSON and Schematic
  const handleDatasetSwitch = (mode: 'GEOJSON_OSM' | 'SCHEMATIC') => {
    setActiveDataset(mode);
    if (mode === 'GEOJSON_OSM') {
      const { nodes: osmNodes, edges: osmEdges } = parseGeoJsonToConnectivityGraph(dimaHasaoGeoJSON);
      const { updatedNodes } = calculateNetworkIsolation(osmNodes, osmEdges);
      setNodes(updatedNodes);
      setEdges(osmEdges);
    } else {
      const { updatedNodes } = calculateNetworkIsolation(initialConnectivityNodes, initialConnectivityEdges);
      setNodes(updatedNodes);
      setEdges(initialConnectivityEdges);
    }
    setSelectedElement(null);
  };

  // Toggle road blockage on click
  const handleToggleRoad = (edgeId: string) => {
    const updatedEdges = edges.map((e) => {
      if (e.id === edgeId) {
        const nextStatus: 'OPEN' | 'VULNERABLE' | 'BLOCKED' =
          e.status === 'OPEN' ? 'BLOCKED' : e.status === 'BLOCKED' ? 'VULNERABLE' : 'OPEN';
        return { ...e, status: nextStatus };
      }
      return e;
    });
    setEdges(updatedEdges);
    const { updatedNodes } = calculateNetworkIsolation(nodes, updatedEdges);
    setNodes(updatedNodes);
  };

  // Reset graph
  const handleReset = () => {
    handleDatasetSwitch(activeDataset);
  };

  // Custom GeoJSON Import handler
  const handleApplyCustomGeoJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const { nodes: parsedNodes, edges: parsedEdges } = parseGeoJsonToConnectivityGraph(parsed);
      if (parsedNodes.length === 0) {
        alert('No valid Point or LineString features found in GeoJSON.');
        return;
      }
      const { updatedNodes } = calculateNetworkIsolation(parsedNodes, parsedEdges);
      setNodes(updatedNodes);
      setEdges(parsedEdges);
      setIsImportModalOpen(false);
      setImportJsonText('');
    } catch (err: any) {
      alert('Invalid GeoJSON format: ' + err?.message);
    }
  };

  // Generated RFC 7946 GeoJSON
  const liveGeoJson = useMemo(() => {
    return exportConnectivityRiskGraphToGeoJson(nodes, edges);
  }, [nodes, edges]);

  const liveGeoJsonString = useMemo(() => {
    return JSON.stringify(liveGeoJson, null, 2);
  }, [liveGeoJson]);

  // Download GeoJSON file
  const handleDownloadGeoJson = () => {
    const blob = new Blob([liveGeoJsonString], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ner-connectivity-risk-${new Date().toISOString().slice(0, 10)}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy GeoJSON to clipboard
  const handleCopyGeoJson = () => {
    navigator.clipboard.writeText(liveGeoJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isolatedNodes = nodes.filter((n) => n.isIsolated);
  const totalIsolatedPop = isolatedNodes.reduce((sum, n) => sum + (n.population || 0), 0);
  const blockedRoads = edges.filter((e) => e.status === 'BLOCKED');

  // Compute coordinate bounding box for SVG projection
  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    if (nodes.length === 0) return { minLat: 25.0, maxLat: 25.6, minLng: 92.5, maxLng: 93.4 };
    const lats = nodes.map((n) => n.lat);
    const lngs = nodes.map((n) => n.lng);
    return {
      minLat: Math.min(...lats) - 0.05,
      maxLat: Math.max(...lats) + 0.05,
      minLng: Math.min(...lngs) - 0.05,
      maxLng: Math.max(...lngs) + 0.05,
    };
  }, [nodes]);

  // Project geographic coordinates (lat, lng) onto 600x340 SVG viewbox
  const projectCoord = (lat: number, lng: number) => {
    const width = 560;
    const height = 280;
    const paddingX = 40;
    const paddingY = 30;

    const x = paddingX + ((lng - minLng) / (maxLng - minLng || 1)) * width;
    const y = paddingY + ((maxLat - lat) / (maxLat - minLat || 1)) * height;
    return { x, y };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-yellow-600/20 text-yellow-400 border border-yellow-500/40">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Dynamic &ldquo;Connectivity Risk Graph&rdquo; & Isolation Engine
                <span className="text-xs bg-yellow-950 text-yellow-300 font-mono px-2 py-0.5 rounded border border-yellow-800">
                  GeoJSON Network Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Models road lifelines (NH-27, NH-627, SH-37, bridges) as a topological graph to identify isolated communities and output directly as GeoJSON.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & GeoJSON Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dataset Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => handleDatasetSwitch('GEOJSON_OSM')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeDataset === 'GEOJSON_OSM'
                  ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OSM Dima Hasao (Real GeoJSON)
            </button>
            <button
              onClick={() => handleDatasetSwitch('SCHEMATIC')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeDataset === 'SCHEMATIC'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Regional Schematic
            </button>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export as GeoJSON</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import GeoJSON</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Reset Network"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Isolation Status Alert Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isolatedNodes.length > 0
            ? 'bg-rose-950/70 border-rose-600/70'
            : 'bg-emerald-950/70 border-emerald-600/70'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl ${
              isolatedNodes.length > 0
                ? 'bg-rose-600/30 text-rose-400 animate-pulse'
                : 'bg-emerald-600/30 text-emerald-400'
            }`}
          >
            {isolatedNodes.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block">
              {isolatedNodes.length > 0 ? 'CRITICAL NETWORK ISOLATION DETECTED' : 'ALL HABITATIONS CONNECTED'}
            </span>
            <p className="text-sm font-bold text-slate-100">
              {isolatedNodes.length > 0
                ? `${isolatedNodes.length} Habitations Completely Cut-Off (${totalIsolatedPop.toLocaleString()} Citizens Isolated)`
                : 'Full emergency road connectivity maintained to tertiary medical trauma hubs.'}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-right text-slate-300">
          <div>Blocked Arterials: <strong className="text-rose-400">{blockedRoads.length}</strong> / {edges.length}</div>
          <div>GeoJSON Nodes: <strong className="text-cyan-300">{nodes.length}</strong></div>
        </div>
      </div>

      {/* Interactive Graph Canvas & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Projected SVG Network Graph */}
        <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {activeDataset === 'GEOJSON_OSM'
                  ? 'Real-world OpenStreetMap Dima Hasao Geographic Projection'
                  : 'Schematic Topological Highway Graph'}
              </span>
            </span>
            <span className="text-[11px] font-mono text-yellow-400">Click Any Road = Toggle Landslide Blockage</span>
          </div>

          <div className="relative w-full h-84 bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <svg viewBox="0 0 640 340" className="w-full h-full">
              {/* Draw Edges */}
              {edges.map((edge) => {
                const s = nodes.find((n) => n.id === edge.sourceNodeId);
                const t = nodes.find((n) => n.id === edge.targetNodeId);
                if (!s || !t) return null;

                const p1 = projectCoord(s.lat, s.lng);
                const p2 = projectCoord(t.lat, t.lng);

                const isBlocked = edge.status === 'BLOCKED';
                const isVuln = edge.status === 'VULNERABLE';

                return (
                  <g
                    key={edge.id}
                    className="cursor-pointer group"
                    onClick={() => handleToggleRoad(edge.id)}
                  >
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isBlocked ? '#ef4444' : isVuln ? '#f59e0b' : '#10b981'}
                      strokeWidth={isBlocked ? '4' : '3'}
                      strokeDasharray={isBlocked ? '6,4' : isVuln ? '4,2' : 'none'}
                    />
                    {/* Wider invisible hit area for easy click */}
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="transparent"
                      strokeWidth="18"
                    />
                    {/* Edge Label */}
                    <text
                      x={(p1.x + p2.x) / 2}
                      y={(p1.y + p2.y) / 2 - 5}
                      fill={isBlocked ? '#f87171' : isVuln ? '#fbbf24' : '#6ee7b7'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {edge.roadName.split(' (')[0]} {isBlocked ? '✖ BLOCKED' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {nodes.map((node) => {
                const isHospital = node.type === 'HOSPITAL';
                const isTown = node.type === 'TOWN';
                const isIsolated = node.isIsolated;
                const pos = projectCoord(node.lat, node.lng);

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedElement({ type: 'NODE', id: node.id })}
                  >
                    {/* Ping wave when isolated */}
                    {isIsolated && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="18"
                        fill="#ef4444"
                        fillOpacity="0.35"
                        className="animate-ping"
                      />
                    )}

                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isHospital ? '15' : isTown ? '13' : '10'}
                      fill={
                        isIsolated
                          ? '#dc2626'
                          : isHospital
                          ? '#0284c7'
                          : isTown
                          ? '#7c3aed'
                          : '#059669'
                      }
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Node symbol */}
                    <text
                      x={pos.x}
                      y={pos.y + 3.5}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isHospital ? 'H' : isTown ? 'T' : 'V'}
                    </text>

                    {/* Node Name */}
                    <text
                      x={pos.x}
                      y={pos.y + 20}
                      fill={isIsolated ? '#fca5a5' : '#e2e8f0'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {node.name.replace(', Haflong', '')}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Hospital (Trauma Center)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Town Headquarter
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Connected Habitation
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span> Isolated Habitation
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">CRS: EPSG:4326 (WGS84)</span>
          </div>
        </div>

        {/* Right: Isolation & Alternative Routing Triage */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Isolated Habitancy Triage:</span>
              <span className="text-[10px] text-yellow-400 font-mono">
                {isolatedNodes.length} Isolated
              </span>
            </h4>

            {isolatedNodes.length === 0 ? (
              <div className="text-xs text-emerald-300 flex items-center space-x-2 py-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero communities isolated. All hospital routes cleared.</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {isolatedNodes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 bg-red-950/60 rounded-xl border border-red-800 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-red-200">{n.name}</strong>
                      <span className="text-[10px] bg-red-900 text-red-100 px-2 py-0.5 rounded font-bold">
                        CUT-OFF
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Pop: <strong>{n.population?.toLocaleString()}</strong> • Coord: {n.lat.toFixed(3)}°N, {n.lng.toFixed(3)}°E
                    </p>
                    <div className="text-[10px] text-amber-300 font-semibold pt-0.5">
                      ➔ Alternative Detour: Air-drop / Riverine boat transit required.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick GeoJSON Export Card */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                GeoJSON Connectivity Pipeline
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                RFC 7946
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Export real-time road status, isolation flags, and bridge bottlenecks directly as GeoJSON into QGIS, ArcGIS, or the automated Connectivity Risk Graph engine.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDownloadGeoJson}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .geojson</span>
              </button>
              <button
                onClick={handleCopyGeoJson}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXPORT GEOJSON MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Export Response as GeoJSON (Connectivity Risk Graph)
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              This RFC 7946 GeoJSON FeatureCollection encodes all {nodes.length} habitations (Points) and {edges.length} road lifelines (LineStrings) with live blockage states, isolation flags, and detour recommendations.
            </p>

            <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-auto font-mono text-[11px] text-emerald-300 max-h-96 select-all">
              <pre>{liveGeoJsonString}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {liveGeoJson.features.length} Features • {isolatedNodes.length} Isolated • {blockedRoads.length} Blocked
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyGeoJson}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy GeoJSON'}</span>
                </button>
                <button
                  onClick={handleDownloadGeoJson}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .geojson</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT GEOJSON MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <UploadCloud className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Import Custom Overpass / QGIS GeoJSON
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste your GeoJSON FeatureCollection (containing Points for towns/hospitals and LineStrings for roads) below to feed directly into the Connectivity Risk Graph engine:
            </p>

            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='Paste GeoJSON FeatureCollection here... e.g. { "type": "FeatureCollection", "features": [ ... ] }'
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomGeoJson}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Parse & Feed Graph Engine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
