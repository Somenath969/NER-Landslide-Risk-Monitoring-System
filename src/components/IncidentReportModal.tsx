import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Camera,
  MapPin,
  Sparkles,
  Send,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { IncidentReport, HazardType, SeverityLevel, LanguageCode } from '../types';
import { translations } from '../locales/translations';

interface IncidentReportModalProps {
  onClose: () => void;
  onSubmitReport: (reportData: Partial<IncidentReport>, affectedRoadId?: string, roadStatus?: string) => void;
  isOnline?: boolean;
  currentLang: LanguageCode;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  onClose,
  onSubmitReport,
  isOnline = true,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;

  const [title, setTitle] = useState('');
  const [hazardType, setHazardType] = useState<HazardType>('Landslide');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [locationName, setLocationName] = useState('Haflong-Jatinga Hill Cut KM 142');
  const [state, setState] = useState('Assam');
  const [district, setDistrict] = useState('Dima Hasao');
  const [affectedRoadId, setAffectedRoadId] = useState('road-nh-27');
  const [updateRoadDirectly, setUpdateRoadDirectly] = useState(true);
  const [description, setDescription] = useState('Severe debris slide completely blocking both highway lanes. Mudflow spreading across 60m width.');
  const [reporterName, setReporterName] = useState('Bipul Gogoi');
  const [reporterPhone, setReporterPhone] = useState('+91 94355 77610');
  const [lat, setLat] = useState('25.1764');
  const [lng, setLng] = useState('93.0238');
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<any>({
    detectedHazards: ['Mudslide Debris', 'Exposed Soil Scarp', 'Highway Obstruction'],
    confidenceScore: 0.94,
    suggestedSeverity: 'Critical',
    slopeAngleEstimate: 38,
    debrisVolumeEstimate: '1,800 - 2,200 m³',
    explanation: 'AI Vision analysis detects deep-seated planar slide cutting across asphalt corridor with continuous mudflow runoff.',
    humanVerificationRequired: true,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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
          description: description || 'Citizen reported slope hazard',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmitReport(
      {
        title: title || `${hazardType} reported at ${locationName || district}`,
        hazardType,
        severity,
        state,
        district,
        locationName: locationName || `${district} Slope Sector`,
        lat: parseFloat(lat) || 25.1764,
        lng: parseFloat(lng) || 93.0238,
        description,
        reportedBy: reporterName || 'Citizen Reporter',
        reporterPhone: reporterPhone || '+91 9XXXX XXXXX',
        reporterRole: 'Citizen',
        photoUrl: photoPreview || undefined,
        aiAssessment: aiAssessment || undefined,
      },
      updateRoadDirectly ? affectedRoadId : undefined,
      severity === 'Critical' ? 'FULLY_BLOCKED' : severity === 'High' ? 'PARTIALLY_BLOCKED' : 'CLEAR'
    );

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[750] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Report Landslide / Road Obstruction
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct alert to State Emergency Operations Centre (SEOC)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Incident Transmitted</h4>
            <p className="text-xs text-slate-300">
              Your field report has been logged and dispatched to the District Emergency Control Room.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Hazard Category</label>
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value as HazardType)}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Landslide">Landslide (Active Slide)</option>
                  <option value="Slope Crack">Slope Tension Crack</option>
                  <option value="Road Blockage">Highway Blockage</option>
                  <option value="Rockfall">Rockfall / Falling Debris</option>
                  <option value="Mudflow">Debris / Mud Flow</option>
                  <option value="Damaged Bridge">Damaged Bridge / Culvert</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700 font-bold focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Critical">Critical (Immediate Danger)</option>
                  <option value="High">High (Road Blocked)</option>
                  <option value="Medium">Medium (Partial Restriction)</option>
                  <option value="Low">Low (Minor Warning)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                >
                  <option value="Assam">Assam</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tripura">Tripura</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Dima Hasao"
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Specific Location / Landmark</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Haflong-Jatinga Hill Cut KM 142 near bypass"
                className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                required
              />
            </div>

            {/* Highway Corridor Blockage Linkage */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-amber-400 flex items-center space-x-1.5 text-xs">
                  <span>🛣️ Highway / Road Lifeline Impact</span>
                </label>
                <label className="flex items-center space-x-1 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateRoadDirectly}
                    onChange={(e) => setUpdateRoadDirectly(e.target.checked)}
                    className="rounded accent-amber-400"
                  />
                  <span>Sync Road Status</span>
                </label>
              </div>
              <select
                value={affectedRoadId}
                onChange={(e) => setAffectedRoadId(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700"
              >
                <option value="road-nh-27">NH-27 (Silchar - Haflong - Lumding Corridor)</option>
                <option value="road-nh-10">NH-10 (Sevoke - Gangtok Lifeline)</option>
                <option value="road-nh-29">NH-29 (Dimapur - Kohima Highway)</option>
                <option value="road-sh-5">SH-5 (Shillong - Cherrapunji Route)</option>
              </select>
              <p className="text-[10px] text-slate-400">
                Submitting this incident will mark the selected lifeline as {severity === 'Critical' ? 'FULLY BLOCKED' : 'PARTIALLY BLOCKED'} and calculate detour routes.
              </p>
            </div>

            {!isOnline && (
              <div className="p-2.5 bg-amber-950/50 border border-amber-500/40 rounded-xl flex items-center space-x-2 text-[11px] text-amber-300">
                <span>📵 Offline Mode Active: Incident report will be securely queued in local storage and synced automatically once connection is restored.</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Incident Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the slide extent, road blockage, trapped vehicles or affected houses..."
                className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                required
              />
            </div>

            {/* Photo Capture with Gemini Vision Analysis */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-300">Upload Site Photo (AI Vision Scan)</label>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-slate-200 font-semibold flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>

                {isAnalyzing && (
                  <span className="text-amber-400 flex items-center space-x-1">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Image...</span>
                  </span>
                )}
              </div>

              {photoPreview && (
                <div className="p-3 bg-slate-850 rounded-xl border border-slate-700/80 grid grid-cols-3 gap-3 mt-2">
                  <img src={photoPreview} alt="Upload" className="w-full h-24 object-cover rounded-lg" />
                  <div className="col-span-2 space-y-1">
                    <span className="font-bold text-amber-400 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Hazard Detection
                    </span>
                    {aiAssessment ? (
                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        <p><strong>Hazards:</strong> {aiAssessment.detectedHazards.join(', ')}</p>
                        <p><strong>Debris:</strong> {aiAssessment.debrisVolumeEstimate}</p>
                        <p className="text-slate-400 italic">"{aiAssessment.explanation}"</p>
                      </div>
                    ) : (
                      <p className="text-slate-500">Scanning geotechnical features...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Citizen Name"
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 94350 XXXXX"
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Incident Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
