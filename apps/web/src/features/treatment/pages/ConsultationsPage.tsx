import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import { PrescriptionSlipModal } from '../components/PrescriptionSlipModal';
import {
  Video,
  ClipboardList,
  Activity,
  CalendarDays,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { TreatmentPrescription } from '../types';

export function ConsultationsPage() {
  const navigate = useNavigate();
  const { consultations, prescriptions, records } = useTreatmentStore();
  const [selectedPrescription, setSelectedPrescription] = useState<TreatmentPrescription | null>(
    null,
  );

  return (
    <>
      <PageHeader
        title="Consultation History"
        description="Review consultation notes, diagnoses, physiological vitals, and physician recommendations."
      />

      <TreatmentFlowBanner currentStep="consultation" />

      <div className="space-y-6">
        {consultations.map((con) => {
          const rxList = prescriptions.filter(
            (p) => p.consultationId === con.id || con.prescriptionsIssued.includes(p.id),
          );

          return (
            <Card key={con.id} className="p-6 transition-shadow hover:shadow-md">
              {/* Consultation header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <Video className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{con.doctorName}</h3>
                      <Badge
                        tone={
                          con.status === 'in_progress'
                            ? 'warning'
                            : con.status === 'completed'
                              ? 'success'
                              : 'brand'
                        }
                      >
                        {con.status === 'in_progress'
                          ? '● In Progress'
                          : con.status === 'completed'
                            ? 'Completed'
                            : 'Scheduled'}
                      </Badge>
                      <span className="text-xs text-slate-500 font-medium capitalize">
                        ({con.mode} Consultation)
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">{con.doctorSpecialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <CalendarDays className="size-3.5 text-slate-400" />
                    {con.date}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/patient/consultations/${con.id}`)}
                    className="gap-1.5"
                  >
                    <Video className="size-3.5" />
                    {con.status === 'completed' ? 'Review Consultation Room' : 'Enter Consultation Room'}
                  </Button>
                </div>
              </div>

              {/* Patient Vitals captured */}
              {con.vitals ? (
                <div className="mt-4 rounded-xl bg-slate-50/80 p-3.5 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Activity className="size-3.5 text-brand-600" /> Recorded Clinical Vitals
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 block text-[11px]">Blood Pressure</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {con.vitals.bpSystolic}/{con.vitals.bpDiastolic} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 block text-[11px]">Heart Rate</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {con.vitals.heartRate} <span className="text-[10px] font-normal text-slate-500">bpm</span>
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 block text-[11px]">Oxygen (SpO2)</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {con.vitals.spo2}%
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 block text-[11px]">Temperature</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {con.vitals.temperatureF}°F
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 block text-[11px]">Body Weight</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {con.vitals.weightKg} <span className="text-[10px] font-normal text-slate-500">kg</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Clinical Notes & Diagnosis */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg border border-slate-200 p-3 bg-white">
                  <span className="font-bold text-slate-800 block mb-1">Chief Complaints:</span>
                  <p className="text-slate-600 leading-relaxed">{con.chiefComplaint || 'None specified'}</p>

                  <span className="font-bold text-slate-800 block mt-3 mb-1">Confirmed Diagnosis:</span>
                  <p className="font-semibold text-brand-900 bg-brand-50 p-2 rounded border border-brand-200">
                    {con.diagnosis || 'Pending physical examination & investigations'}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 bg-white">
                  <span className="font-bold text-slate-800 block mb-1">Doctor’s Clinical Notes:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {con.clinicalNotes ||
                      'Physician will record detailed findings and medication advice during the video visit.'}
                  </p>
                  {con.followUpDate ? (
                    <p className="mt-2 text-slate-500">
                      Recommended Follow-Up Date: <span className="font-medium text-slate-800">{con.followUpDate}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Linked Prescriptions & Lab orders */}
              {rxList.length > 0 && rxList[0] ? (
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="size-4 text-brand-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Digital Prescription Available ({rxList.length})
                    </span>
                    <span className="text-xs text-slate-500">
                      {rxList[0]?.items.map((i) => i.medicineName).join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rxList[0] && setSelectedPrescription(rxList[0])}
                      className="text-xs gap-1"
                    >
                      <ClipboardList className="size-3.5" />
                      View Prescription Slip
                    </Button>
                    <Link
                      to="/patient/pharmacy"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      Order via Pharmacy <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>

      {/* Prescription Slip Modal */}
      {selectedPrescription ? (
        <PrescriptionSlipModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      ) : null}
    </>
  );
}
