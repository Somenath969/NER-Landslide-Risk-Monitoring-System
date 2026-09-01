import React from 'react';
import {
  AlertTriangle,
  MapPin,
  Truck,
  X,
  ArrowRight,
  ShieldAlert,
  Bell,
  Sparkles,
} from 'lucide-react';
import { DisasterAlert, RoadStatus } from '../types';

export interface NotificationToastData {
  id: string;
  title: string;
  message: string;
  level: 'CRITICAL' | 'HIGH' | 'INFO';
  timestamp: string;
  locationName?: string;
  district?: string;
  roadName?: string;
  actionTab?: string;
}

interface AuthorityNotificationToastProps {
  notifications: NotificationToastData[];
  onDismiss: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
  onAction?: (tab: string) => void;
}

export const AuthorityNotificationToast: React.FC<AuthorityNotificationToastProps> = ({
  notifications,
  onDismiss,
  onNavigateTab,
  onAction,
}) => {
  if (notifications.length === 0) return null;

  const handleNavigate = (tab: string) => {
    if (typeof onNavigateTab === 'function') {
      onNavigateTab(tab);
    } else if (typeof onAction === 'function') {
      onAction(tab);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[800] max-w-md w-full space-y-2 pointer-events-none px-4 sm:px-0">
      {notifications.map((n) => {
        const isCrit = n.level === 'CRITICAL';
        const isHigh = n.level === 'HIGH';

        return (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
              isCrit
                ? 'bg-slate-900/95 border-red-500/80 text-slate-100 ring-2 ring-red-500/30'
                : isHigh
                ? 'bg-slate-900/95 border-amber-500/80 text-slate-100 ring-2 ring-amber-500/30'
                : 'bg-slate-900/95 border-cyan-500/80 text-slate-100 ring-2 ring-cyan-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isCrit
                      ? 'bg-red-500/20 text-red-400'
                      : isHigh
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {isCrit ? (
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        isCrit
                          ? 'bg-red-950 text-red-300 border-red-500/50'
                          : 'bg-amber-950 text-amber-300 border-amber-500/50'
                      }`}
                    >
                      {isCrit ? '🚨 CRITICAL PIPELINE ALERT' : '⚠️ HIGH VIGILANCE'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 mt-0.5">
                    {n.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => onDismiss(n.id)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {n.message}
            </p>

            {n.locationName && (
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{n.locationName}</span>
              </div>
            )}

            {/* Quick Action Link */}
            <div className="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  if (n.actionTab) {
                    handleNavigate(n.actionTab);
                  } else {
                    handleNavigate('gis_map');
                  }
                  onDismiss(n.id);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1 transition-all active:scale-95"
              >
                <span>View on {n.actionTab === 'roads' ? 'Roads' : 'GIS Map'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
