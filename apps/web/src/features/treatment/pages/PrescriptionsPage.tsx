import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import { PrescriptionSlipModal } from '../components/PrescriptionSlipModal';
import {
  ClipboardList,
  ShoppingBag,
  BellRing,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Clock,
  Printer,
} from 'lucide-react';
import type { TreatmentPrescription } from '../types';

export function PrescriptionsPage() {
  const navigate = useNavigate();
  const { prescriptions } = useTreatmentStore();
  const [selectedRx, setSelectedRx] = useState<TreatmentPrescription | null>(null);
  const [syncedId, setSyncedId] = useState<string | null>(null);

  const handleOrderFromPharmacy = (rx: TreatmentPrescription) => {
    treatmentStore.loadPrescriptionIntoPharmacyCart(rx.id);
    void navigate('/patient/pharmacy/cart');
  };

  const handleSyncToReminders = (rx: TreatmentPrescription) => {
    treatmentStore.syncPrescriptionToMedications(rx.id);
    setSyncedId(rx.id);
    setTimeout(() => setSyncedId(null), 3000);
  };

  return (
    <>
      <PageHeader
        title="Prescriptions"
        description="View your digital prescriptions, synchronize medicines with your daily reminders, or order directly from partner pharmacies."
      />

      {/* Connected Treatment Flow Stepper */}
      <TreatmentFlowBanner currentStep="prescription" />

      {/* Prescriptions List */}
      <div className="space-y-6">
        {prescriptions.map((rx) => {
          const isSynced = syncedId === rx.id;

          return (
            <Card key={rx.id} className="p-6 transition-shadow hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <ClipboardList className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        Prescription #{rx.id.toUpperCase()}
                      </h3>
                      <Badge tone={rx.status === 'active' ? 'success' : 'brand'}>
                        ● {rx.status === 'active' ? 'Active' : 'Completed'}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-brand-700 mt-0.5">
                      {rx.doctorName} • {rx.doctorSpecialty}
                    </p>
                    <p className="text-[11px] text-slate-500">{rx.clinicName}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-slate-500 gap-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Calendar className="size-3.5 text-slate-400" />
                    Issued: {new Date(rx.issuedAt).toLocaleDateString()}
                  </span>
                  <span>Valid until: {rx.validUntil}</span>
                </div>
              </div>

              {/* Diagnosis info */}
              <div className="mt-3 rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Diagnosed Condition: </span>
                <span className="font-bold text-brand-900">{rx.diagnosis}</span>
              </div>

              {/* Prescribed Items Table */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Prescribed Medications ({rx.items.length})
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-100 font-semibold text-slate-700">
                      <tr>
                        <th className="px-4 py-2.5">Medicine & Strength</th>
                        <th className="px-4 py-2.5">Dosage</th>
                        <th className="px-4 py-2.5">Frequency</th>
                        <th className="px-4 py-2.5">Timing</th>
                        <th className="px-4 py-2.5">Duration</th>
                        <th className="px-4 py-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {rx.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {item.medicineName}{' '}
                            <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[10px] text-brand-800 font-semibold ml-1">
                              {item.strength}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{item.dosage}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.frequency}</td>
                          <td className="px-4 py-3 text-slate-600 capitalize">
                            {item.timing.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{item.duration}</td>
                          <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs">
                            {item.instructions || 'As advised'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions Footer: Connected Flow Actions */}
              <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRx(rx)}
                  className="gap-1.5 text-xs"
                >
                  <ClipboardList className="size-3.5" />
                  View Printable Slip
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncToReminders(rx)}
                    className="gap-1.5 text-xs"
                  >
                    {isSynced ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Added to Reminders!</span>
                      </>
                    ) : (
                      <>
                        <BellRing className="size-3.5 text-brand-600" />
                        <span>Sync to My Reminders</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleOrderFromPharmacy(rx)}
                    className="bg-brand-600 hover:bg-brand-700 font-semibold gap-1.5 text-xs"
                  >
                    <ShoppingBag className="size-3.5" />
                    <span>Order All from Pharmacy</span>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {prescriptions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-slate-50">
            <ClipboardList className="size-10 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No prescriptions found</p>
            <p className="text-xs text-slate-500 mt-1">
              Prescriptions issued by your doctor during consultations will be archived here.
            </p>
          </div>
        ) : null}
      </div>

      {/* Slip Modal */}
      {selectedRx ? (
        <PrescriptionSlipModal prescription={selectedRx} onClose={() => setSelectedRx(null)} />
      ) : null}
    </>
  );
}
