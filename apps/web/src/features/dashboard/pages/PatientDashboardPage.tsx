import { Link } from 'react-router';
import {
  Activity,
  BellRing,
  CalendarDays,
  Pill,
  Stethoscope,
  Video,
  FileText,
  Sparkles,
  Bot,
  ShoppingBag,
  Users,
  CheckCircle2,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ButtonLink } from '../../../components/ui/Button';
import { useCurrentUser } from '../../auth/auth-context';
import { firstName } from '../../../lib/names';
import { useTreatment } from '../../treatment/treatment-store';
import { useMonitoring } from '../../monitoring/monitoring-store';

export function PatientDashboardPage() {
  const user = useCurrentUser();
  const { appointments, medicines, reminders, markReminderStatus } = useTreatment();
  const { vitals, mlAssessment } = useMonitoring();

  const nextAppointment = appointments.find((a) => a.status === 'scheduled');
  const pendingReminders = reminders.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${firstName(user.fullName)}`}
        description="Your health at a glance."
        actions={
          <ButtonLink to="/patient/find-doctors">
            <Stethoscope aria-hidden="true" />
            Find a doctor
          </ButtonLink>
        }
      />

      {/* Upcoming Telehealth Banner */}
      {nextAppointment && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-teal-900 p-6 text-white shadow-md">
          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold backdrop-blur-xs">
                <Video className="size-3.5 text-teal-300" /> Upcoming Tele-Consultation
              </span>
              <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                {nextAppointment.reasonForVisit} with {nextAppointment.doctorName}
              </h2>
              <p className="mt-1 text-xs text-brand-100 sm:text-sm">
                {nextAppointment.doctorSpecialty} • {nextAppointment.scheduledAt.replace('T', ' ').slice(0, 16)} (30 mins duration)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/patient/consultations/${nextAppointment.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-brand-900 shadow-xs hover:bg-brand-50 transition-colors"
              >
                <Video className="size-4 text-brand-700" /> Join Video Room
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Flagship Quick Action Modules */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          to="/patient/medications"
          className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-brand-500 hover:shadow-md transition-all"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Pill className="size-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-900">Medications</h3>
            <p className="text-[11px] text-slate-500">{medicines.length} Active Prescriptions</p>
          </div>
        </Link>

        <Link
          to="/patient/health"
          className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-brand-500 hover:shadow-md transition-all"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <HeartPulse className="size-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-900">IoT Telemetry</h3>
            <p className="text-[11px] text-slate-500">{vitals.heartRate} bpm • {vitals.spO2}% SpO2</p>
          </div>
        </Link>

        <Link
          to="/patient/medtranslator"
          className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-brand-500 hover:shadow-md transition-all"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Sparkles className="size-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-900">MedTranslator™</h3>
            <p className="text-[11px] text-slate-500">Decode Lab Reports</p>
          </div>
        </Link>

        <Link
          to="/patient/assistant"
          className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-brand-500 hover:shadow-md transition-all"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-colors">
            <Bot className="size-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-900">AI Assistant</h3>
            <p className="text-[11px] text-slate-500">Clinical Knowledge</p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Biometric Snapshot & Today's Dose Schedule */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live Vitals & ML Risk Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Live Health Telemetry</h3>
                  <p className="text-xs text-slate-500">Continuous biometric stream from wearable sensors</p>
                </div>
              </div>

              <Link
                to="/patient/health"
                className="text-xs font-bold text-brand-700 hover:text-brand-800"
              >
                Waveforms →
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500">Pulse</span>
                <div className="mt-1 text-xl font-extrabold text-slate-900">{vitals.heartRate} <span className="text-xs font-normal">bpm</span></div>
                <span className="text-[10px] text-emerald-600 font-medium">Resting Normal</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500">Blood Pressure</span>
                <div className="mt-1 text-xl font-extrabold text-slate-900">{vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}</div>
                <span className="text-[10px] text-emerald-600 font-medium">Optimal</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                <span className="text-[11px] font-semibold text-slate-500">Oxygen (SpO2)</span>
                <div className="mt-1 text-xl font-extrabold text-slate-900">{vitals.spO2}%</div>
                <span className="text-[10px] text-emerald-600 font-medium">Healthy</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/50 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-brand-600" /> ML Health Pattern Indication
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {mlAssessment.overallLevel} Risk Pattern ({mlAssessment.score}/100)
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {mlAssessment.summary}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Sensors: Nexus Pulse Smartwatch connected</span>
            <Link to="/patient/health" className="font-semibold text-brand-700 hover:underline">
              Inspect Telemetry
            </Link>
          </div>
        </div>

        {/* Today's Medication Reminders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Pill className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Today's Pill Schedule</h3>
                  <p className="text-xs text-slate-500">7-Day Adherence Streak • 96% on-time</p>
                </div>
              </div>

              <Link
                to="/patient/medications"
                className="text-xs font-bold text-brand-700 hover:text-brand-800"
              >
                All Doses →
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{reminder.medicineName}</span>
                      <span className="text-[11px] text-slate-500">({reminder.dosage})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {reminder.timeSlot} • {reminder.scheduledTime} • {reminder.timing}
                    </span>
                  </div>

                  <div>
                    {reminder.status === 'taken' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="size-3.5" /> Taken
                      </span>
                    ) : (
                      <button
                        onClick={() => markReminderStatus(reminder.id, 'taken')}
                        className="rounded-lg bg-brand-700 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-brand-800"
                      >
                        Mark Taken
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need medicines delivered?</span>
            <Link
              to="/patient/pharmacy"
              className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline"
            >
              <ShoppingBag className="size-3.5" /> Order via Online Pharmacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

