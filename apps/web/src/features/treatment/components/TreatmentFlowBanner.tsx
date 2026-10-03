import { Link } from 'react-router';
import {
  CalendarDays,
  Video,
  ClipboardList,
  FileText,
  Pill,
  BellRing,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export type TreatmentStep =
  | 'appointment'
  | 'consultation'
  | 'prescription'
  | 'records'
  | 'medicines'
  | 'reminders'
  | 'pharmacy';

interface StepMeta {
  key: TreatmentStep;
  label: string;
  icon: typeof CalendarDays;
  patientPath: string;
  doctorPath: string;
  description: string;
}

const STEPS: StepMeta[] = [
  {
    key: 'appointment',
    label: 'Appointment',
    icon: CalendarDays,
    patientPath: '/patient/appointments',
    doctorPath: '/doctor/appointments',
    description: 'Book & schedule consultation',
  },
  {
    key: 'consultation',
    label: 'Consultation',
    icon: Video,
    patientPath: '/patient/consultations',
    doctorPath: '/doctor/consultations',
    description: 'Video visit & clinical notes',
  },
  {
    key: 'prescription',
    label: 'Prescription',
    icon: ClipboardList,
    patientPath: '/patient/prescriptions',
    doctorPath: '/doctor/prescriptions',
    description: 'Digital Rx & dosages',
  },
  {
    key: 'records',
    label: 'Medical Records',
    icon: FileText,
    patientPath: '/patient/records',
    doctorPath: '/doctor/patients',
    description: 'Lab reports & test results',
  },
  {
    key: 'medicines',
    label: 'Medicines',
    icon: Pill,
    patientPath: '/patient/medications',
    doctorPath: '/doctor/prescriptions',
    description: 'Active medications & refills',
  },
  {
    key: 'reminders',
    label: 'Reminders',
    icon: BellRing,
    patientPath: '/patient/medications?tab=reminders',
    doctorPath: '/doctor/prescriptions',
    description: 'Daily dose log (taken/missed)',
  },
  {
    key: 'pharmacy',
    label: 'Pharmacy',
    icon: ShoppingBag,
    patientPath: '/patient/pharmacy',
    doctorPath: '/doctor/prescriptions',
    description: 'Order & doorstep delivery',
  },
];

export function TreatmentFlowBanner({
  currentStep,
  isDoctor = false,
}: {
  currentStep: TreatmentStep;
  isDoctor?: boolean;
}) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mb-6 rounded-xl border border-brand-200/80 bg-gradient-to-r from-brand-50/70 via-white to-sky-50/60 p-4 shadow-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
            Connected Treatment Flow
          </span>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            End-to-end patient journey: Appointments, Consultations, Digital Prescriptions, Labs, Reminders & Online Pharmacy.
          </p>
        </div>
        {currentIndex < STEPS.length - 1 && STEPS[currentIndex + 1] ? (
          <Link
            to={isDoctor ? STEPS[currentIndex + 1]!.doctorPath : STEPS[currentIndex + 1]!.patientPath}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            Next: {STEPS[currentIndex + 1]!.label}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {/* Stepper track */}
      <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium scrollbar-thin">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = step.key === currentStep;
          const isDone = idx < currentIndex;
          const path = isDoctor ? step.doctorPath : step.patientPath;

          return (
            <div key={step.key} className="flex items-center shrink-0">
              <Link
                to={path}
                className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all ${
                  isCurrent
                    ? 'bg-brand-600 font-semibold text-white shadow-xs'
                    : isDone
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={step.description}
              >
                <Icon
                  className={`size-3.5 ${
                    isCurrent ? 'text-white' : isDone ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span>{step.label}</span>
                {isDone ? (
                  <span className="text-[10px] text-emerald-600 font-bold" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </Link>
              {idx < STEPS.length - 1 ? (
                <div className="mx-1 text-slate-300" aria-hidden="true">
                  →
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
