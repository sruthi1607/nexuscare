import { useState } from 'react';
import {
  Users,
  HeartPulse,
  Pill,
  FileText,
  Calendar,
  Activity,
  Phone,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useTreatment } from '../../treatment/treatment-store';

export function FamilyPatientsPage() {
  const { medicines, prescriptions, records, appointments } = useTreatment();
  const [activeTab, setActiveTab] = useState<'vitals' | 'meds' | 'prescriptions' | 'records'>('vitals');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Linked Patient Health Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Viewing authorized health parameters and care records shared by Sarah Jenkins.
        </p>
      </div>

      {/* Patient Bio Card */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-700 text-xl font-bold text-white shadow-xs">
            SJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Sarah Jenkins</h2>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-700/20">
                Spouse
              </span>
            </div>
            <p className="text-xs text-slate-500">Age 48 • Female • Blood Group O+ • Primary Doctor: Dr. Arvind Mehta</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:+15552345678"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Phone className="size-3.5" /> Call Patient
          </a>
        </div>
      </div>

      {/* Granted Permissions Badge */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
        <ShieldCheck className="size-4 text-emerald-600" />
        <span className="font-semibold">Your Authorized Access:</span>
        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-xs">✓ Live Vitals</span>
        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-xs">✓ Prescriptions</span>
        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-xs">✓ Lab Reports</span>
        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-xs">✓ Emergency Alerts</span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'vitals', label: 'Vitals & Monitoring', icon: Activity },
          { id: 'meds', label: 'Active Medications', icon: Pill },
          { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
          { id: 'records', label: 'Lab Reports', icon: HeartPulse },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'vitals' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Resting Heart Rate</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">74</span>
                <span className="text-xs text-slate-500">bpm</span>
              </div>
              <span className="mt-1 block text-xs text-emerald-600 font-medium">Normal range (60-100)</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Blood Pressure</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">122/80</span>
                <span className="text-xs text-slate-500">mmHg</span>
              </div>
              <span className="mt-1 block text-xs text-emerald-600 font-medium">Target controlled</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Oxygen Saturation</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">98%</span>
                <span className="text-xs text-slate-500">SpO2</span>
              </div>
              <span className="mt-1 block text-xs text-emerald-600 font-medium">Healthy</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Body Temperature</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">98.4</span>
                <span className="text-xs text-slate-500">°F</span>
              </div>
              <span className="mt-1 block text-xs text-emerald-600 font-medium">Normal</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'meds' && (
        <div className="grid gap-3 md:grid-cols-2">
          {medicines.map((med) => (
            <div key={med.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                  <p className="text-xs text-slate-500">{med.genericName} • {med.strength} ({med.dosageForm})</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {med.dailySlots.join(', ')}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{med.instructions}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                <span>Supply remaining: {med.daysSupplyRemaining} days</span>
                <span>Doctor: {med.prescribedBy || 'Dr. Arvind Mehta'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Prescription for {rx.diagnosis}</h3>
                  <p className="text-xs text-slate-500">Issued by {rx.doctorName} • {rx.issuedAt.split('T')[0]}</p>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  Valid until {rx.validUntil}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {rx.items.map((item, idx) => (
                  <span key={item.id || idx} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {item.medicineName} ({item.strength}) — {item.frequency}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-3">
          {records.map((rec) => (
            <div key={rec.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                  <p className="text-xs text-slate-500">{rec.labOrClinic} • {rec.recordDate}</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 capitalize">
                {rec.type.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
