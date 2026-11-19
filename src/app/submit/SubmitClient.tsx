'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ViceImage } from '@/components/vice/ViceImage';
import { useSearchParams } from 'next/navigation';
import { Stepper, StepItem } from '@/components/vice/Stepper';
import { VerificationStamp } from '@/components/vice/VerificationStamp';
import { 
  PlusCircle, 
  MapPin, 
  Clock, 
  CloudRain, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ArrowLeft,
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  Upload,
  Check,
  Compass
} from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';

const SAMPLE_PRESETS = [
  {
    label: 'Cessna Wreck / Underwater Reef',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Vintage Sports Car / Alley',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Neon Hotel / Art Deco Penthouse',
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Swamp Mangroves / Night Airboat',
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
  },
];

const STEPS: StepItem[] = [
  { number: 1, label: 'BASICS' },
  { number: 2, label: 'LOCATION' },
  { number: 3, label: 'EVIDENCE' },
  { number: 4, label: 'CONDITIONS' },
  { number: 5, label: 'REVIEW' },
];

const DRAFT_STORAGE_KEY = 'vicepulse_field_draft_v2';

export const SubmitClient: React.FC = () => {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('hidden-location');
  const [subcategory, setSubcategory] = useState('');
  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState('Vice Beach');
  const [inGameGrid, setInGameGrid] = useState('VB-12.4');
  const [customLat, setCustomLat] = useState<number | null>(null);
  const [customLng, setCustomLng] = useState<number | null>(null);
  const [gameX, setGameX] = useState<number | null>(null);
  const [gameY, setGameY] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [inGameTime, setInGameTime] = useState('02:00 - 04:30 AM');
  const [weather, setWeather] = useState('Heavy Fog / Overcast');
  const [requirements, setRequirements] = useState('Field GPS Tracker');
  const [stepsText, setStepsText] = useState('1. Navigate to target sector\n2. Scout perimeter for unlocked service door\n3. Inspect subterranean vault');
  const [evidenceUrl, setEvidenceUrl] = useState(SAMPLE_PRESETS[0].url);
  const [evidenceCaption, setEvidenceCaption] = useState('Field surveillance reconnaissance photograph');
  const [sourcePlatform, setSourcePlatform] = useState('reddit');
  const [sourceUrl, setSourceUrl] = useState('https://reddit.com/r/GTA6');
  const [sourceAuthor, setSourceAuthor] = useState('u/LeonidaScout');
  const [tags, setTags] = useState('Secret, Night, Vice City');

  const [loading, setLoading] = useState(false);
  const [submittedDossier, setSubmittedDossier] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore draft or URL params
  useEffect(() => {
    if (searchParams) {
      const qLat = searchParams.get('lat');
      const qLng = searchParams.get('lng');
      const qX = searchParams.get('x');
      const qY = searchParams.get('y');
      const qGrid = searchParams.get('grid');

      if (qGrid) setInGameGrid(qGrid);
      if (qLat && !isNaN(parseFloat(qLat))) setCustomLat(parseFloat(qLat));
      if (qLng && !isNaN(parseFloat(qLng))) setCustomLng(parseFloat(qLng));
      if (qX && !isNaN(parseFloat(qX))) setGameX(parseFloat(qX));
      if (qY && !isNaN(parseFloat(qY))) setGameY(parseFloat(qY));
    }

    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.locationName) setLocationName(parsed.locationName);
        if (parsed.district) setDistrict(parsed.district);
        if (parsed.description) setDescription(parsed.description);
        setDraftRestored(true);
      }
    } catch {
      // storage unavailable
    }
  }, [searchParams]);

  // Auto-save draft
  useEffect(() => {
    if (!title && !description) return;
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ title, category, subcategory, locationName, district, inGameGrid, description })
      );
    } catch {
      // ignore
    }
  }, [title, category, subcategory, locationName, district, inGameGrid, description]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setTitle('');
      setLocationName('');
      setDescription('');
      setDraftRestored(false);
    } catch {
      // ignore
    }
  };

  const handleNext = () => {
    setErrorMessage('');
    if (currentStep === 1 && (!title.trim() || !description.trim())) {
      setErrorMessage('Please provide a title and detailed description.');
      return;
    }
    if (currentStep === 2 && !locationName.trim()) {
      setErrorMessage('Please specify the landmark or site name.');
      return;
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const stepsArray = stepsText.split('\n').map((s) => s.trim()).filter(Boolean);
      const reqArray = requirements.split(',').map((r) => r.trim()).filter(Boolean);
      const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);

      const payload = {
        title,
        category,
        subcategory: subcategory || undefined,
        locationName,
        district,
        coordinates: {
          lat: customLat !== null ? customLat : 25.7617,
          lng: customLng !== null ? customLng : -80.1918,
          inGameGrid: inGameGrid || 'VC-01',
        },
        inGameCoordinates: (gameX !== null && gameY !== null) ? { x: gameX, y: gameY } : undefined,
        coordinateProvenance: (gameX !== null && gameY !== null) ? {
          system: 'gtadb_v6',
          originalCoords: [gameX, gameY],
          source: 'VicePulse Tactical Map Drop',
        } : undefined,
        description,
        stepsToFind: stepsArray.length ? stepsArray : ['Navigate to designated coordinates.'],
        inGameTime,
        weather,
        requirements: reqArray.length ? reqArray : ['None'],
        evidenceImages: [
          {
            url: evidenceUrl,
            caption: evidenceCaption,
            type: 'screenshot' as const,
          },
        ],
        source: {
          platform: sourcePlatform,
          url: sourceUrl,
          author: sourceAuthor,
          timestamp: new Date().toISOString(),
        },
        tags: tagsArray,
      };

      const res = await fetch('/api/discoveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        setSubmittedDossier(data);
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // ignore
        }
      } else {
        setErrorMessage(data.error || 'Failed to submit discovery dossier.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN WITH FLAT CONFETTI BURST IN BRAND COLORS
  if (submittedDossier) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 bg-ink text-cream font-body relative overflow-hidden">
        
        {/* Flat Confetti Burst (SVG Geometry in Brand Colors) */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Sun Yellow Squares */}
            <rect x="120" y="80" width="16" height="16" fill="#FFE066" transform="rotate(25 120 80)" />
            <rect x="680" y="110" width="14" height="14" fill="#FFE066" transform="rotate(-15 680 110)" />
            <rect x="340" y="50" width="18" height="18" fill="#FFE066" transform="rotate(40 340 50)" />
            
            {/* Hot Pink Triangles */}
            <polygon points="200,60 215,90 185,90" fill="#FF4FA0" transform="rotate(18 200 60)" />
            <polygon points="620,70 635,100 605,100" fill="#FF4FA0" transform="rotate(-30 620 70)" />
            <polygon points="480,40 495,70 465,70" fill="#FF4FA0" transform="rotate(12 480 40)" />

            {/* Teal Rectangles */}
            <rect x="150" y="140" width="22" height="10" fill="#19C7B8" transform="rotate(-25 150 140)" />
            <rect x="650" y="180" width="20" height="10" fill="#19C7B8" transform="rotate(35 650 180)" />
            <rect x="280" y="100" width="24" height="8" fill="#19C7B8" transform="rotate(10 280 100)" />

            {/* Orange Diamonds */}
            <rect x="230" y="120" width="14" height="14" fill="#FF7A3D" transform="rotate(45 230 120)" />
            <rect x="540" y="120" width="16" height="16" fill="#FF7A3D" transform="rotate(45 540 120)" />
          </svg>
        </div>

        <div className="bg-ink-card border-3 border-teal p-8 sm:p-12 text-center space-y-6 shadow-[8px_8px_0px_#1A0B2E] relative z-10">
          <div className="w-16 h-16 bg-teal text-ink border-3 border-ink flex items-center justify-center mx-auto shadow-[3px_3px_0px_#1A0B2E]">
            <Check className="w-10 h-10 stroke-[3px]" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-teal font-black px-3 py-1 bg-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] inline-block transform -rotate-2">
              SUBMITTED FOR REVIEW
            </span>
            <h2 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-cream text-shadow-hard pt-1">
              INTEL DOSSIER #{submittedDossier.id} LOGGED
            </h2>
            <p className="font-body text-xs sm:text-sm text-cream/80 max-w-lg mx-auto">
              Your field reconnaissance has been filed in the Leonida Intelligence Database. It is now queued for community replication and auditor cross-checking.
            </p>
          </div>

          <div className="bg-ink p-4 border-2 border-ink text-left font-mono text-xs space-y-2 max-w-md mx-auto shadow-[3px_3px_0px_#1A0B2E]">
            <div className="flex justify-between">
              <span className="text-cream/60">TITLE:</span>
              <strong className="text-cream truncate max-w-[200px]">{submittedDossier.title}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/60">DISTRICT:</span>
              <span className="text-orange font-bold">{submittedDossier.district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/60">GRID SECTOR:</span>
              <span className="text-teal font-bold">{submittedDossier.coordinates?.inGameGrid || 'GRID'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream/60">STATUS:</span>
              <span className="text-sun uppercase font-black">UNVERIFIED (QUEUED)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={`/discoveries/${submittedDossier.id}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black tracking-widest transition-all border-2 border-ink shadow-[3px_3px_0px_#FF4FA0]"
            >
              INSPECT DOSSIER &rarr;
            </Link>
            <button
              onClick={() => {
                setSubmittedDossier(null);
                setCurrentStep(1);
                setTitle('');
                setDescription('');
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-ink hover:bg-ink-card text-cream border-2 border-ink font-mono text-xs uppercase font-bold"
            >
              SUBMIT ANOTHER RECON
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body bg-ink text-cream">
      
      {/* Header */}
      <div className="border-b-3 border-ink pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase font-black px-2.5 py-1 bg-sun text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
            INTEL TRANSMISSION DESK
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-cream text-shadow-hard leading-none">
          SUBMIT DISCOVERY
        </h1>
        <p className="font-body text-xs sm:text-sm text-cream/80 max-w-xl">
          Report a secret building, rare vehicle spawn, easter egg, or swamp encounter with coordinate verification.
        </p>
      </div>

      {/* Stepper Navigation */}
      <Stepper
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(s) => {
          if (s < currentStep || (title && description)) setCurrentStep(s);
        }}
      />

      {/* Draft Restored Banner */}
      {draftRestored && (
        <div className="p-3 bg-ink-card border-2 border-teal text-xs font-mono text-cream flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A0B2E]">
          <div className="flex items-center gap-2 font-bold">
            <Save className="w-4 h-4 text-teal shrink-0 stroke-[2.5px]" />
            <span>Draft restored from previous field session.</span>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="text-orange hover:underline uppercase font-bold"
          >
            Discard
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-950/80 border-2 border-red-500 text-xs font-mono text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 stroke-[2.5px] text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Multi-step Form */}
      <form onSubmit={handleSubmit} className="bg-ink-card border-3 border-ink p-6 sm:p-8 shadow-[6px_6px_0px_#1A0B2E] space-y-6">
        
        {/* STEP 1: BASICS */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b-2 border-ink pb-2">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream">
                01. CORE INTEL BASICS
              </h3>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-orange font-black block mb-1">
                Dossier Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Jack of Hearts Subterranean VIP Suite Access"
                required
                className="w-full bg-ink border-2 border-ink text-sm text-cream p-3 font-mono focus:border-orange outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono font-bold focus:border-orange outline-none"
                >
                  <option value="hidden-location">Hidden Location</option>
                  <option value="rare-vehicle">Rare Vehicle</option>
                  <option value="easter-egg">Easter Egg</option>
                  <option value="encounter">Random Encounter</option>
                  <option value="hidden-activity">Hidden Activity</option>
                  <option value="wildlife">Wildlife</option>
                  <option value="unusual-event">Unusual Event</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Art Deco Interior, Nightclub"
                  className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono focus:border-orange outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                Full Recon Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what was discovered, visible anomalies, interactive elements..."
                required
                className="w-full bg-ink border-2 border-ink text-xs font-mono text-cream p-3 focus:border-orange outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] flex items-center gap-2"
              >
                <span>NEXT: LOCATION & GRID</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b-2 border-ink pb-2">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream">
                02. SECTOR & LOCATION
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-orange font-black block mb-1">
                  Landmark / Landmark Site *
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. 5th Ave Behind Tropic Motel"
                  required
                  className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono focus:border-orange outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                  Leonida District *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono font-bold focus:border-orange outline-none"
                >
                  <option value="Vice Beach">Vice Beach</option>
                  <option value="Port Gellhorn">Port Gellhorn</option>
                  <option value="The Keys">Key Chicas / The Keys</option>
                  <option value="Grassrivers">Grassrivers</option>
                  <option value="Ambrosia">Ambrosia</option>
                  <option value="Leonard County">Leonard County</option>
                  <option value="North Leonida">North Leonida</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-ink border-2 border-ink space-y-2">
              <span className="font-mono text-xs uppercase font-black text-sun block">
                TACTICAL IN-GAME GRID COORDINATES
              </span>
              <p className="font-body text-xs text-cream/70 leading-relaxed">
                You can drop an exact coordinate pin directly on the Tactical Map to auto-fill this CRS coordinate lock.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-cream/60 uppercase block">Grid Sector</label>
                  <input
                    type="text"
                    value={inGameGrid}
                    onChange={(e) => setInGameGrid(e.target.value)}
                    className="w-full bg-ink-card border border-ink p-2 text-cream font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-cream/60 uppercase block">Game X (m)</label>
                  <input
                    type="number"
                    value={gameX ?? ''}
                    onChange={(e) => setGameX(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. -320.4"
                    className="w-full bg-ink-card border border-ink p-2 text-cream font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-cream/60 uppercase block">Game Y (m)</label>
                  <input
                    type="number"
                    value={gameY ?? ''}
                    onChange={(e) => setGameY(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 145.2"
                    className="w-full bg-ink-card border border-ink p-2 text-cream font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-3 bg-ink border-2 border-ink font-mono text-xs uppercase text-cream font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] flex items-center gap-2"
              >
                <span>NEXT: EVIDENCE MEDIA</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EVIDENCE */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b-2 border-ink pb-2">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream">
                03. EVIDENCE & SIGHTING PROOF
              </h3>
            </div>

            {/* Presets and URL Slot */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-teal font-black block">
                Evidence Image URL *
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://..."
                required
                className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono focus:border-orange outline-none"
              />

              <div className="pt-1">
                <span className="text-[10px] font-mono uppercase font-bold text-cream/60 block mb-1">
                  Or select test evidence preset:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEvidenceUrl(p.url)}
                      className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold bg-ink border border-ink/80 text-cream/80 hover:text-orange hover:border-orange"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {evidenceUrl && (
              <div className="relative h-56 w-full bg-ink border-2 border-ink overflow-hidden shadow-[3px_3px_0px_#1A0B2E]">
                <ViceImage src={evidenceUrl} alt="Evidence preview" category={category} fill className="object-cover" />
              </div>
            )}

            <div>
              <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                Evidence Caption
              </label>
              <input
                type="text"
                value={evidenceCaption}
                onChange={(e) => setEvidenceCaption(e.target.value)}
                placeholder="e.g. Visual confirmation of unlocked door"
                className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono focus:border-orange outline-none"
              />
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-3 bg-ink border-2 border-ink font-mono text-xs uppercase text-cream font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] flex items-center gap-2"
              >
                <span>NEXT: CONDITIONS</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONDITIONS */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b-2 border-ink pb-2">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream">
                04. ENVIRONMENTAL CONDITIONS & STEPS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                  In-Game Time Trigger
                </label>
                <input
                  type="text"
                  value={inGameTime}
                  onChange={(e) => setInGameTime(e.target.value)}
                  placeholder="e.g. 02:00 - 04:30 AM"
                  className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono focus:border-orange outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                  Weather Requirement
                </label>
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="e.g. Thunderstorm / Dense Fog"
                  className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono focus:border-orange outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                Prerequisites & Gear Needed
              </label>
              <input
                type="text"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g. Bolt cutters, High-clearance truck"
                className="w-full bg-ink border-2 border-ink text-xs text-cream p-3 font-mono focus:border-orange outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-cream font-black block mb-1">
                Reproduction Steps (One per line)
              </label>
              <textarea
                rows={3}
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                className="w-full bg-ink border-2 border-ink text-xs font-mono text-cream p-3 focus:border-orange outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-3 bg-ink border-2 border-ink font-mono text-xs uppercase text-cream font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] flex items-center gap-2"
              >
                <span>NEXT: REVIEW & SUBMIT</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b-2 border-ink pb-2">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream">
                05. REVIEW DOSSIER
              </h3>
            </div>

            <div className="bg-ink p-5 border-2 border-ink space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-ink/40 pb-3">
                <div>
                  <span className="text-[10px] text-cream/60 uppercase block">TITLE</span>
                  <h4 className="text-base uppercase font-display text-cream">{title || 'Untitled'}</h4>
                </div>
                <VerificationStamp status="unverified" size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-orange font-bold uppercase block">LOCATION:</span>
                  <span className="text-cream">{locationName} ({district})</span>
                </div>
                <div>
                  <span className="text-teal font-bold uppercase block">CATEGORY:</span>
                  <span className="text-cream uppercase">{category.replace('-', ' ')}</span>
                </div>
                <div>
                  <span className="text-sun font-bold uppercase block">CONDITIONS:</span>
                  <span className="text-cream">{inGameTime} • {weather}</span>
                </div>
                <div>
                  <span className="text-hot-pink font-bold uppercase block">GRID:</span>
                  <span className="text-cream">{inGameGrid}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-cream/60 uppercase block mb-1">DESCRIPTION</span>
                <p className="font-body text-xs text-cream/80 normal-case leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-3 bg-ink border-2 border-ink font-mono text-xs uppercase text-cream font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
                <span>BACK</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-sun hover:bg-sun-hover text-ink font-mono text-xs uppercase font-black tracking-widest border-2 border-ink shadow-[4px_4px_0px_#FF4FA0] flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5px]" />
                <span>{loading ? 'TRANSMITTING...' : 'TRANSMIT FOR REVIEW'}</span>
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
