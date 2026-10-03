import { useState } from 'react';
import {
  Siren,
  Users,
  Stethoscope,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  Radio,
  Share2,
  ShieldCheck,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { useMonitoring } from '../monitoring-store';

export function EmergencyActionHub() {
  const {
    emergencyActions,
    emergencyTimeline,
    hospitals,
    selectedHospitalId,
    dispatchAmbulance,
    cancelAmbulance,
    alertFamilyMembers,
    requestOnCallDoctor,
    shareHealthSummaryWithDoctor,
    startGpsSharing,
    stopGpsSharing,
    selectHospital,
    vitals,
  } = useMonitoring();

  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0]!;

  const { ambulance, familyAlert, onCallDoctor, gpsLocation } = emergencyActions;

  return (
    <div className="space-y-6">
      {/* 4 Emergency Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* ACTION A: 108 Ambulance */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            ambulance.dispatched
              ? 'border-rose-300 bg-rose-50/60 ring-2 ring-rose-500/20'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <Siren className={`size-5 ${ambulance.dispatched ? 'animate-bounce' : ''}`} />
            </div>
            <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase">
              {ambulance.dispatched ? 'Dispatch Active' : 'Prototype 108'}
            </span>
          </div>

          <h3 className="mt-3 text-sm font-bold text-slate-900">108 Ambulance</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {ambulance.dispatched
              ? `Unit #${ambulance.vehicleNumber} en route from ${selectedHospital.name}.`
              : 'Dispatch emergency response vehicle with paramedic telemetry sync.'}
          </p>

          {ambulance.dispatched ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-rose-200 text-xs">
                <span className="font-medium text-slate-600">Simulated ETA:</span>
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <Clock className="size-3.5" /> ~{ambulance.etaMinutes} mins
                </span>
              </div>
              <button
                type="button"
                onClick={cancelAmbulance}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Stand Down Dispatch
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => dispatchAmbulance(selectedHospitalId)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
              >
                <Siren className="size-3.5" />
                Dispatch 108 (Simulated)
              </button>
            </div>
          )}
        </div>

        {/* ACTION B: Family Alerted */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            familyAlert.alerted
              ? 'border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-500/20'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Users className="size-5" />
            </div>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 uppercase">
              {familyAlert.alerted ? 'Alerted' : 'Caregivers'}
            </span>
          </div>

          <h3 className="mt-3 text-sm font-bold text-slate-900">Family Alerted</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {familyAlert.alerted
              ? 'David Jenkins (Spouse) notified with live vitals and coordinates.'
              : 'Simulate instant SMS & high-priority push broadcast to emergency contacts.'}
          </p>

          <div className="mt-4">
            {familyAlert.alerted ? (
              <div className="rounded-lg bg-white p-2.5 border border-indigo-200 text-xs text-indigo-950 flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">SMS Sent to Caregiver (Simulated)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={alertFamilyMembers}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <Users className="size-3.5" />
                Alert Family (Simulated)
              </button>
            )}
          </div>
        </div>

        {/* ACTION C: Contact On-Call Doctor */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            onCallDoctor.summaryShared
              ? 'border-brand-300 bg-brand-50/60 ring-2 ring-brand-500/20'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-xs">
              <Stethoscope className="size-5" />
            </div>
            <span className="rounded bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800 uppercase">
              {onCallDoctor.summaryShared ? 'Connected' : 'On-Call'}
            </span>
          </div>

          <h3 className="mt-3 text-sm font-bold text-slate-900">On-Call Doctor</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {onCallDoctor.summaryShared
              ? `${onCallDoctor.doctorName} reviewing live telemetry packet.`
              : 'Open direct on-call channel with cardiology telemetry team.'}
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                requestOnCallDoctor();
                setShowDoctorModal(true);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-800 transition-colors"
            >
              <Stethoscope className="size-3.5" />
              {onCallDoctor.summaryShared ? 'View Doctor Packet' : 'Contact On-Call Doctor'}
            </button>
          </div>
        </div>

        {/* ACTION D: Share Live GPS Location */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all ${
            gpsLocation.isSharing
              ? 'border-emerald-300 bg-emerald-50/60 ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <MapPin className="size-5" />
            </div>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
              {gpsLocation.isSharing ? 'Sharing Live' : 'GPS Radar'}
            </span>
          </div>

          <h3 className="mt-3 text-sm font-bold text-slate-900">Live GPS Location</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {gpsLocation.isSharing
              ? gpsLocation.address
              : 'Broadcast browser geolocation or verified demo coordinates for emergency dispatch.'}
          </p>

          <div className="mt-4">
            {gpsLocation.isSharing ? (
              <button
                type="button"
                onClick={stopGpsSharing}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Stop Location Sharing
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startGpsSharing(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <Radio className="size-3.5" />
                Share GPS Location
              </button>
            )}
          </div>
        </div>
      </div>

      {/* On-Call Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Stethoscope className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">On-Call Cardiologist Channel</h3>
                  <p className="text-xs text-slate-500">Cardiology & Critical Care Telemetry Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Attending Physician:</span>
                <span className="font-bold text-slate-900">{onCallDoctor.doctorName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Department Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <span className="size-2 rounded-full bg-emerald-600 animate-pulse" /> Available for Telemetry Review
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Patient Telemetry Payload:</span>
                <span className="font-mono text-slate-900">HR {vitals.heartRate} bpm | SpO2 {vitals.spO2}% | BP {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-950 flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-700" />
              <p>
                <strong>Simulated Prototype Action:</strong> Transmits encrypted telemetry package to the doctor demo queue. This is a prototype and does not contact a live 911 dispatch without manual phone call.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  shareHealthSummaryWithDoctor();
                  setShowDoctorModal(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-800"
              >
                <Share2 className="size-3.5" />
                Share Telemetry Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Timeline Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Emergency & Telemetry Event Timeline</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Real-Time Audit Log</span>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {emergencyTimeline.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 text-xs">
              <div
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white ${
                  ev.type === 'ambulance'
                    ? 'bg-rose-600'
                    : ev.type === 'family'
                      ? 'bg-indigo-600'
                      : ev.type === 'geofence'
                        ? 'bg-amber-600'
                        : 'bg-brand-600'
                }`}
              >
                <Activity className="size-3" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ev.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-0.5 text-slate-600 leading-relaxed">{ev.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
