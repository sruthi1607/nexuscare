import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import {
  CalendarDays,
  Video,
  Clock,
  User,
  Plus,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const { appointments } = useTreatmentStore();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
  const [bookModalOpen, setBookModalOpen] = useState(false);

  // New appointment form state
  const [doctorName, setDoctorName] = useState('Dr. Arvind Mehta, MD');
  const [specialty, setSpecialty] = useState('Cardiology & Preventive Medicine');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:30 AM');
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<'video' | 'audio' | 'in_person'>('video');

  const filtered = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const handleStartOrJoin = (apt: (typeof appointments)[0]) => {
    treatmentStore.updateAppointmentStatus(apt.id, 'in_progress');
    void navigate(`/patient/consultations/${apt.consultationId ?? 'con-101'}`);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const scheduledAt = `${date}T${time.includes('PM') ? '14:00:00' : '10:00:00'}Z`;

    treatmentStore.addAppointment({
      doctorId: '00000000-0000-4000-8000-000000000002',
      doctorName,
      doctorSpecialty: specialty,
      patientId: '00000000-0000-4000-8000-000000000001',
      patientName: 'Sarah Jenkins',
      scheduledAt,
      durationMinutes: 30,
      mode,
      status: 'scheduled',
      reasonForVisit: reason.trim(),
    });

    setBookModalOpen(false);
    setReason('');
  };

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Book, manage, and join video consultations with your healthcare specialists."
        actions={
          <Button onClick={() => setBookModalOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Book Consultation
          </Button>
        }
      />

      {/* Connected Treatment Flow Stepper */}
      <TreatmentFlowBanner currentStep="appointment" />

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Appointments ({appointments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('scheduled')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'scheduled'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Upcoming & Scheduled (
            {appointments.filter((a) => a.status === 'scheduled' || a.status === 'in_progress').length}
            )
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Past Consultations ({appointments.filter((a) => a.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {filtered.map((apt) => {
          const isUpcoming = apt.status === 'scheduled' || apt.status === 'in_progress';
          const aptDate = new Date(apt.scheduledAt);

          return (
            <Card key={apt.id} className="p-5 transition-shadow hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold">
                    <Stethoscope className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{apt.doctorName}</h3>
                      <Badge
                        tone={
                          apt.status === 'in_progress'
                            ? 'warning'
                            : apt.status === 'completed'
                              ? 'success'
                              : 'brand'
                        }
                      >
                        {apt.status === 'in_progress'
                          ? '● In Progress'
                          : apt.status === 'completed'
                            ? 'Completed'
                            : 'Scheduled'}
                      </Badge>
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 capitalize">
                        <Video className="size-3 text-brand-600" />
                        {apt.mode} Visit
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-brand-700 mt-0.5">{apt.doctorSpecialty}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3.5 text-slate-400" />
                        {aptDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5 text-slate-400" />
                        {aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
                        {apt.durationMinutes} mins)
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="size-3.5 text-slate-400" />
                        Patient: {apt.patientName}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-md p-2 border border-slate-100">
                      <span className="font-semibold text-slate-700">Reason for visit: </span>
                      {apt.reasonForVisit}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  {isUpcoming ? (
                    <Button
                      onClick={() => handleStartOrJoin(apt)}
                      className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 font-semibold gap-1.5"
                    >
                      <Video className="size-4" />
                      {apt.status === 'in_progress' ? 'Re-join Consultation' : 'Join Consultation'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/patient/consultations/${apt.consultationId ?? 'con-100'}`)
                      }
                      className="w-full sm:w-auto gap-1"
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      View Summary
                    </Button>
                  )}
                  <Link
                    to="/patient/consultations"
                    className="text-xs text-slate-500 hover:text-brand-600 hover:underline"
                  >
                    Consultation history →
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
            <CalendarDays className="size-10 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No appointments found</p>
            <p className="text-xs text-slate-500 mt-1">Book an appointment to consult with a specialist.</p>
            <Button size="sm" onClick={() => setBookModalOpen(true)} className="mt-4">
              Book Consultation Now
            </Button>
          </div>
        ) : null}
      </div>

      {/* Booking Modal */}
      <Dialog open={bookModalOpen} onOpenChange={setBookModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Doctor Consultation</DialogTitle>
            <DialogDescription>
              Schedule a video or audio appointment with a verified healthcare specialist.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookAppointment} className="space-y-4 mt-2">
            <Field label="Choose Specialist" required>
              <Select
                value={doctorName}
                onChange={(e) => {
                  setDoctorName(e.target.value);
                  setSpecialty(
                    e.target.value.includes('Arvind')
                      ? 'Cardiology & Preventive Medicine'
                      : 'Internal Medicine & Primary Care',
                  );
                }}
                options={[
                  {
                    value: 'Dr. Arvind Mehta, MD',
                    label: 'Dr. Arvind Mehta, MD — Cardiology & Preventive Medicine',
                  },
                  {
                    value: 'Dr. Sarah Chen, MD',
                    label: 'Dr. Sarah Chen, MD — Internal Medicine & Primary Care',
                  },
                ]}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Preferred Date" required>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </Field>

              <Field label="Preferred Time" required>
                <Select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  options={[
                    { value: '10:00 AM', label: '10:00 AM' },
                    { value: '11:30 AM', label: '11:30 AM' },
                    { value: '02:00 PM', label: '02:00 PM' },
                    { value: '04:30 PM', label: '04:30 PM' },
                    { value: '06:00 PM', label: '06:00 PM' },
                  ]}
                />
              </Field>
            </div>

            <Field label="Consultation Mode" required>
              <Select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                options={[
                  { value: 'video', label: 'Video Call (Encrypted Telehealth)' },
                  { value: 'audio', label: 'Audio Consultation' },
                  { value: 'in_person', label: 'Clinic In-Person Visit' },
                ]}
              />
            </Field>

            <Field label="Reason for Visit / Symptoms" required>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms, duration, or any questions for the doctor..."
                required
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setBookModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!reason.trim()}>
                Confirm Booking
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
