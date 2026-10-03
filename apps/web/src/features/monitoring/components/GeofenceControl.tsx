import { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  Radio,
  Bell,
  Users,
} from 'lucide-react';
import { useMonitoring } from '../monitoring-store';

export function GeofenceControl() {
  const {
    geofence,
    updateGeofence,
    simulateGeofenceExit,
    simulateGeofenceEnter,
    deleteGeofence,
  } = useMonitoring();

  const [isEditing, setIsEditing] = useState(false);
  const [zoneName, setZoneName] = useState(geofence.name);
  const [radiusMeters, setRadiusMeters] = useState(geofence.radiusMeters);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGeofence({
      name: zoneName,
      radiusMeters: Number(radiusMeters),
      enabled: true,
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      {/* Geofence Status Banner */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-xl text-white ${
              !geofence.enabled
                ? 'bg-slate-400'
                : geofence.isInside
                  ? 'bg-emerald-600 shadow-xs'
                  : 'bg-rose-600 animate-pulse shadow-xs'
            }`}
          >
            {geofence.isInside ? <ShieldCheck className="size-5" /> : <ShieldAlert className="size-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{geofence.name}</h3>
              {geofence.enabled ? (
                geofence.isInside ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="size-3.5" /> INSIDE SAFE ZONE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 animate-bounce">
                    <AlertTriangle className="size-3.5" /> OUTSIDE SAFE ZONE
                  </span>
                )
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  DISABLED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Perimeter Radius: <strong>{geofence.radiusMeters} meters</strong> • Center: {geofence.centerLat.toFixed(4)}° N, {geofence.centerLng.toFixed(4)}° E
            </p>
          </div>
        </div>

        {/* Enable / Edit Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateGeofence({ enabled: !geofence.enabled })}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              geofence.enabled
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {geofence.enabled ? '✓ Geofence Enabled' : 'Enable Geofence'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Edit3 className="size-3.5" />
            {isEditing ? 'Cancel' : 'Edit Zone'}
          </button>
        </div>
      </div>

      {/* Geofence Breach Alert Box (when outside) */}
      {!geofence.isInside && geofence.enabled && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-rose-600 p-2 text-white">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-900 uppercase tracking-wide">
                ⚠️ GEO-FENCE ALERT
              </h4>
              <p className="mt-1 text-xs font-medium text-rose-800 leading-relaxed">
                “Patient has moved outside the configured safe zone.”
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-rose-700">
                <span className="flex items-center gap-1">
                  <Bell className="size-3.5" /> High-Priority Patient Notification Generated
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" /> Caregiver David Jenkins Alerted
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geofence Entered Confirmation (when inside) */}
      {geofence.isInside && geofence.enabled && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="size-4 text-emerald-700" />
            <span>✓ GEO-FENCE ENTERED: Patient is securely within the designated home perimeter.</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
            Status Normal
          </span>
        </div>
      )}

      {/* Edit Safe Zone Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">
            Configure Safe Zone Parameters
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Safe Zone Name</label>
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-hidden"
                placeholder="e.g. Home Safe Zone"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Perimeter Radius</label>
              <select
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-hidden"
              >
                <option value={200}>200 meters (Immediate Neighborhood)</option>
                <option value={500}>500 meters (Home Safe Zone - Recommended)</option>
                <option value={1000}>1,000 meters (1 km Extended Zone)</option>
                <option value={2000}>2,000 meters (2 km City Sector)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={deleteGeofence}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="size-3.5" /> Disable / Reset
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-800"
            >
              Save Safe Zone
            </button>
          </div>
        </form>
      )}

      {/* Interactive Simulation Controls */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="size-3.5 text-brand-700" />
              Demo Geo-Fencing Simulation Triggers:
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Simulate patient movement to test instant alerts, notifications, and map indicators.
            </p>
          </div>

          <div className="flex gap-2">
            {geofence.isInside ? (
              <button
                type="button"
                onClick={simulateGeofenceExit}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
              >
                <AlertTriangle className="size-3.5" />
                Simulate Exiting Safe Zone
              </button>
            ) : (
              <button
                type="button"
                onClick={simulateGeofenceEnter}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                <CheckCircle2 className="size-3.5" />
                Simulate Returning to Safe Zone
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
