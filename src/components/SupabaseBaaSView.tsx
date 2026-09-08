import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  fetchSupabaseStatus,
  seedSupabaseDatabase,
  SupabaseStatusData,
} from '../services/supabaseClient';
import { LanguageCode } from '../types';

interface SupabaseBaaSViewProps {
  currentLang: LanguageCode;
  onRefreshAllData?: () => void;
}

export const SupabaseBaaSView: React.FC<SupabaseBaaSViewProps> = ({
  currentLang,
  onRefreshAllData,
}) => {
  const [status, setStatus] = useState<SupabaseStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);
  const [seedErrorMsg, setSeedErrorMsg] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchSupabaseStatus();
      setStatus(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedSuccessMsg(null);
    setSeedErrorMsg(null);
    try {
      const res = await seedSupabaseDatabase();
      if (res.success) {
        setSeedSuccessMsg('Successfully seeded Supabase database with NER GIS & IoT datasets!');
        await loadStatus();
        if (onRefreshAllData) onRefreshAllData();
      } else {
        setSeedErrorMsg(res.error || 'Seeding failed. Verify your Supabase tables and connection.');
      }
    } catch (err: any) {
      setSeedErrorMsg(err?.message || 'Error executing seed action');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Seed Data to Supabase Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
                  <span>Seed Data to Supabase</span>
                </h1>
                <p className="text-sm text-slate-400">
                  Populate GIS locations, IoT sensor nodes, disaster alert records, and highway lifelines into Supabase.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${seeding ? 'animate-bounce' : ''}`} />
              <span>{seeding ? 'Seeding Tables...' : 'Seed Data to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Status indicator / feedback */}
        {seedSuccessMsg && (
          <div className="mt-6 p-4 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-sm text-emerald-200 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{seedSuccessMsg}</span>
          </div>
        )}

        {seedErrorMsg && (
          <div className="mt-6 p-4 bg-rose-950/80 border border-rose-700/60 rounded-xl text-sm text-rose-200 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{seedErrorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
