import { useState } from 'react';
import { CalendarDays, Video, Search, User, Stethoscope, Clock, CheckCircle2 } from 'lucide-react';
import { useTreatment } from '../../treatment/treatment-store';

export function AdminAppointmentsPage() {
  const { appointments } = useTreatment();
  const [filter, setFilter] = useState<string>('all');

  const filtered = appointments.filter((a) => filter === 'all' || a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Appointments Overview</h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor real-time telehealth visits and appointment bookings across the entire platform.
          </p>
        </div>

        <div className="flex gap-2">
          {['all', 'scheduled', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((apt) => (
          <div
            key={apt.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Video className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{apt.reasonForVisit}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      apt.status === 'scheduled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {apt.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <User className="size-3.5" /> Patient: {apt.patientName || 'Sarah Jenkins'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Stethoscope className="size-3.5" /> {apt.doctorName} ({apt.doctorSpecialty})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="size-3.5" /> {apt.scheduledAt.replace('T', ' ').slice(0, 16)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                ID: {apt.id}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
