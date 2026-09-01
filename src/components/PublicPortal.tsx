import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Search,
  MapPin,
  Flame,
  CheckCircle2,
  HelpCircle,
  Camera,
  Navigation,
  Info,
  ExternalLink,
} from 'lucide-react';
import { DisasterAlert, LocationData, LanguageCode } from '../types';
import { translations } from '../locales/translations';

interface PublicPortalProps {
  alerts: DisasterAlert[];
  locations: LocationData[];
  onOpenReportModal: () => void;
  onSelectLocation: (loc: LocationData) => void;
  currentLang: LanguageCode;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  alerts,
  locations,
  onOpenReportModal,
  onSelectLocation,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const [searchDistrict, setSearchDistrict] = useState('');

  // Active Critical/Orange Alerts
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  // Filtered district lookup
  const searchResults = searchDistrict
    ? locations.filter(
        (l) =>
          l.district.toLowerCase().includes(searchDistrict.toLowerCase()) ||
          l.name.toLowerCase().includes(searchDistrict.toLowerCase()) ||
          l.state.toLowerCase().includes(searchDistrict.toLowerCase())
      )
    : [];

  const stateHelplines = [
    { state: 'Assam', number: '1070 / 1079', agency: 'Assam State Disaster Management Authority' },
    { state: 'Sikkim', number: '1070 / 03592-202797', agency: 'Sikkim State Disaster Management' },
    { state: 'Meghalaya', number: '1070 / 0364-2502098', agency: 'Meghalaya State DM Authority' },
    { state: 'Nagaland', number: '1070 / 0370-2291122', agency: 'Nagaland State DM Authority' },
    { state: 'Manipur', number: '1070 / 0385-2443441', agency: 'Manipur Disaster Management' },
    { state: 'Mizoram', number: '1070 / 0389-2342520', agency: 'Disaster Management & Rehab Mizoram' },
    { state: 'Arunachal Pradesh', number: '1070 / 0360-2212373', agency: 'Department of DM Arunachal' },
    { state: 'Tripura', number: '1070 / 0381-2416045', agency: 'Tripura State Disaster Management' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Warning & Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <Flame className="w-3.5 h-3.5" />
            <span>Monsoon Landslide High Alert Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight font-['Outfit']">
            North Eastern Region Landslide Safety & Early Warning Portal
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time hazard warnings, safe mountain transit advisories, and citizen emergency reporting for the 8 North Eastern states of India.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Report Landslide or Slope Crack</span>
            </button>

            <a
              href="#district-lookup"
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Check My District Risk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Active Broadcast Advisories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-red-400" />
            <span>Active Disaster Warnings & Evacuation Advisories</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{activeAlerts.length} Official Bulletins</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-slate-900 border border-red-500/40 p-4 rounded-2xl shadow-lg space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="bg-red-500/20 text-red-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-red-500/30">
                  {alert.alertCode}
                </span>
                <span className="text-[11px] text-slate-400">
                  Issued: {new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 leading-snug">{alert.title}</h3>

              <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

              <div className="pt-1 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span>
                  📍 <strong>{alert.locationName}</strong> ({alert.state})
                </span>
                <span className="text-amber-400">
                  👥 ~{alert.affectedPopulation.toLocaleString()} citizens affected
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* District Safety Lookup Tool */}
      <div id="district-lookup" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>District Safety & Real-Time Hazard Lookup</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Type your district (e.g. Dima Hasao, Mangan, Kohima, Aizawl, East Khasi Hills) to view current hazard status.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchDistrict}
            onChange={(e) => setSearchDistrict(e.target.value)}
            placeholder="Search district, road, or town..."
            className="w-full bg-slate-800 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {searchResults.map((loc) => (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className="bg-slate-850 border border-slate-700/80 hover:border-amber-400/50 p-3.5 rounded-xl cursor-pointer transition-all space-y-1.5 shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {loc.name}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      loc.riskLevel === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : loc.riskLevel === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {loc.riskLevel} ({loc.riskScore}/100)
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  {loc.district}, {loc.state} • 24h Rain: {loc.rainfall24h}mm
                </p>

                <p className="text-xs text-slate-300 line-clamp-2 mt-1">{loc.aiExplanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citizen Landslide Action Guidelines */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <span>What to Do: Citizen Safety Directives</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Before */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
              1. Before (During Heavy Rains)
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              <li>Monitor official alerts via this portal or state disaster SMS.</li>
              <li>Inspect retaining walls and hill slopes for new cracks or bulges.</li>
              <li>Keep emergency go-bag ready (torch, dry rations, first-aid, medicines).</li>
              <li>Avoid night travel on mountain ghats and unpaved cuts.</li>
            </ul>
          </div>

          {/* During */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-red-300 uppercase tracking-wider text-[11px]">
              2. During a Slide Event
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              <li>If sudden rumbling or tree cracking is heard, move uphill/perpendicular immediately.</li>
              <li>Never cross an active debris flow or mudslide channel.</li>
              <li>Curl into a tight ball and protect your head if escape is impossible.</li>
              <li>Stay away from downed high-voltage power lines and swollen streams.</li>
            </ul>
          </div>

          {/* After */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
              3. After the Slide
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              <li>Stay clear of the slide scar; secondary failure is very common.</li>
              <li>Check for injured or trapped persons without entering danger zone.</li>
              <li>Report road blockages immediately using the Citizen Report tool.</li>
              <li>Tune in to local radio or official portal for shelter updates.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* State Emergency Helplines (8 NER States) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <span>24x7 State Emergency Operation Centres (SEOC)</span>
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">Toll-Free 1070 Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stateHelplines.map((item, idx) => (
            <div key={idx} className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-100">{item.state}</span>
              <p className="text-xs font-black text-emerald-400 font-mono">{item.number}</p>
              <p className="text-[10px] text-slate-400 truncate">{item.agency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
