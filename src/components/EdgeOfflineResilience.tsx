import React, { useState } from 'react';
import {
  Cpu,
  Radio,
  Wifi,
  WifiOff,
  BatteryCharging,
  Sun,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { EdgeDeviceTelemetryNode } from '../types';
import { initialEdgeDevices } from '../data/nerData';

interface EdgeOfflineResilienceProps {
  devices?: EdgeDeviceTelemetryNode[];
}

export const EdgeOfflineResilience: React.FC<EdgeOfflineResilienceProps> = ({
  devices = initialEdgeDevices,
}) => {
  const [deviceNodes, setDeviceNodes] = useState<EdgeDeviceTelemetryNode[]>(devices);
  const [simulatedBlackout, setSimulatedBlackout] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<EdgeDeviceTelemetryNode>(devices[0]);

  // Toggle network blackout simulation
  const handleToggleBlackout = () => {
    const nextState = !simulatedBlackout;
    setSimulatedBlackout(nextState);

    const updated = deviceNodes.map((n) => {
      if (nextState) {
        // Disconnect 4G / Cloud, switch to LoRa Mesh & offline queue
        return {
          ...n,
          networkUplink: 'LORA_MESH' as const,
          offlineBufferQueueCount: n.offlineBufferQueueCount + 48,
          lastLocalSync: 'LoRa Mesh (P2P Direct)',
        };
      } else {
        // Restore Cloud
        return {
          ...n,
          networkUplink: '4G_LTE' as const,
          offlineBufferQueueCount: 0,
          lastLocalSync: 'Just now (Cloud Restored)',
        };
      }
    });
    setDeviceNodes(updated);
    setSelectedNode(updated[0]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/40">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Edge AI & Disaster-Resilient Offline Intelligence
                <span className="text-xs bg-amber-950 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-800">
                  Solar + TinyML + LoRa
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Guarantees zero downtime inference (&lt;15ms) and autonomous siren activation even when mountain cloudbursts sever all cellular connectivity.
              </p>
            </div>
          </div>
        </div>

        {/* Network Blackout Stress Test Trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleBlackout}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all shadow-md ${
              simulatedBlackout
                ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-rose-600/30 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {simulatedBlackout ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>{simulatedBlackout ? 'Restore 4G / WAN Cloud' : 'Simulate Mountain Network Blackout'}</span>
          </button>
        </div>
      </div>

      {/* Network Resilience Hierarchy Failover Diagram */}
      <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Resilient Failover Hierarchy (Auto-Switches on Loss of Carrier)
          </span>
          <span className="font-mono text-cyan-400 text-[11px]">
            Active Channel: {simulatedBlackout ? 'Level 4: Local LoRa Mesh & IndexedDB' : 'Level 1: Cloud 4G LTE'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
          {[
            { level: '1. Cloud AI', tech: '4G / Fiber WAN', active: !simulatedBlackout, status: !simulatedBlackout ? 'Primary Link' : 'SEVERED' },
            { level: '2. CAP Broadcast', tech: 'Emergency SMS / Cell', active: true, status: '2G Standby' },
            { level: '3. Offline PWA', tech: 'Client-Side Cache', active: true, status: 'IndexedDB Ready' },
            { level: '4. Edge Gateway', tech: 'Raspberry Pi TinyML', active: true, status: '15ms On-Device' },
            { level: '5. LoRa / VHF Mesh', tech: '868MHz Point-to-Point', active: true, status: 'Zero-Grid Mesh' },
          ].map((item) => (
            <div
              key={item.level}
              className={`p-3 rounded-xl border transition-all ${
                item.active && (!simulatedBlackout || item.level.includes('Edge') || item.level.includes('LoRa') || item.level.includes('PWA') || item.level.includes('CAP'))
                  ? 'bg-slate-900 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/50 border-rose-800/60 text-rose-400 opacity-60'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <strong className="text-slate-100">{item.level}</strong>
                <span className="text-[10px] font-mono font-bold">{item.status}</span>
              </div>
              <span className="text-[11px] text-slate-400 block">{item.tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Edge Telemetry Devices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Node Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {deviceNodes.map((node) => {
            const isSelected = selectedNode.deviceId === node.deviceId;
            const isOnline = node.networkUplink === '4G_LTE' || node.networkUplink === 'FIBRE_INTERNET';

            return (
              <div
                key={node.deviceId}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 shadow-xl ring-2 ring-amber-500/30'
                    : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    {node.deviceName}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isOnline
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {node.networkUplink}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hardware:</span>
                    <strong className="text-slate-200">{node.hardware}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span>{node.locationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TinyML Latency:</span>
                    <span className="text-cyan-400 font-mono font-bold">{node.localInferenceLatencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Anomaly Anomaly:</span>
                    <span className={`font-mono font-bold ${node.localAnomalyDetected ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {node.localAnomalyDetected ? 'Spike Flagged (Filtered)' : 'Stable Baseline'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2 mt-3">
                  <span className="flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    {node.batteryLevelPercent}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-yellow-400" />
                    {node.solarInputWatts}W Solar
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                    {node.offlineBufferQueueCount} Q
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Deep Dive Inspection */}
        <div className="lg:col-span-4 bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Edge Node Telemetry Stream
            </span>
            <span className="font-mono text-xs text-slate-400">{selectedNode.deviceId}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">On-Device Micro-ML Engine:</span>
              <strong className="text-slate-100 block">INT8 Quantized Random Forest & TinyML</strong>
              <p className="text-[11px] text-slate-400">
                Filters spurious lightning jitters and calculates slope failure velocity locally in {selectedNode.localInferenceLatencyMs}ms.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">Autonomous Physical Actuator:</span>
              <strong className="text-emerald-400 block">✓ Direct Relay to Highway Solenoid Siren</strong>
              <p className="text-[11px] text-slate-400">
                Triggers acoustic 120dB horn and solar LED barrier independently if risk &gt; 80% for 30s.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">Mesh Sync Buffer:</span>
              <strong className="text-indigo-300 block">{selectedNode.offlineBufferQueueCount} Compressed Packets in Queue</strong>
              <p className="text-[11px] text-slate-400">
                Auto-syncs to Central SDMA server via LoRa multi-hop relay nodes. Sync status: {selectedNode.lastLocalSync}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
