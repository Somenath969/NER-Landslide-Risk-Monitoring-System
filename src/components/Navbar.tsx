import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Radio,
  FileText,
  Truck,
  Activity,
  Cpu,
  Workflow,
  Sparkles,
  Wifi,
  WifiOff,
  Languages,
  UserCheck,
  AlertTriangle,
  Flame,
  Layers,
  PhoneCall,
  Database,
  Zap,
  RotateCw,
  Menu,
  X,
  Compass,
  BarChart3,
  CloudRain,
  Route,
  Sun,
  Moon,
  Satellite,
} from 'lucide-react';
import { NERState, RiskLevel, UserRole, LanguageCode, ThemeMode, UserAccount } from '../types';
import { translations } from '../locales/translations';
import { DisasterManagementLogo } from './DisasterManagementLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedRisk: string;
  setSelectedRisk: (risk: string) => void;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  onOpenReportModal: () => void;
  onStartDemoTour: () => void;
  onOpenPipelineSimulator?: () => void;
  offlineQueueCount?: number;
  onSyncOfflineQueue?: () => void;
  criticalAlertCount: number;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  setIsOnline,
  activeRole,
  setActiveRole,
  currentLang,
  setCurrentLang,
  theme,
  setTheme,
  onOpenReportModal,
  onStartDemoTour,
  onOpenPipelineSimulator,
  offlineQueueCount = 0,
  onSyncOfflineQueue,
  criticalAlertCount,
  currentUser,
  onOpenAuthModal,
}) => {
  const t = translations[currentLang] || translations.en;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin (NDMA)',
    state_authority: 'State Authority (ASDMA)',
    district_authority: 'District Magistrate',
    dm_officer: 'NDRF / DM Commander',
    field_officer: 'Field Geotechnical Officer',
    police_pwd: 'PWD Highway Engineer',
    citizen: 'Citizen / Community Volunteer',
  };

  const navItems = [
    {
      group: 'Dashboards & GIS Hub',
      items: [
        { id: 'authority_dashboard', label: t.authorityDashboard, icon: Activity, badge: 'Unified' },
        { id: 'imd_radar', label: 'IMD Radar & OGD Met', icon: Satellite, badge: 'OGD Live', isGreen: true },
        { id: 'ecosystem', label: t.decisionEcosystem, icon: Workflow, badge: 'AI Eco' },
        { id: 'public_portal', label: t.publicPortal, icon: ShieldAlert },
        { id: 'gis_map', label: t.gisMap, icon: MapPin, hint: 'Location Finder' },
        { id: 'roads', label: t.roads, icon: Truck },
        { id: 'sensors', label: t.sensors, icon: Layers },
      ],
    },
    {
      group: 'Field & System Operations',
      items: [
        { id: 'field_pwa', label: t.fieldPWA, icon: Radio, badge: 'Offline PWA' },
        { id: 'models', label: t.modelLab, icon: Cpu },
        { id: 'architecture', label: t.systemArchitecture, icon: Workflow },
        { id: 'admin_audit', label: t.adminAudit, icon: FileText },
        { id: 'supabase_baas', label: t.supabaseBaaS, icon: Database, isGreen: true },
      ],
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 select-none overflow-y-auto scrollbar-thin">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/20 shrink-0">
            <DisasterManagementLogo size={32} />
          </div>
          <div>
            <span className="font-black text-base tracking-tight bg-gradient-to-r from-amber-300 via-orange-200 to-rose-300 bg-clip-text text-transparent font-['Outfit'] block leading-tight">
              NER LandslideWatch
            </span>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">
              Disaster Management Grid
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Emergency Hotline Banner & Alert Counters */}
      <div className="px-3.5 py-2.5 bg-red-950/40 border-b border-red-900/30 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center font-bold text-red-400 animate-pulse text-[11px]">
            <Flame className="w-3.5 h-3.5 mr-1" />
            {t.activeAlertsCount}: {criticalAlertCount}
          </span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold rounded">
            {t.demoDataBadge}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center text-slate-300 font-semibold">
            <PhoneCall className="w-3 h-3 mr-1 text-emerald-400" />
            1070 / 112
          </span>
          <span className="text-slate-500">NDRF: 0361-2849005</span>
        </div>
      </div>

      {/* Quick Actions (Report, Pipeline, Tour) */}
      <div className="p-3 border-b border-slate-800/80 space-y-1.5">
        <button
          onClick={onOpenReportModal}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>{t.reportIncident}</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          {onOpenPipelineSimulator && (
            <button
              onClick={onOpenPipelineSimulator}
              className="bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center space-x-1 shadow-sm transition-all"
              title="Hazard Simulator"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Simulator</span>
            </button>
          )}
          <button
            onClick={onStartDemoTour}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center space-x-1 shadow-sm transition-all"
            title="System Overview"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>{t.demoTour}</span>
          </button>
        </div>
      </div>

      {/* Vertical Navigation Links */}
      <div className="flex-1 py-3 px-2.5 space-y-4">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {group.group}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : item.isGreen
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : item.isGreen ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Account / Authentication Bar */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-950/70">
        {currentUser ? (
          <button
            onClick={onOpenAuthModal}
            className="w-full p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/50 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-amber-300 transition-colors">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {currentUser.agency}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800 shrink-0">
              Profile
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Sign In / Register Account</span>
          </button>
        )}
      </div>

      {/* Role & Language Controls */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2 text-xs">
        {/* Language Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <Languages className="w-3 h-3 mr-1 text-slate-400" />
            {t.languageSelect}
          </label>
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value as LanguageCode)}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="as">অসমীয়া (Assamese)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="lus">Mizo (Duhlian)</option>
            <option value="mni">মৈতৈলোন্ (Manipuri)</option>
          </select>
        </div>

        {/* Role Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <UserCheck className="w-3 h-3 mr-1 text-slate-400" />
            {t.switchRole}
          </label>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium truncate"
          >
            {Object.entries(roleLabels).map(([roleKey, label]) => (
              <option key={roleKey} value={roleKey}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Mode Toggle (Light / Dark) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center">
              {theme === 'dark' ? (
                <Moon className="w-3 h-3 mr-1 text-indigo-400" />
              ) : (
                <Sun className="w-3 h-3 mr-1 text-amber-500" />
              )}
              {t.themeMode}
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              {theme === 'dark' ? t.darkMode : t.lightMode}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-800/90 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md text-[11px] font-bold transition-all ${
                theme === 'light'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title="Switch to Light Mode"
            >
              <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md text-[11px] font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
              title="Switch to Dark Mode"
            >
              <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-white' : 'text-indigo-400'}`} />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Offline Queue Sync (if items queued) */}
        {offlineQueueCount > 0 && (
          <button
            onClick={onSyncOfflineQueue}
            className="w-full flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/60 hover:bg-amber-900 transition-all animate-pulse"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Sync {offlineQueueCount} Queued</span>
          </button>
        )}

        {/* Online / Offline Network Simulator Switch */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            isOnline
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
              : 'bg-rose-950/80 text-rose-300 border-rose-700/60 hover:bg-rose-900 animate-pulse'
          }`}
          title="Toggle online / offline network simulation"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.online}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.offline}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Vertical Sidebar (Persistent Left Side) */}
      <aside className="hidden md:block w-64 lg:w-72 h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Top Header with Hamburger Toggle */}
      <header className="md:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-slate-100 shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center">
            <DisasterManagementLogo size={24} />
          </div>
          <div>
            <span className="font-extrabold text-sm text-amber-300 font-['Outfit'] leading-none">
              NER LandslideWatch
            </span>
            <span className="block text-[9px] text-slate-400 font-medium leading-none mt-0.5">
              Disaster Management Grid
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* User Account / Login Button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-blue-300 hover:text-blue-200 transition-colors"
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign In / Register'}
              aria-label="User Account"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
            </button>
          )}

          {/* Quick Theme toggle on mobile header */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-amber-300 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light and Dark Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          <button
            onClick={onOpenReportModal}
            className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
          >
            Report
          </button>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
