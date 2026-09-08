import React, { useState } from 'react';
import {
  Radio,
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Save,
  RotateCw,
  Send,
  Navigation,
} from 'lucide-react';
import { IncidentReport, HazardType, SeverityLevel, LanguageCode } from '../types';
import { translations } from '../locales/translations';

interface FieldOfficerPWAProps {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  onSubmitReport: (reportData: Partial<IncidentReport>) => void;
  currentLang: LanguageCode;
}

export const FieldOfficerPWA: React.FC<FieldOfficerPWAProps> = ({
  isOnline,
  setIsOnline,
  onSubmitReport,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;

  const [title, setTitle] = useState('');
  const [hazardType, setHazardType] = useState<HazardType>('Slope Crack');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('Assam');
  const [district, setDistrict] = useState('Dima Hasao');
  const [locationName, setLocationName] = useState('Haflong - Jatinga Sector KM 142');
  const [lat, setLat] = useState('25.1764');
  const [lng, setLng] = useState('93.0238');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<any>(null);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Mock Photo Capture
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      runVisionAnalysis(result);
    };
    reader.readAsDataURL(file);
  };

  const runVisionAnalysis = async (base64Img: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          description: description || 'Field survey photo of slope condition',
        }),
      });
      const data = await response.json();
      if (data.success && data.assessment) {
        setAiAssessment(data.assessment);
        if (data.assessment.suggestedSeverity) {
          setSeverity(data.assessment.suggestedSeverity);
        }
      }
    } catch (err) {
      console.warn('AI analysis fallback:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcquireGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
        },
        () => {
          // Default to Haflong hills if permission denied in sandbox
          setLat('25.1764');
          setLng('93.0238');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newReport: Partial<IncidentReport> = {
      title: title || `${hazardType} at ${locationName}`,
      hazardType,
      severity,
      description,
      state,
      district,
      locationName,
      lat: parseFloat(lat) || 25.1764,
      lng: parseFloat(lng) || 93.0238,
      reportedBy: 'Field Officer (SDRF / PWD Squad)',
      reporterRole: 'Field Officer',
      photoUrl: photoPreview || undefined,
      aiAssessment: aiAssessment || undefined,
    };

    if (!isOnline) {
      // Store in offline cache
      setOfflineQueue((prev) => [...prev, newReport]);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        resetForm();
      }, 300);
    } else {
      onSubmitReport(newReport);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        resetForm();
      }, 400);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPhotoPreview(null);
    setAiAssessment(null);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const handleSyncOfflineQueue = () => {
    offlineQueue.forEach((item) => {
      onSubmitReport(item);
    });
    setOfflineQueue([]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Mobile Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-['Outfit']">
              Field Officer Incident & Hazard Recon PWA
            </h2>
            <p className="text-xs text-slate-400">
              Offline-ready mobile field console for SDRF, PWD engineers, and district teams
            </p>
          </div>
        </div>

        {/* Sync & Connectivity status */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all border ${
              isOnline
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                : 'bg-rose-950 text-rose-300 border-rose-700/60 animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Offline ({offlineQueue.length} queued)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Offline Sync Banner (if queued) */}
      {offlineQueue.length > 0 && isOnline && (
        <div className="bg-amber-950/80 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-amber-300">
            <UploadCloud className="w-4 h-4 text-amber-400" />
            <span>
              <strong>{offlineQueue.length} Field Reports</strong> stored in offline cache. Ready to synchronize with Disaster Operations DB.
            </span>
          </div>
          <button
            onClick={handleSyncOfflineQueue}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
          >
            Sync Now
          </button>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Report recorded successfully {isOnline ? 'and transmitted to DEOC' : 'in offline device storage'}.
          </span>
        </div>
      )}

      {/* Field Incident Submission Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>New Field Geotechnical Recon Report</span>
        </h3>

        {/* Hazard Type & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Classification</label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value as HazardType)}
              className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-1 focus:ring-amber-400"
            >
              <option value="Landslide">Landslide (Mass Movement)</option>
              <option value="Slope Crack">Slope Tension Crack (Pre-failure)</option>
              <option value="Road Blockage">Road / Highway Blockage</option>
              <option value="Rockfall">Rockfall / Boulder Roll</option>
              <option value="Mudflow">Debris / Mud Flow</option>
              <option value="Damaged Bridge">Bridge / Culvert Structural Hazard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assessed Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
              className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-1 focus:ring-amber-400 font-bold"
            >
              <option value="Critical">Critical (Immediate Evacuation Required)</option>
              <option value="High">High (Major Threat / Highway Disrupted)</option>
              <option value="Medium">Medium (Developing Crack / Drainage Clog)</option>
              <option value="Low">Low (Minor Raveling / Superficial)</option>
            </select>
          </div>
        </div>

        {/* Location & GPS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">Geospatial Coordinates & Location</label>
            <button
              type="button"
              onClick={handleAcquireGPS}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <Navigation className="w-3 h-3" />
              <span>Acquire GPS Fix</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Landmark / KM Marker"
              className="bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
              required
            />
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
              className="bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
              required
            />
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude"
              className="bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Geomorphological Observations & Dimensions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Document crack aperture, scarp height, estimated debris volume, affected infrastructure, and immediate risk to traffic..."
            className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
            required
          />
        </div>

        {/* Photo Attachment & Live Vision AI Analysis */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Site Reconnaissance Photo Attachment
          </label>

          <div className="flex items-center space-x-3">
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-colors">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Capture / Upload Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            {isAnalyzing && (
              <span className="text-xs text-amber-400 flex items-center space-x-1.5">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Gemini AI Computer Vision...</span>
              </span>
            )}
          </div>

          {/* Photo Preview & AI Assessment Output */}
          {photoPreview && (
            <div className="mt-3 p-3 bg-slate-850 rounded-xl border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <img
                src={photoPreview}
                alt="Field Survey"
                className="w-full h-32 object-cover rounded-lg border border-slate-700"
              />

              <div className="sm:col-span-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    AI Vision Hazard Assessment
                  </span>
                  {aiAssessment && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Confidence: {(aiAssessment.confidenceScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {aiAssessment ? (
                  <div className="space-y-1 text-slate-300">
                    <p>
                      <strong>Detected Features:</strong> {aiAssessment.detectedHazards.join(', ')}
                    </p>
                    <p>
                      <strong>Estimated Volume:</strong> {aiAssessment.debrisVolumeEstimate} •{' '}
                      <strong>Slope:</strong> ~{aiAssessment.slopeAngleEstimate}°
                    </p>
                    <p className="text-slate-400 text-[11px] italic leading-tight">
                      "{aiAssessment.explanation}"
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs">Awaiting vision inference...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>
              {isOnline ? 'Transmit Field Incident Report' : 'Save Locally to Offline Queue'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
