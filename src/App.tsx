import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GISMapView } from './components/GISMapView';
import { LocationInspectorModal } from './components/LocationInspectorModal';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { PublicPortal } from './components/PublicPortal';
import { FieldOfficerPWA } from './components/FieldOfficerPWA';
import { RoadMonitoringView } from './components/RoadMonitoringView';
import { SensorTelemetryView } from './components/SensorTelemetryView';
import { ModelManagementView } from './components/ModelManagementView';
import { SystemArchitectureView } from './components/SystemArchitectureView';
import { AdminAuditView } from './components/AdminAuditView';
import { SupabaseBaaSView } from './components/SupabaseBaaSView';
import { IncidentReportModal } from './components/IncidentReportModal';
import { HackathonDemoTour } from './components/HackathonDemoTour';
import { HazardPipelineSimulatorModal } from './components/HazardPipelineSimulatorModal';
import { DisasterDecisionEcosystemView } from './components/DisasterDecisionEcosystemView';
import { IMDWeatherRadarView } from './components/IMDWeatherRadarView';
import { AuthModal } from './components/AuthModal';
import {
  AuthorityNotificationToast,
  NotificationToastData,
} from './components/AuthorityNotificationToast';
import {
  fetchLocationsAPI,
  fetchSensorsAPI,
  fetchIncidentsAPI,
  fetchAlertsAPI,
  fetchRoadsAPI,
  fetchAuditLogsAPI,
} from './services/supabaseClient';

import {
  LocationData,
  SensorData,
  RoadStatus,
  IncidentReport,
  DisasterAlert,
  EmergencyPriorityItem,
  UserRole,
  LanguageCode,
  ThemeMode,
  AuditLogItem,
  UserAccount,
} from './types';

import {
  initialLocations,
  initialSensors,
  initialRoads,
  initialIncidents,
  initialAlerts,
  initialAuditLogs,
  initialMLModelStats,
  initialUsers,
} from './data/nerData';

import {
  simulateRainfallSurge,
  deriveEmergencyPriorities,
  calculateLandslideRisk,
} from './services/riskEngine';

