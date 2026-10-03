/**
 * Decorative product illustrations for the marketing pages. They are hidden from assistive
 * technology, use generic labels (no invented people or records) and do not represent live data.
 */
import type { ReactNode } from 'react';
import {
  Activity,
  BellRing,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  Mic,
  Pill,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  User,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import { cn } from '../../../lib/cn';

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative rounded-2xl border border-slate-200 bg-white p-4 shadow-overlay sm:p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Row({
  icon,
  title,
  meta,
  trailing,
  tone = 'brand',
}: {
  icon: ReactNode;
  title: string;
  meta: string;
  trailing?: ReactNode;
  tone?: 'brand' | 'info' | 'warning' | 'success';
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    info: 'bg-info-50 text-info-700',
    warning: 'bg-warning-50 text-warning-700',
    success: 'bg-success-50 text-success-700',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
      <span
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tones[tone])}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{title}</p>
        <p className="truncate text-xs text-slate-500">{meta}</p>
      </div>
      {trailing}
    </div>
  );
}

function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-100 via-white to-info-50"
      />
      <Frame className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Today</p>
          <Chip className="bg-slate-100 text-slate-500">Illustration</Chip>
        </div>
        <Row
          icon={<Video className="size-4" />}
          title="Video consultation"
          meta="General physician · 10:30"
          trailing={<Chip className="bg-brand-700 text-white">Join</Chip>}
        />
        <Row
          icon={<Pill className="size-4" />}
          title="Morning medicines"
          meta="Reminder · 08:00"
          tone="success"
          trailing={<CheckCircle2 className="size-5 text-success-600" />}
        />
        <Row
          icon={<HeartPulse className="size-4" />}
          title="Heart rate"
          meta="Connected device · within your range"
          tone="info"
          trailing={<span className="text-sm font-semibold text-slate-900">72 bpm</span>}
        />
        <Row
          icon={<Users className="size-4" />}
          title="Family access"
          meta="2 caregivers · you control what they see"
          tone="warning"
        />
      </Frame>
    </div>
  );
}

export function TelemedicineVisual() {
  return (
    <Frame className="overflow-hidden p-0 sm:p-0">
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
          <span className="flex size-16 items-center justify-center rounded-full bg-slate-700">
            <Stethoscope className="size-8" />
          </span>
          <p className="mt-3 text-sm">Your doctor</p>
        </div>
        <div className="absolute right-3 bottom-3 flex h-20 w-28 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-slate-300">
          <User className="size-7" />
        </div>
        <Chip className="absolute top-3 left-3 bg-white/15 text-white">Audio-only available</Chip>
      </div>
      <div className="flex items-center justify-center gap-3 bg-white p-3">
        {[Mic, VideoOff].map((Icon, i) => (
          <span
            key={i}
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          >
            <Icon className="size-4" />
          </span>
        ))}
        <span className="rounded-full bg-danger-600 px-4 py-2 text-xs font-semibold text-white">
          End call
        </span>
      </div>
    </Frame>
  );
}

