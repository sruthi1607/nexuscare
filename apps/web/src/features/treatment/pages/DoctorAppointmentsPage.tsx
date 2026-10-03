import { useState } from 'react';
import { useNavigate } from 'react-router';
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
  CheckCircle2,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';

export function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const { appointments } = useTreatmentStore();

  const handleStartConsultation = (apt: (typeof appointments)[0]) => {
    treatmentStore.updateAppointmentStatus(apt.id, 'in_progress');
    void navigate(`/doctor/consultations?conId=${apt.consultationId ?? 'con-101'}`);
  };

  return (
    <>
      <PageHeader
        title="Doctor Consultation Agenda"
        description="Daily schedule of booked patient consultations, clinical intake notes, and direct video links."
      />

      <TreatmentFlowBanner currentStep="appointment" isDoctor={true} />

      <div className="space-y-4">
        {appointments.map((apt) => {
          const aptDate = new Date(apt.scheduledAt);
          const isPending = apt.status === 'scheduled' || apt.status === 'in_progress';

          return (
            <Card key={apt.id} className="p-5 transition-shadow hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold">
                    <User className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{apt.patientName}</h3>
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
                      <span className="text-xs text-slate-500 font-medium capitalize">
                        ({apt.mode} Visit • {apt.durationMinutes} mins)
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <CalendarDays className="size-3.5 text-slate-400" />
                        {aptDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <Clock className="size-3.5 text-slate-400" />
                        {aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                      <span className="font-semibold text-slate-900">Chief Reason: </span>
                      {apt.reasonForVisit}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  {isPending ? (
                    <Button
                      onClick={() => handleStartConsultation(apt)}
                      className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 font-semibold gap-1.5"
                    >
                      <Video className="size-4" />
                      {apt.status === 'in_progress' ? 'Resume Consultation' : 'Start Consultation'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/doctor/consultations?conId=${apt.consultationId ?? 'con-100'}`)
                      }
                      className="w-full sm:w-auto gap-1 text-xs"
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Review Consultation Notes
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