export function App() {
  // Master State
  const [locations, setLocations] = useState<LocationData[]>(initialLocations);
  const [sensors, setSensors] = useState<SensorData[]>(initialSensors);
  const [roads, setRoads] = useState<RoadStatus[]>(initialRoads);
  const [incidents, setIncidents] = useState<IncidentReport[]>(initialIncidents);
  const [alerts, setAlerts] = useState<DisasterAlert[]>(initialAlerts);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [priorities, setPriorities] = useState<EmergencyPriorityItem[]>(() =>
    deriveEmergencyPriorities(initialLocations)
  );

  // Notifications & Offline Sync Queue
  const [notifications, setNotifications] = useState<NotificationToastData[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ner_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI Navigation & Filters
  const [activeTab, setActiveTab] = useState<string>('public_portal');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('super_admin');
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  // User Account Session State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('ner_landslide_user');
      return saved ? JSON.parse(saved) : initialUsers[0];
    } catch {
      return initialUsers[0];
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('ner_landslide_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  // Synchronize theme with DOM document and root classes
  useEffect(() => {
    try {
      localStorage.setItem('ner_landslide_theme', theme);
    } catch {}
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    }
  }, [theme]);

  // Modals & Tour
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showDemoTour, setShowDemoTour] = useState<boolean>(false);
  const [showPipelineSimulator, setShowPipelineSimulator] = useState<boolean>(false);

  // Load live data from Backend / Supabase
  const loadAllData = async () => {
    try {
      const [locs, sens, incs, alrts, rds, logs] = await Promise.allSettled([
        fetchLocationsAPI(),
        fetchSensorsAPI(),
        fetchIncidentsAPI(),
        fetchAlertsAPI(),
        fetchRoadsAPI(),
        fetchAuditLogsAPI(),
      ]);

      if (locs.status === 'fulfilled' && locs.value.length > 0) setLocations(locs.value);
      if (sens.status === 'fulfilled' && sens.value.length > 0) setSensors(sens.value);
      if (incs.status === 'fulfilled' && incs.value.length > 0) setIncidents(incs.value);
      if (alrts.status === 'fulfilled' && alrts.value.length > 0) setAlerts(alrts.value);
      if (rds.status === 'fulfilled' && rds.value.length > 0) setRoads(rds.value);
      if (logs.status === 'fulfilled' && logs.value.length > 0) setAuditLogs(logs.value);
    } catch (e) {
      console.warn('Initial data load from backend skipped, using local cache:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update priorities whenever locations change
  useEffect(() => {
    setPriorities(deriveEmergencyPriorities(locations));
  }, [locations]);

  // Handlers
  const handleSelectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
  };

  const handleSimulateSurge = (locId: string, additionalRainMm: number) => {
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === locId) {
          const updated = simulateRainfallSurge(loc, additionalRainMm);
          if (selectedLocation?.id === locId) {
            setSelectedLocation(updated);
          }
          return updated;
        }
        return loc;
      })
    );

    // Add Audit Log
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorName: 'Simulation Sandbox Engine',
        actorRole: 'System Operator',
        action: 'WEATHER_SURGE_INJECTED',
        targetEntity: `Location ID: ${locId}`,
        details: `Injected +${additionalRainMm}mm rainfall surge. XGBoost recalculated risk score and failure probability.`,
        ipAddress: '127.0.0.1 (Sandbox Runtime)',
      },
      ...prev,
    ]);
  };

  const handleSimulateSurgeAll = (additionalRainMm: number) => {
    setLocations((prev) =>
      prev.map((loc) => simulateRainfallSurge(loc, additionalRainMm))
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorName: 'Regional Weather Simulator',
        actorRole: 'System Operator',
        action: 'REGIONAL_MONSOON_SURGE',
        targetEntity: 'All 8 North Eastern States',
        details: `Simulated +${additionalRainMm}mm torrential monsoon spike across entire NER monitoring grid.`,
        ipAddress: '127.0.0.1 (Sandbox Runtime)',
      },
      ...prev,
    ]);
  };

  const handleCreateAlert = (alertData: Partial<DisasterAlert>) => {
    const newAlert: DisasterAlert = {
      id: `alert-ner-${Date.now()}`,
      alertCode: `RED-HAZ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
      issuedAt: new Date().toISOString(),
      expiresAt: alertData.expiresAt || new Date(Date.now() + 86400000).toISOString(),
      status: 'ACTIVE',
      title: alertData.title || 'Emergency Landslide Warning',
      message: alertData.message || 'Severe hazard conditions reported.',
      riskLevel: alertData.riskLevel || 'CRITICAL',
      state: alertData.state || 'Assam',
      district: alertData.district || 'Dima Hasao',
      locationName: alertData.locationName || 'High Risk Sector',
      affectedPopulation: alertData.affectedPopulation || 10000,
      triggeredBy: alertData.triggeredBy || 'Manual Emergency Broadcast',
      channels: alertData.channels || ['CAP India Protocol', 'SMS Broadcast', 'Mobile App'],
    };

    setAlerts((prev) => [newAlert, ...prev]);

    // Async sync to server & Supabase
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAlert),
    }).catch((err) => console.warn('Alert persist err:', err));

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorName: 'Disaster Authority Commander',
        actorRole: 'State Authority',
        action: 'CAP_ALERT_BROADCAST',
        targetEntity: newAlert.alertCode,
        details: `Transmitted emergency advisory: "${newAlert.title}" across SMS, radio, and mobile grid.`,
        ipAddress: '103.24.120.14',
      },
      ...prev,
    ]);
  };

  const handleUpdateRoadStatus = (roadId: string, updatedFields: Partial<RoadStatus>) => {
    setRoads((prev) =>
      prev.map((r) => {
        if (r.id === roadId) {
          return {
            ...r,
            ...updatedFields,
            lastUpdated: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    // Async sync to server & Supabase
    fetch(`/api/roads/${roadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    }).catch((err) => console.warn('Road persist err:', err));

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorName: 'PWD Highway Engineer',
        actorRole: 'Road/PWD Officer',
        action: 'ROAD_STATUS_UPDATE',
        targetEntity: roadId,
        details: `Road condition altered to: ${updatedFields.status || 'Updated'}.`,
        ipAddress: '117.201.88.92',
      },
      ...prev,
    ]);
  };

  const pushNotification = (toastData: Omit<NotificationToastData, 'id' | 'timestamp'>) => {
    const newToast: NotificationToastData = {
      id: `toast-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...toastData,
    };
    setNotifications((prev) => [newToast, ...prev.slice(0, 4)]);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Pipeline Simulator Handler: Applies end-to-end simulation across entire system
  const handleApplyPipelineResult = (
    locationId: string,
    updatedLocation: LocationData,
    generatedAlert?: DisasterAlert,
    affectedRoad?: RoadStatus
  ) => {
    // 1. Update target location
    setLocations((prev) =>
      prev.map((loc) => (loc.id === locationId ? updatedLocation : loc))
    );
    if (selectedLocation?.id === locationId) {
      setSelectedLocation(updatedLocation);
    }

    // 2. If alert generated, broadcast CAP Alert
    if (generatedAlert) {
      setAlerts((prev) => [generatedAlert, ...prev]);
      fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedAlert),
      }).catch((err) => console.warn('Alert persist err:', err));
    }

    // 3. If road affected, update road status
    if (affectedRoad) {
      setRoads((prev) =>
        prev.map((r) => (r.id === affectedRoad.id ? affectedRoad : r))
      );
      fetch(`/api/roads/${affectedRoad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(affectedRoad),
      }).catch((err) => console.warn('Road persist err:', err));
    }

    // 4. Log full pipeline execution in Audit Trail
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorName: 'AI Geotechnical Pipeline Engine',
        actorRole: 'System Operator',
        action: 'PIPELINE_SIMULATION_EXECUTED',
        targetEntity: `${updatedLocation.name} (${updatedLocation.district})`,
        details: `Telemetry Ingestion (Rain: ${updatedLocation.rainfall24h}mm, Moisture: ${updatedLocation.soilMoisturePercent}%) → XGBoost Inferred Risk Score: ${updatedLocation.riskScore}% (${updatedLocation.riskLevel}) → CAP Alert Broadcasted → GIS Hazard Contour Updated.`,
        ipAddress: '127.0.0.1 (Pipeline Core)',
      },
      ...prev,
    ]);

    // 5. Trigger live notification for Authority
    pushNotification({
      title: generatedAlert ? generatedAlert.title : `Risk Recalculated: ${updatedLocation.name}`,
      message: `XGBoost Risk Score updated to ${updatedLocation.riskScore}% [${updatedLocation.riskLevel}]. ${updatedLocation.recommendedAction}`,
      level: updatedLocation.riskScore >= 76 ? 'CRITICAL' : updatedLocation.riskScore >= 50 ? 'HIGH' : 'INFO',
      locationName: `${updatedLocation.name}, ${updatedLocation.district}`,
      district: updatedLocation.district,
      actionTab: 'gis_map',
    });
  };

  const handleUpdateSensorReading = (sensorCode: string, value: number, unit: string) => {
    let matchedLocId = '';
    let updatedSensorType = '';

    setSensors((prev) =>
      prev.map((s) => {
        if (s.sensorCode === sensorCode) {
          matchedLocId = s.locationId || (s.sensorCode.includes('DH') ? 'loc-assam-dima-hasao' : s.sensorCode.includes('SK') ? 'loc-sikkim-north-mangan' : s.sensorCode.includes('MG') ? 'loc-meghalaya-east-khasi-sohra' : 'loc-assam-dima-hasao');
          updatedSensorType = s.sensorType;
          const timestamp = new Date().toISOString();
          const newHistory = [
            ...s.telemetryHistory,
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              value,
              threshold: s.telemetryHistory[0]?.threshold || 100,
            },
          ];
          if (newHistory.length > 10) newHistory.shift();

          const isCrit = value > (s.telemetryHistory[0]?.threshold || 100);
          return {
            ...s,
            status: isCrit ? 'CRITICAL' : 'ONLINE',
            lastReading: { value, unit, timestamp },
            telemetryHistory: newHistory,
          };
        }
        return s;
      })
    );

    // Sync sensor reading to backend / Supabase
    fetch('/api/sensors/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sensorCode, value, unit }),
    }).catch((err) => console.warn('Sensor persist err:', err));

    // RECALCULATE LOCATION RISK IN REAL TIME BASED ON SENSOR READING
    if (matchedLocId) {
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id === matchedLocId) {
            let newRain = loc.rainfall24h;
            let newMoisture = loc.soilMoisturePercent;
            let newCreep = loc.groundMovementMmDay;

            if (unit.toLowerCase().includes('mm') && (updatedSensorType.includes('Rain') || sensorCode.includes('RG'))) {
              newRain = value;
            } else if (unit === '%' || updatedSensorType.includes('Moisture') || updatedSensorType.includes('Piezometer')) {
              newMoisture = Math.min(98, Math.max(20, value));
            } else if (updatedSensorType.includes('InSAR') || updatedSensorType.includes('Inclinometer') || updatedSensorType.includes('Radar')) {
              newCreep = value;
            }

            const newPred = calculateLandslideRisk({
              rainfall24h: newRain,
              rainfall72h: newRain * 1.6,
              soilMoisturePercent: newMoisture,
              slopeDeg: loc.slopeDeg,
              elevationM: loc.elevationM,
              groundMovementMmDay: newCreep,
              historicalLandslidesCount: loc.historicalLandslidesCount,
              distanceToRoadM: loc.distanceToRoadM,
              vegetationNDVI: loc.vegetationNDVI,
              geology: loc.geology,
            });

            const updated: LocationData = {
              ...loc,
              rainfall24h: newRain,
              rainfall72h: Number((newRain * 1.6).toFixed(1)),
              soilMoisturePercent: newMoisture,
              groundMovementMmDay: newCreep,
              riskScore: newPred.riskScore,
              riskProbability: newPred.riskProbability,
              riskLevel: newPred.riskLevel,
              aiExplanation: newPred.aiExplanation,
              recommendedAction: newPred.recommendedAction,
              lastUpdated: new Date().toISOString(),
            };

            // If crossed into CRITICAL (>=76), trigger instant alert & authority notification
            if (newPred.riskScore >= 76 && loc.riskScore < 76) {
              const autoAlert: DisasterAlert = {
                id: `alert-auto-${Date.now()}`,
                alertCode: `CAP-AUTORED-${loc.district.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                title: `AUTOMATED CRITICAL ALERT: Sensor Surge detected at ${loc.name}`,
                message: `Telemetry node ${sensorCode} reported critical spike (${value} ${unit}). AI Risk Engine computed ${newPred.riskScore}% failure probability.`,
                riskLevel: 'CRITICAL',
                state: loc.state,
                district: loc.district,
                locationName: loc.name,
                issuedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 86400000).toISOString(),
                status: 'ACTIVE',
                channels: ['CAP India Broadcast', 'SMS Broadcast', 'Mobile App'],
                affectedPopulation: loc.populationAtRisk,
                triggeredBy: `IoT Telemetry Station (${sensorCode})`,
              };

              setAlerts((a) => [autoAlert, ...a]);
              fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(autoAlert),
              }).catch((e) => console.warn('Alert post err:', e));

              pushNotification({
                title: `🚨 CRITICAL ALERT TRIGGERED: ${loc.name}`,
                message: `Sensor ${sensorCode} breached threshold (${value} ${unit}). Risk score escalated to ${newPred.riskScore}%!`,
                level: 'CRITICAL',
                locationName: `${loc.name}, ${loc.district}`,
                district: loc.district,
                actionTab: 'gis_map',
              });
            }

            return updated;
          }
          return loc;
        })
      );
    }
  };

  const handleSubmitIncidentReport = (
    reportData: Partial<IncidentReport>,
    affectedRoadId?: string,
    roadStatus?: string
  ) => {
    const newReport: IncidentReport = {
      id: `inc-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      status: 'Pending Verification',
      title: reportData.title || 'Field Incident Report',
      hazardType: reportData.hazardType || 'Landslide',
      severity: reportData.severity || 'High',
      description: reportData.description || 'Hazard condition observed.',
      state: reportData.state || 'Assam',
      district: reportData.district || 'Dima Hasao',
      locationName: reportData.locationName || 'High Risk Sector',
      lat: reportData.lat || 25.1764,
      lng: reportData.lng || 93.0238,
      reportedBy: reportData.reportedBy || 'Field Reporter',
      reporterPhone: reportData.reporterPhone,
      reporterRole: reportData.reporterRole || 'Citizen',
      photoUrl: reportData.photoUrl,
      aiAssessment: reportData.aiAssessment,
    };

    if (isOnline) {
      // Direct Online submission
      setIncidents((prev) => [newReport, ...prev]);

      fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      }).catch((err) => console.warn('Incident persist err:', err));

      // If highway affected, update matching road lifeline
      if (affectedRoadId && roadStatus) {
        handleUpdateRoadStatus(affectedRoadId, {
          status: roadStatus as any,
          clearanceETA: roadStatus === 'FULLY_BLOCKED' ? '14-20 Hours' : '4-6 Hours',
          alternateRouteDescription: `Traffic restricted due to verified incident at ${newReport.locationName}. Follow bypass signage.`,
        });
      }

      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorName: newReport.reportedBy,
          actorRole: newReport.reporterRole,
          action: 'INCIDENT_REPORTED',
          targetEntity: `${newReport.hazardType} at ${newReport.locationName}`,
          details: `${newReport.description} ${affectedRoadId ? `[Updated Road: ${affectedRoadId} to ${roadStatus}]` : ''}`,
          ipAddress: '103.45.90.11',
        },
        ...prev,
      ]);

      pushNotification({
        title: `Incident Logged: ${newReport.title}`,
        message: `${newReport.reportedBy} reported ${newReport.hazardType} in ${newReport.district}. ${affectedRoadId ? `Road status updated to ${roadStatus}.` : ''}`,
        level: newReport.severity === 'Critical' ? 'CRITICAL' : 'HIGH',
        locationName: newReport.locationName,
        district: newReport.district,
        actionTab: affectedRoadId ? 'roads' : 'gis_map',
      });
    } else {
      // Offline mode: Queue locally
      const queueItem = {
        id: `offline-${Date.now()}`,
        type: 'INCIDENT_REPORT',
        data: newReport,
        affectedRoadId,
        roadStatus,
        timestamp: new Date().toISOString(),
      };
      const updatedQueue = [...offlineQueue, queueItem];
      setOfflineQueue(updatedQueue);
      try {
        localStorage.setItem('ner_offline_queue', JSON.stringify(updatedQueue));
      } catch (e) {
        console.warn('LocalStorage save err:', e);
      }

      // Also add to local memory list so user sees it in app
      setIncidents((prev) => [newReport, ...prev]);

      pushNotification({
        title: '📦 Incident Saved to Offline Queue',
        message: 'Report stored in local storage cache. Will synchronize with Supabase automatically when back online.',
        level: 'INFO',
        actionTab: 'field_pwa',
      });
    }
  };

  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    try {
      for (const item of offlineQueue) {
        if (item.type === 'INCIDENT_REPORT') {
          await fetch('/api/incidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data),
          });
        }
      }

      setOfflineQueue([]);
      localStorage.removeItem('ner_offline_queue');

      pushNotification({
        title: '✅ Offline Queue Synchronized',
        message: `Successfully flushed and synchronized offline reports with cloud backend & Supabase.`,
        level: 'INFO',
      });
    } catch (e) {
      console.warn('Sync queue error:', e);
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    if (user.preferredLanguage) {
      setCurrentLang(user.preferredLanguage);
    }
    setIsAuthModalOpen(false);
    pushNotification({
      title: `Welcome, ${user.name}`,
      message: `Signed in as ${user.agency} (${user.role}). Synchronized with backend user registry.`,
      level: 'INFO',
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ner_landslide_user');
    setActiveRole('citizen');
    setIsAuthModalOpen(false);
    pushNotification({
      title: 'Signed Out',
      message: 'User session terminated. Switched to Citizen mode.',
      level: 'INFO',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-['Plus_Jakarta_Sans'] selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      {/* Left Vertical Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedRisk={selectedRisk}
        setSelectedRisk={setSelectedRisk}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        theme={theme}
        setTheme={setTheme}
        onOpenReportModal={() => setShowReportModal(true)}
        onStartDemoTour={() => setShowDemoTour(true)}
        onOpenPipelineSimulator={() => setShowPipelineSimulator(true)}
        offlineQueueCount={offlineQueue.length}
        onSyncOfflineQueue={handleSyncOfflineQueue}
        criticalAlertCount={alerts.filter((a) => a.riskLevel === 'CRITICAL').length}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Authority Notification Toasts */}
      <AuthorityNotificationToast
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Main Tab Content Viewport */}
      <main className="flex-1 min-w-0 h-[calc(100vh-60px)] md:h-screen overflow-y-auto bg-slate-950">
        {activeTab === 'public_portal' && (
          <PublicPortal
            alerts={alerts}
            locations={locations}
            onOpenReportModal={() => setShowReportModal(true)}
            onSelectLocation={(loc) => {
              setSelectedLocation(loc);
              setActiveTab('gis_map');
            }}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'ecosystem' && (
          <DisasterDecisionEcosystemView
            locations={locations}
            sensors={sensors}
            roads={roads}
            alerts={alerts}
            priorities={priorities}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectLocation={(loc) => {
              setSelectedLocation(loc);
              setActiveTab('gis_map');
            }}
            onOpenSimulateModal={() => setShowPipelineSimulator(true)}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'gis_map' && (
          <GISMapView
            locations={locations}
            sensors={sensors}
            roads={roads}
            incidents={incidents}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedRisk={selectedRisk}
            setSelectedRisk={setSelectedRisk}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentLang={currentLang}
            theme={theme}
            onSimulateSurge={handleSimulateSurge}
          />
        )}

        {activeTab === 'authority_dashboard' && (
          <AuthorityDashboard
            locations={locations}
            alerts={alerts}
            priorities={priorities}
            sensors={sensors}
            roads={roads}
            onSelectLocation={(loc) => {
              setSelectedLocation(loc);
              setActiveTab('gis_map');
            }}
            onCreateAlert={handleCreateAlert}
            onSimulateSurgeAll={handleSimulateSurgeAll}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'imd_radar' && (
          <IMDWeatherRadarView
            currentLang={currentLang}
            onSimulateSurgeFromRadar={(locId, surgeMm) => {
              handleSimulateSurge(locId, surgeMm);
              setActiveTab('gis_map');
            }}
          />
        )}

        {activeTab === 'field_pwa' && (
          <FieldOfficerPWA
            isOnline={isOnline}
            setIsOnline={setIsOnline}
            onSubmitReport={handleSubmitIncidentReport}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'roads' && (
          <RoadMonitoringView
            roads={roads}
            onUpdateRoadStatus={handleUpdateRoadStatus}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'sensors' && (
          <SensorTelemetryView
            sensors={sensors}
            onUpdateSensorReading={handleUpdateSensorReading}
            onOpenPipelineSimulator={() => setShowPipelineSimulator(true)}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'models' && (
          <ModelManagementView
            modelStats={initialMLModelStats}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'architecture' && (
          <SystemArchitectureView currentLang={currentLang} />
        )}

        {activeTab === 'admin_audit' && (
          <AdminAuditView
            auditLogs={auditLogs}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'supabase_baas' && (
          <SupabaseBaaSView
            currentLang={currentLang}
            onRefreshAllData={loadAllData}
          />
        )}
      </main>

      {/* End-to-End Operational Hazard Pipeline Simulator Modal */}
      {showPipelineSimulator && (
        <HazardPipelineSimulatorModal
          locations={locations}
          roads={roads}
          onClose={() => setShowPipelineSimulator(false)}
          onApplyPipelineResult={handleApplyPipelineResult}
          onNavigateTab={(tab) => {
            setShowPipelineSimulator(false);
            setActiveTab(tab);
          }}
          currentLang={currentLang}
        />
      )}

      {/* Location Inspector Slide-Over / Modal */}
      {selectedLocation && (
        <LocationInspectorModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onSimulateSurge={handleSimulateSurge}
          currentLang={currentLang}
        />
      )}

      {/* Citizen / Field Incident Report Modal */}
      {showReportModal && (
        <IncidentReportModal
          onClose={() => setShowReportModal(false)}
          onSubmitReport={handleSubmitIncidentReport}
          currentLang={currentLang}
        />
      )}

      {/* 15-Step Evaluator Tour */}
      {showDemoTour && (
        <HackathonDemoTour
          onClose={() => setShowDemoTour(false)}
          setActiveTab={setActiveTab}
          setCurrentLang={setCurrentLang}
          onSelectSampleLocation={() => {
            const haflong = locations.find((l) => l.id.includes('dima-hasao'));
            if (haflong) setSelectedLocation(haflong);
          }}
          onSimulateSurgeDemo={() => {
            const haflong = locations.find((l) => l.id.includes('dima-hasao'));
            if (haflong) {
              setSelectedLocation(haflong);
              handleSimulateSurge(haflong.id, 85);
            }
          }}
        />
      )}

      {/* User Login / Register Modal */}
      {isAuthModalOpen && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          currentLang={currentLang}
        />
      )}
    </div>
  );
}

export default App;
