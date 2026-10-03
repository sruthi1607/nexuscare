import { useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import { PrescriptionSlipModal } from '../components/PrescriptionSlipModal';
import { ClipboardList, User, Calendar, ShieldCheck, Plus } from 'lucide-react';
import type { TreatmentPrescription } from '../types';

export function DoctorPrescriptionsPage() {
  const { prescriptions } = useTreatmentStore();
  const [selectedRx, setSelectedRx] = useState<TreatmentPrescription | null>(null);

  return (
    <>
      <PageHeader
        title="Doctor Digital Prescriptions"
        description="Prescriptions signed and issued across your clinical consultations."
      />

      <TreatmentFlowBanner currentStep="prescription" isDoctor={true} />

      <div className="space-y-4">
        {prescriptions.map((rx) => (
          <Card key={rx.id} className="p-5 transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold">
                  Rx
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      Prescription #{rx.id.toUpperCase()}
                    </h3>
                    <Badge tone="success" className="gap-1 text-[10px]">
                      <ShieldCheck className="size-3" /> Signed & Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Patient: <strong className="text-slate-900">{rx.patientName}</strong> ({rx.patientAge} Yrs / {rx.patientGender})
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end text-xs text-slate-500 gap-1">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Calendar className="size-3.5 text-slate-400" />
                  Date: {new Date(rx.issuedAt).toLocaleDateString()}
                </span>
                <span>Valid until: {rx.validUntil}</span>
              </div>
            </div>

            <div className="mt-3 text-xs">
              <span className="text-slate-500 font-medium">Indication / Diagnosis: </span>
              <span className="font-semibold text-brand-900">{rx.diagnosis}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {rx.items.map((item, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-800"
                >
                  <strong>{item.medicineName}</strong> {item.strength} ({item.frequency})
                </span>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                Reg: {rx.doctorRegNumber} • {rx.clinicName}
              </span>
              <Button size="sm" variant="outline" onClick={() => setSelectedRx(rx)} className="gap-1">
                <ClipboardList className="size-3.5" />
                View Full Signed Slip
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedRx ? (
        <PrescriptionSlipModal prescription={selectedRx} onClose={() => setSelectedRx(null)} />
      ) : null}
    </>
  );
}