export function AppointmentsVisual() {
  const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  return (
    <Frame>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Choose a time</p>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <CalendarDays className="size-3.5" /> Next available
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {slots.map((slot, i) => (
          <span
            key={slot}
            className={cn(
              'rounded-lg border px-2 py-2 text-center text-sm font-medium',
              i === 3
                ? 'border-brand-600 bg-brand-700 text-white'
                : i === 1
                  ? 'border-slate-100 bg-slate-50 text-slate-300 line-through'
                  : 'border-slate-200 text-slate-700',
            )}
          >
            {slot}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-xs text-brand-800">
        <BellRing className="size-4 shrink-0" />
        Reminders before your appointment. Reschedule or cancel in a tap.
      </div>
    </Frame>
  );
}

export function RecordsVisual() {
  const docs = [
    { name: 'Blood test report', type: 'Lab report' },
    { name: 'Chest X-ray', type: 'Imaging' },
    { name: 'Discharge summary', type: 'Hospital document' },
  ];
  return (
    <Frame className="space-y-2">
      {docs.map((doc) => (
        <Row
          key={doc.name}
          icon={<FileText className="size-4" />}
          title={doc.name}
          meta={doc.type}
          tone="info"
          trailing={<ShieldCheck className="size-4 text-slate-400" />}
        />
      ))}
      <p className="pt-1 text-center text-xs text-slate-500">
        Encrypted storage · you control access
      </p>
    </Frame>
  );
}

export function MedicationVisual() {
  const doses = [
    { time: '08:00', label: 'After breakfast', done: true },
    { time: '14:00', label: 'After lunch', done: true },
    { time: '20:00', label: 'After dinner', done: false },
  ];
  return (
    <Frame>
      <p className="text-sm font-semibold text-slate-900">Today’s doses</p>
      <ol className="mt-4 space-y-3">
        {doses.map((dose) => (
          <li key={dose.time} className="flex items-center gap-3">
            <span className="w-12 text-sm font-medium text-slate-500">{dose.time}</span>
            <span className="h-px flex-1 bg-slate-100" />
            <span className="text-sm text-slate-700">{dose.label}</span>
            {dose.done ? (
              <CheckCircle2 className="size-5 text-success-600" />
            ) : (
              <Clock className="size-5 text-slate-400" />
            )}
          </li>
        ))}
      </ol>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Weekly adherence</span>
          <span>Example</span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-slate-100">
          <div className="h-2 w-4/5 rounded-full bg-brand-600" />
        </div>
      </div>
    </Frame>
  );
}

export function AssistantVisual() {
  return (
    <Frame className="space-y-3">
      <div className="ml-auto w-4/5 rounded-2xl rounded-br-sm bg-brand-700 px-4 py-2.5 text-sm text-white">
        What does a high cholesterol result mean?
      </div>
      <div className="flex gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Bot className="size-4" />
        </span>
        <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
          Cholesterol is a type of fat in your blood. Your doctor will interpret your result
          alongside your overall health
          <sup className="ml-0.5 font-semibold text-brand-700">[1]</sup>.
          <p className="mt-2 text-xs text-slate-500">
            Source citations · General information, not a diagnosis
          </p>
        </div>
      </div>
    </Frame>
  );
}

export function MonitoringVisual() {
  const bars = [40, 55, 48, 62, 58, 70, 52, 60, 66, 57, 63, 59];
  return (
    <Frame>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Activity className="size-4 text-brand-700" /> Vitals
        </p>
        <Chip className="bg-warning-50 text-warning-700">Simulated example</Chip>
      </div>
      <div className="mt-4 flex h-24 items-end gap-1.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t bg-brand-200"
            style={{ height: `${String(h)}%` }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { icon: <HeartPulse className="size-4" />, label: 'Heart rate' },
          { icon: <Activity className="size-4" />, label: 'SpO₂' },
          { icon: <Thermometer className="size-4" />, label: 'Temperature' },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-slate-50 p-2 text-slate-600">
            <span className="mx-auto flex w-fit text-brand-700">{m.icon}</span>
            <p className="mt-1 text-[11px]">{m.label}</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function FamilyVisual() {
  const scopes = [
    { label: 'Appointments', on: true },
    { label: 'Medication reminders', on: true },
    { label: 'Emergency alerts', on: true },
    { label: 'Medical records', on: false },
  ];
  return (
    <Frame>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-warning-50 text-warning-700">
          <Users className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Caregiver permissions</p>
          <p className="text-xs text-slate-500">Nothing is shared until you allow it</p>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-slate-100">
        {scopes.map((scope) => (
          <li key={scope.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-slate-700">{scope.label}</span>
            <span
              className={cn(
                'flex h-5 w-9 items-center rounded-full p-0.5 transition-colors',
                scope.on ? 'justify-end bg-brand-600' : 'justify-start bg-slate-200',
              )}
            >
              <span className="size-4 rounded-full bg-white shadow" />
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
