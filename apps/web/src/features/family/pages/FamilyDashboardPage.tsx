import { Link } from 'react-router';
import {
  Users,
  Activity,
  AlertTriangle,
  Pill,
  HeartPulse,
  PhoneCall,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useFamily } from '../family-store';
import { useAuth } from '../../auth/auth-context';

export function FamilyDashboardPage() {
  const { user } = useAuth();
  const { alerts, acknowledgeAlert } = useFamily();
  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-teal-800 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="size-3.5 text-teal-300" /> Authorized Family Caregiver
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Hello, {user?.fullName || 'David Jenkins'}
            </h1>
            <p className="mt-1 text-sm text-brand-100">
              You are caring for 1 linked family member. All health parameters and emergency alerts are actively monitored.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/family/patients"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-brand-900 shadow-xs hover:bg-brand-50 transition-colors"
            >
              <Users className="size-4 text-brand-700" /> View Linked Patient
            </Link>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
            >
              <PhoneCall className="size-4" /> Emergency SOS (112)
            </a>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner if any */}
      {unreadAlerts.length > 0 && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-900">
                  {unreadAlerts[0]?.title} ({unreadAlerts[0]?.patientName})
                </h3>
                <p className="mt-0.5 text-xs text-rose-800 leading-relaxed">
                  {unreadAlerts[0]?.message}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    to="/family/alerts"
                    className="text-xs font-semibold text-rose-900 underline hover:text-rose-950"
                  >
                    View All {unreadAlerts.length} Alerts
                  </Link>
                  <button
                    onClick={() => unreadAlerts[0] && acknowledgeAlert(unreadAlerts[0].id)}
                    className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-100/50"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Linked Patient Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-700 text-lg font-bold text-white shadow-xs">
              SJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Sarah Jenkins</h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                  Stable
                </span>
              </div>
              <p className="text-xs text-slate-500">Spouse • Age 48 • Type 2 Diabetes & Mild Hypertension</p>
            </div>
          </div>

          <Link
            to="/family/patients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            Full Shared Profile <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Live Vitals Telemetry Snapshot */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Heart Rate</span>
              <HeartPulse className="size-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">74</span>
              <span className="text-xs text-slate-500">bpm</span>
            </div>
            <span className="mt-1 block text-[11px] font-medium text-emerald-600">Normal resting</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Blood Pressure</span>
              <Activity className="size-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">122/80</span>
              <span className="text-xs text-slate-500">mmHg</span>
            </div>
            <span className="mt-1 block text-[11px] font-medium text-emerald-600">Within target</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Oxygen (SpO2)</span>
              <Activity className="size-4 text-teal-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">98%</span>
            </div>
            <span className="mt-1 block text-[11px] font-medium text-emerald-600">Optimal</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Blood Glucose</span>
              <Activity className="size-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">114</span>
              <span className="text-xs text-slate-500">mg/dL</span>
            </div>
            <span className="mt-1 block text-[11px] font-medium text-emerald-600">Fasting (Good)</span>
          </div>
        </div>

        {/* Medication Adherence Today */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="size-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Today's Medication Adherence</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700">2 of 3 Doses Taken</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="size-3.5" /> Morning: Metformin 500mg & Telmisartan 40mg
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="size-3.5" /> Afternoon: Metformin 500mg
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              ⏳ Evening: Atorvastatin 10mg (Due 09:00 PM)
            </span>
          </div>
        </div>

        {/* Next Scheduled Care Touchpoint */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs">
          <div className="flex items-center gap-3">
            <CalendarDays className="size-5 text-blue-600" />
            <div>
              <span className="font-bold text-slate-900">Next Scheduled Consultation:</span>
              <p className="text-slate-600">Today, 04:30 PM with Dr. Arvind Mehta (Cardiology Follow-up)</p>
            </div>
          </div>
          <Link
            to="/family/patients"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
