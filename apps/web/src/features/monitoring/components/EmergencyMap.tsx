import { useState } from 'react';
import {
  MapPin,
  Building2,
  Navigation,
  Plus,
  Minus,
  RotateCcw,
  Phone,
  Bed,
  ShieldAlert,
  Clock,
  Siren,
  Sparkles,
} from 'lucide-react';
import { useMonitoring } from '../monitoring-store';
import type { NearbyHospital } from '../types';

export function EmergencyMap() {
  const {
    hospitals,
    selectedHospitalId,
    selectHospital,
    emergencyActions,
    geofence,
    dispatchAmbulance,
  } = useMonitoring();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeHospitalPopup, setActiveHospitalPopup] = useState<NearbyHospital | null>(null);

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0]!;
  const isAmbulanceDispatched = emergencyActions.ambulance.dispatched;

  // Patient Coords on 800x450 canvas
  const patientPos = { x: 400, y: 225 };

  // Hospital positions mapped onto relative canvas coordinates
  const hospitalCanvasPositions: Record<string, { x: number; y: number }> = {
    'hosp-apollo': { x: 580, y: 130 },
    'hosp-fortis': { x: 260, y: 110 },
    'hosp-manipal': { x: 620, y: 320 },
    'hosp-max': { x: 210, y: 340 },
  };

  const currentSelectedPos = hospitalCanvasPositions[selectedHospital.id] ?? { x: 580, y: 130 };

  const handleZoomIn = () => setZoom((z) => Math.min(2.0, z + 0.2));
  const handleZoomOut = () => setZoom((z) => Math.max(0.7, z - 0.2));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Safe Zone radius in SVG pixels
  const geofenceRadiusPx = (geofence.radiusMeters / 500) * 90;

  return (
    <div className="space-y-4">
      {/* Map Header & Controls */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Interactive Emergency Radar & Map</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Live Vector Map
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time patient GPS, trauma hospital networks, active ambulance route, and geofence boundary.
          </p>
        </div>

        {/* Map Toolbar */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
            title="Zoom In"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
            title="Zoom Out"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
            title="Reset View"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative h-[380px] sm:h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-inner">
        {/* Vector SVG Map Layer */}
        <svg
          className="size-full select-none transition-transform duration-200"
          viewBox="0 0 800 450"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          {/* Map Grid and Street Network */}
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
            {/* Pulsing Glow Filters */}
            <filter id="patientGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="ambulanceGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="800" height="450" fill="#0f172a" />
          <rect width="800" height="450" fill="url(#gridPattern)" />

          {/* City Arteries / Roads */}
          <g stroke="#334155" strokeWidth="6" strokeLinecap="round" opacity="0.6">
            <path d="M 50 150 Q 300 200 750 120" />
            <path d="M 120 400 Q 400 230 700 380" />
            <path d="M 280 40 Q 350 250 320 420" />
            <path d="M 550 50 Q 500 240 580 420" />
            <path d="M 100 260 L 700 220" />
          </g>

          {/* Geofence Boundary Circle */}
          {geofence.enabled && (
            <g>
              <circle
                cx={patientPos.x}
                cy={patientPos.y}
                r={geofenceRadiusPx}
                fill={geofence.isInside ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.12)'}
                stroke={geofence.isInside ? '#10b981' : '#ef4444'}
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              <text
                x={patientPos.x}
                y={patientPos.y - geofenceRadiusPx - 8}
                fill={geofence.isInside ? '#34d399' : '#f87171'}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                {geofence.name} ({geofence.radiusMeters}m Safe Radius)
              </text>
            </g>
          )}

          {/* Active Ambulance Route Polyline */}
          <g>
            <path
              d={`M ${currentSelectedPos.x} ${currentSelectedPos.y} Q ${(currentSelectedPos.x + patientPos.x) / 2} ${(currentSelectedPos.y + patientPos.y) / 2 - 30} ${patientPos.x} ${patientPos.y}`}
              fill="none"
              stroke={isAmbulanceDispatched ? '#ef4444' : '#38bdf8'}
              strokeWidth="4"
              strokeDasharray={isAmbulanceDispatched ? '8 6' : '4 4'}
              strokeLinecap="round"
              className={isAmbulanceDispatched ? 'animate-pulse' : ''}
              opacity="0.85"
            />
          </g>

          {/* Moving Ambulance Marker if dispatched */}
          {isAmbulanceDispatched && (
            <g transform={`translate(${(currentSelectedPos.x * 2 + patientPos.x) / 3}, ${(currentSelectedPos.y * 2 + patientPos.y) / 3 - 10})`}>
              <circle cx="0" cy="0" r="14" fill="#ef4444" filter="url(#ambulanceGlow)" />
              <circle cx="0" cy="0" r="8" fill="#ffffff" />
            </g>
          )}

          {/* Hospital Markers */}
          {hospitals.map((hosp) => {
            const pos = hospitalCanvasPositions[hosp.id] ?? { x: 500, y: 200 };
            const isSelected = hosp.id === selectedHospitalId;

            return (
              <g
                key={hosp.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                  selectHospital(hosp.id);
                  setActiveHospitalPopup(hosp);
                }}
              >
                {/* Outer selection ring */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="22"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin"
                  />
                )}
                {/* Base pin */}
                <circle cx={pos.x} cy={pos.y} r="14" fill={isSelected ? '#0284c7' : '#1e293b'} stroke="#ffffff" strokeWidth="2" />
                <path
                  d={`M ${pos.x - 5} ${pos.y - 1} L ${pos.x + 5} ${pos.y - 1} M ${pos.x} ${pos.y - 6} L ${pos.x} ${pos.y + 4}`}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <text
                  x={pos.x}
                  y={pos.y + 24}
                  fill="#f1f5f9"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-md"
                >
                  {hosp.name.split(' ')[0]} ({hosp.etaMins}m)
                </text>
              </g>
            );
          })}

          {/* Patient Location Marker (Center) */}
          <g>
            <circle cx={patientPos.x} cy={patientPos.y} r="28" fill="rgba(56, 189, 248, 0.15)" className="animate-ping" />
            <circle cx={patientPos.x} cy={patientPos.y} r="16" fill="#0284c7" filter="url(#patientGlow)" />
            <circle cx={patientPos.x} cy={patientPos.y} r="6" fill="#ffffff" />
            <text
              x={patientPos.x}
              y={patientPos.y + 24}
              fill="#38bdf8"
              fontSize="11"
              fontWeight="extrabold"
              textAnchor="middle"
              className="pointer-events-none drop-shadow-lg"
            >
              Sarah Jenkins (Patient)
            </text>
          </g>
        </svg>

        {/* Floating Active Route Info Pill */}
        <div className="absolute top-3 left-3 z-10 rounded-xl bg-slate-900/85 p-3 text-xs text-white backdrop-blur-md border border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-sky-400" />
            <span className="font-bold">Active Hospital Route:</span>
            <span className="text-sky-300 font-semibold">{selectedHospital.name}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-300">
            <span>Distance: <strong>{selectedHospital.distanceKm} km</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Clock className="size-3" /> ETA: ~{selectedHospital.etaMins} mins
            </span>
          </div>
        </div>

        {/* Floating Hospital Popup Modal inside Map */}
        {activeHospitalPopup && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 z-20 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase">
                  {activeHospitalPopup.traumaLevel}
                </span>
                <h4 className="mt-1 font-bold text-sm text-slate-900">{activeHospitalPopup.name}</h4>
                <p className="text-[11px] text-slate-500">{activeHospitalPopup.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveHospitalPopup(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Bed className="size-3.5 text-brand-600" />
                <span>{activeHospitalPopup.emergencyBeds} ICU Beds Free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-600" />
                <span>ETA: {activeHospitalPopup.etaMins} mins</span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <a
                href={`tel:${activeHospitalPopup.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-slate-50 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Phone className="size-3 text-slate-600" /> Call ER
              </a>
              <button
                type="button"
                onClick={() => {
                  selectHospital(activeHospitalPopup.id);
                  dispatchAmbulance(activeHospitalPopup.id);
                  setActiveHospitalPopup(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
              >
                <Siren className="size-3" /> Route Ambulance
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hospital Selection Strip */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {hospitals.map((hosp) => {
          const isSelected = hosp.id === selectedHospitalId;
          return (
            <button
              key={hosp.id}
              type="button"
              onClick={() => {
                selectHospital(hosp.id);
                setActiveHospitalPopup(hosp);
              }}
              className={`flex flex-col text-left rounded-xl p-3 border transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 truncate">{hosp.name}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.2">
                  {hosp.distanceKm} km
                </span>
              </div>
              <span className="mt-1 text-[11px] text-slate-500">{hosp.traumaLevel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
