import { useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import { LabReportPreviewModal } from '../components/LabReportPreviewModal';
import {
  Users,
  User,
  HeartPulse,
  FileText,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Eye,
  Pill,
} from 'lucide-react';
import type { TreatmentRecord } from '../types';

export function DoctorPatientsPage() {
  const { records, medicines, consultations } = useTreatmentStore();
  const [selectedRecord, setSelectedRecord] = useState<TreatmentRecord | null>(null);

  // Doctors can only view records that are NOT hidden by patient privacy
  const sharedRecords = records.filter((r) => !r.hiddenFromDoctors);

  return (
    <>
      <PageHeader
        title="Consulted Patients & Clinical Records"
        description="Patient clinical profiles, shared diagnostic records, and active medications."
      />

      <TreatmentFlowBanner currentStep="records" isDoctor={true} />

      <div className="space-y-6">
        {/* Patient Profile Card: Sarah Jenkins */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-bold text-lg">
                SJ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-lg">Sarah Jenkins</h3>
                  <Badge tone="brand">Regular Patient</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Age: 42 Yrs • Gender: Female • Blood Group: A+ • Weight: 68.5 kg
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              <p>Last Consultation: <strong className="text-slate-800">{consultations[0]?.date || 'Today'}</strong></p>
              <p>Contact: +1 (555) 234-5678</p>
            </div>
          </div>

          {/* Clinical Highlights Strip */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Active Conditions:</span>
              <p className="text-brand-900 font-semibold">Stage 1 Essential Hypertension, Borderline Dyslipidemia</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Known Allergies:</span>
              <p className="text-rose-800 font-medium">Penicillin (Mild urticaria / skin rash)</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Active Regimen:</span>
              <p className="text-slate-700">
                {medicines.filter((m) => m.status === 'active').map((m) => m.name).join(', ')}
              </p>
            </div>
          </div>

          {/* Shared Diagnostic Lab Reports */}
          <div className="mt-6">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <FileText className="size-4 text-brand-600" />
                Shared Diagnostic Records & Lab Reports ({sharedRecords.length})
              </span>
              <span className="text-xs font-normal text-slate-500">
                (Privacy-filtered: Private documents hidden by patient)
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sharedRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-brand-300 hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">{rec.labOrClinic}</span>
                      <span>{rec.recordDate}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs mt-1">{rec.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{rec.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Eye className="size-3" /> Shared Record
                    </span>
                    <span className="font-semibold text-brand-600 hover:underline">
                      Review Findings →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {selectedRecord ? (
        <LabReportPreviewModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      ) : null}
    </>
  );
}
