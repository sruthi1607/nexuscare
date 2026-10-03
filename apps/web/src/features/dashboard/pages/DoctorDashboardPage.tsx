import { Link } from 'react-router';
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  Users,
  Video,
  ClipboardList,
  AlertTriangle,
  HeartPulse,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { DoctorVerification } from '@nexuscare/shared';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert, type AlertTone } from '../../../components/ui/Alert';
import { useCurrentUser } from '../../auth/auth-context';
import { useTreatment } from '../../treatment/treatment-store';
import { useMonitoring } from '../../monitoring/monitoring-store';

const verificationCopy: Record<
  DoctorVerification,
  { tone: AlertTone; title: string; body: string }
> = {
  pending: {
    tone: 'warning',
    title: 'Your account is awaiting verification',
    body: 'Patients cannot find or book you until an administrator has verified your medical registration. You will be asked for your registration details when doctor onboarding opens.',
  },
  verified: {
    tone: 'success',
    title: 'Your account is verified',
    body: 'Patients can find you in the doctor directory.',
  },
  rejected: {
    tone: 'danger',
    title: 'Verification was not approved',
    body: 'Please contact support to review your registration details.',
  },
  suspended: {
    tone: 'danger',
    title: 'Your doctor profile is suspended',
    body: 'You are hidden from patients. Please contact support.',
  },
};

export function DoctorDashboardPage() {
  const user = useCurrentUser();
  const verification = verificationCopy[user.doctorVerification ?? 'pending'];
  const { appointments, prescriptions } = useTreatment();
  const { alerts } = useMonitoring();

  const upcomingAppointments = appointments.filter((a) => a.status === 'scheduled');

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user.fullName}`} description="Your practice at a glance." />

      <Alert tone={verification.tone} title={verification.title}>
        {verification.body}
      </Alert>

      {/* Doctor Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Today's Visits</span>
            <CalendarDays className="size-4 text-brand-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{upcomingAppointments.length}</div>
          <span className="mt-1 block text-[11px] text-emerald-600 font-medium">1 In Waiting Room</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Consulted Patients</span>
            <Users className="size-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">42</div>
          <span className="mt-1 block text-[11px] text-slate-500">Active panel</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Prescriptions</span>
            <ClipboardList className="size-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{prescriptions.length}</div>
          <span className="mt-1 block text-[11px] text-slate-500">Digitally signed</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Telemetry Alerts</span>
            <AlertTriangle className="size-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{alerts.length}</div>
          <span className="mt-1 block text-[11px] text-rose-600 font-medium">1 Needs review</span>
        </div>
      </div>

      {/* Patient Telemetry Alert Banner if any */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-4 text-rose-950 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <HeartPulse className="size-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-900">
                  Automated Wearable Alert: Sarah Jenkins (Tachycardia 104 bpm)
                </h3>
                <p className="mt-0.5 text-xs text-rose-800 leading-relaxed">
                  Continuous wearable monitoring logged resting tachycardia. Patient has a follow-up scheduled today at 04:30 PM.
                </p>
              </div>
            </div>
            <Link
              to="/doctor/consultations"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Open Clinical Suite
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Consultations Roster */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Appointment Agenda</h2>
            <p className="text-xs text-slate-500">Tele-consultations and patient review sessions</p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Full Agenda →
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {upcomingAppointments.map((apt) => (
            <div
              key={apt.id}
              className="flex flex-col justify-between gap-4 py-3.5 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-800">
                  SJ
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{apt.patientName || 'Sarah Jenkins'}</h4>
                  <p className="text-xs text-slate-500">
                    Reason: {apt.reasonForVisit} • {apt.scheduledAt.replace('T', ' ').slice(0, 16)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/doctor/consultations"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-800"
                >
                  <Video className="size-3.5" /> Launch Consultation Suite
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

