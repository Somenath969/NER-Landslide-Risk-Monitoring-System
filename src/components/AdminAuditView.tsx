import React, { useState } from 'react';
import {
  FileText,
  Users,
  ShieldCheck,
  Settings,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Key,
} from 'lucide-react';
import { UserAccount, AuditLogItem, LanguageCode } from '../types';
import { initialUsers } from '../data/nerData';
import { translations } from '../locales/translations';

interface AdminAuditViewProps {
  auditLogs: AuditLogItem[];
  currentLang: LanguageCode;
}

export const AdminAuditView: React.FC<AdminAuditViewProps> = ({ auditLogs, currentLang }) => {
  const t = translations[currentLang] || translations.en;
  const [users] = useState<UserAccount[]>(initialUsers);
  const [searchLog, setSearchLog] = useState('');

  // Thresholds state
  const [rainCritical, setRainCritical] = useState(120);
  const [moistureCritical, setMoistureCritical] = useState(75);
  const [tiltCritical, setTiltCritical] = useState(3.5);
  const [isSaved, setIsSaved] = useState(false);

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.targetEntity.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
              Administration, RBAC & Security Audit Logs
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              NDMA Governance Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-based user permissions, configurable critical hazard thresholds, and immutable system audit trail.
          </p>
        </div>
      </div>

      {/* Threshold Configuration & User Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Danger Threshold Configuration */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Settings className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Regional Automated Alert Trigger Thresholds
            </h3>
          </div>

          {isSaved && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 p-3 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Thresholds recalibrated and deployed to real-time AI ingestion pipeline.</span>
            </div>
          )}

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                24h Precipitation Red Alert Trigger (mm)
              </label>
              <input
                type="number"
                value={rainCritical}
                onChange={(e) => setRainCritical(Number(e.target.value))}
                className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Current baseline: 120mm/24h across Disang shale</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Soil Moisture Pore Water Saturation Trigger (%)
              </label>
              <input
                type="number"
                value={moistureCritical}
                onChange={(e) => setMoistureCritical(Number(e.target.value))}
                className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Pore pressure liquefaction threshold: 75%</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Subsurface Tiltmeter Creep Rate (arc-deg/day)
              </label>
              <input
                type="number"
                step="0.1"
                value={tiltCritical}
                onChange={(e) => setTiltCritical(Number(e.target.value))}
                className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Dangerous continuous displacement: 3.5 deg/day</span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              Update Disaster Thresholds
            </button>
          </form>
        </div>

        {/* User Directory & Roles */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Authorized Emergency Operations Officers
            </h3>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {users.map((usr) => (
              <div key={usr.id} className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{usr.name}</span>
                  <span className="bg-slate-800 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700 font-semibold">
                    {usr.role}
                  </span>
                </div>
                <p className="text-slate-400">{usr.agency}</p>
                <p className="text-[11px] text-slate-500">{usr.email} • {usr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">
              System & Operational Action Audit Trail ({filteredLogs.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              placeholder="Search audit actions..."
              className="bg-slate-800 text-slate-100 text-xs rounded-xl pl-8 pr-3 py-1.5 border border-slate-700 w-48 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-800/80 text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-2.5 rounded-l-lg">Timestamp</th>
                <th className="px-4 py-2.5">Actor & Role</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Target Entity</th>
                <th className="px-4 py-2.5">Details</th>
                <th className="px-4 py-2.5 rounded-r-lg">IP / Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()} {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <strong className="text-slate-100">{log.actorName}</strong>
                    <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{log.targetEntity}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
