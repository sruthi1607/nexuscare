import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { TreatmentPrescription } from '../types';
import { treatmentStore } from '../treatment-store';
import {
  ShoppingBag,
  BellRing,
  Printer,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

export function PrescriptionSlipModal({
  prescription,
  onClose,
}: {
  prescription: TreatmentPrescription | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [syncedMeds, setSyncedMeds] = useState(false);

  if (!prescription) return null;

  const handleOrderFromPharmacy = () => {
    treatmentStore.loadPrescriptionIntoPharmacyCart(prescription.id);
    onClose();
    void navigate('/patient/pharmacy/cart');
  };

  const handleSyncToReminders = () => {
    treatmentStore.syncPrescriptionToMedications(prescription.id);
    setSyncedMeds(true);
    setTimeout(() => setSyncedMeds(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 max-h-[92vh] flex flex-col">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-600 font-bold text-white text-xs">
              Rx
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Digital Prescription #{prescription.id.toUpperCase()}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Issued on {new Date(prescription.issuedAt).toLocaleDateString()} by {prescription.doctorName}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="size-3.5" />
              Print
            </Button>
          </div>
        </div>

        {/* Prescription Paper Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white print:p-0">
          {/* Clinic & Physician Banner */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900">{prescription.doctorName}</h3>
                <p className="text-xs font-semibold text-brand-700">{prescription.doctorSpecialty}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Reg No: <span className="font-mono font-medium text-slate-700">{prescription.doctorRegNumber}</span>
                </p>
                <p className="text-[11px] text-slate-500">{prescription.clinicName}</p>
              </div>
              <div className="text-right text-xs">
                <Badge tone="success" className="gap-1 mb-1">
                  <ShieldCheck className="size-3" /> VERIFIED DIGITAL RX
                </Badge>
                <p className="text-slate-500">Valid Until: <span className="font-medium text-slate-800">{prescription.validUntil}</span></p>
              </div>
            </div>
          </div>

          {/* Patient Details strip */}
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block">Patient Name</span>
              <span className="font-semibold text-slate-900">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Age & Gender</span>
              <span className="font-medium text-slate-900">{prescription.patientAge} Yrs / {prescription.patientGender}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Clinical Diagnosis</span>
              <span className="font-semibold text-brand-900">{prescription.diagnosis}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status</span>
              <span className="inline-flex items-center text-emerald-700 font-semibold">● Active</span>
            </div>
          </div>

          {/* Prescribed Medications */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
              <span className="font-serif italic text-brand-700 text-lg font-bold">℞</span> Prescribed Medicines
            </h4>

            <div className="space-y-3">
              {prescription.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.medicineName}</span>
                        <span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs font-semibold text-brand-800">
                          {item.strength}
                        </span>
                        <span className="text-xs text-slate-500">({item.dosage})</span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 mt-1">
                        Frequency: <span className="font-bold text-slate-900">{item.frequency}</span> • Timing:{' '}
                        <span className="capitalize">{item.timing.replace('_', ' ')}</span> • Duration:{' '}
                        <span className="font-medium">{item.duration}</span>
                      </p>
                    </div>
                  </div>
                  {item.instructions ? (
                    <div className="mt-2 text-xs text-slate-600 bg-white rounded border border-slate-200 px-2.5 py-1">
                      <span className="font-medium text-slate-700">Special Instructions:</span> {item.instructions}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* General Physician Instructions */}
          {prescription.generalInstructions ? (
            <div className="rounded-lg border border-slate-200 bg-amber-50/40 p-3 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Doctor's Advice & Lifestyle Guidance:</span>
              <p className="leading-relaxed">{prescription.generalInstructions}</p>
            </div>
          ) : null}

          {/* Digital Signature */}
          <div className="flex justify-between items-end border-t border-slate-200 pt-4 text-xs">
            <div className="text-slate-500 space-y-0.5">
              <p className="font-mono text-[11px]">NexusCare Cryptographic Signature Verified</p>
              <p className="font-mono text-[10px] text-slate-400">HASH: SHA256:7f92b492a81...VALID</p>
            </div>
            <div className="text-right">
              <div className="font-serif italic font-bold text-slate-800 text-sm border-b border-slate-300 pb-1">
                {prescription.doctorName}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Digitally Signed & Certified</p>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer: Direct connection to Pharmacy & Reminders */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncToReminders}
            className="w-full sm:w-auto"
          >
            {syncedMeds ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Synced to My Reminders!</span>
              </>
            ) : (
              <>
                <BellRing className="size-4 text-brand-600" />
                <span>Add to My Reminders</span>
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 font-semibold gap-1.5"
              onClick={handleOrderFromPharmacy}
            >
              <ShoppingBag className="size-4" />
              <span>Order via Online Pharmacy</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
