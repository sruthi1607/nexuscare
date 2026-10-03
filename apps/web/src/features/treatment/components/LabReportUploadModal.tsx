import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Field } from '../../../components/ui/Field';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { treatmentStore } from '../treatment-store';
import type { LabTestResultItem, TreatmentRecord } from '../types';
import { UploadCloud, FileText, CheckCircle2, Lock } from 'lucide-react';

const RECORD_TYPES = [
  { value: 'lab_report', label: 'Laboratory Blood / Urine Test Report' },
  { value: 'imaging', label: 'Medical Imaging (X-Ray, MRI, CT, Ultrasound, ECG)' },
  { value: 'prescription_scan', label: 'Doctor Prescription Scan / Digital Copy' },
  { value: 'discharge_summary', label: 'Hospital Discharge Summary' },
  { value: 'clinical_note', label: 'Clinical Note / Consultation Summary' },
] as const;

export function LabReportUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdRecord: TreatmentRecord) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TreatmentRecord['type']>('lab_report');
  const [labOrClinic, setLabOrClinic] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0] ?? '2026-10-03');
  const [description, setDescription] = useState('');
  const [hiddenFromDoctors, setHiddenFromDoctors] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(340000);
  const [uploading, setUploading] = useState(false);
  const [preset, setPreset] = useState<'none' | 'cbc' | 'lipid' | 'thyroid'>('lipid');

  if (!isOpen) return null;

  const handleSimulatedFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setUploading(true);

    let testResults: LabTestResultItem[] | undefined;
    if (preset === 'lipid') {
      testResults = [
        { parameter: 'Total Cholesterol', value: 215, unit: 'mg/dL', referenceRange: '< 200 mg/dL', status: 'high' },
        { parameter: 'HDL (Good) Cholesterol', value: 48, unit: 'mg/dL', referenceRange: '> 40 mg/dL', status: 'normal' },
        { parameter: 'LDL (Bad) Cholesterol', value: 138, unit: 'mg/dL', referenceRange: '< 100 mg/dL', status: 'high' },
        { parameter: 'Triglycerides', value: 160, unit: 'mg/dL', referenceRange: '< 150 mg/dL', status: 'high' },
      ];
    } else if (preset === 'cbc') {
      testResults = [
        { parameter: 'Hemoglobin (Hb)', value: 13.8, unit: 'g/dL', referenceRange: '12.0 - 15.5 g/dL', status: 'normal' },
        { parameter: 'Total Leukocyte Count (WBC)', value: 6800, unit: '/cumm', referenceRange: '4,000 - 11,000', status: 'normal' },
        { parameter: 'Platelet Count', value: 245000, unit: '/cumm', referenceRange: '150,000 - 450,000', status: 'normal' },
      ];
    } else if (preset === 'thyroid') {
      testResults = [
        { parameter: 'TSH (Thyroid Stimulating Hormone)', value: 2.4, unit: 'uIU/mL', referenceRange: '0.4 - 4.2 uIU/mL', status: 'normal' },
        { parameter: 'Total T3', value: 110, unit: 'ng/dL', referenceRange: '80 - 200 ng/dL', status: 'normal' },
        { parameter: 'Free T4', value: 1.2, unit: 'ng/dL', referenceRange: '0.8 - 1.8 ng/dL', status: 'normal' },
      ];
    }

    setTimeout(() => {
      const record = treatmentStore.uploadMedicalRecord({
        patientId: '00000000-0000-4000-8000-000000000001',
        type,
        title: title.trim(),
        labOrClinic: labOrClinic.trim() || 'Central Diagnostic Services',
        recordDate,
        description: description.trim() || 'Uploaded diagnostic report and test findings.',
        sizeBytes: fileSize,
        mimeType: fileName?.endsWith('.png') || fileName?.endsWith('.jpg') ? 'image/jpeg' : 'application/pdf',
        hiddenFromDoctors,
        tags: [type.replace('_', ' '), preset !== 'none' ? preset.toUpperCase() : 'General'],
        uploadedBy: 'Sarah Jenkins (Patient)',
        testResults,
      });

      setUploading(false);
      onClose();
      if (onSuccess) onSuccess(record);
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="size-5 text-brand-600" />
            Upload Medical Record or Lab Report
          </DialogTitle>
          <DialogDescription>
            Securely upload diagnostic test reports, blood tests, prescription slips or imaging scans.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* File drop area */}
          <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-5 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/30">
            <input
              type="file"
              id="file-upload-input"
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              onChange={handleSimulatedFileDrop}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <div className="flex flex-col items-center">
              <UploadCloud className="size-8 text-brand-600 mb-2" />
              {fileName ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="size-4" />
                  <span>{fileName}</span>
                  <span className="text-xs text-slate-500 font-normal">({(fileSize / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse or drop your document here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, PNG, JPG scans up to 25 MB
                  </p>
                </>
              )}
            </div>
          </div>

          <Field label="Document Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fasting Lipid Profile & Glucose"
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Record Type" required>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as TreatmentRecord['type'])}
                options={RECORD_TYPES}
              />
            </Field>

            <Field label="Date of Test / Record" required>
              <Input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Diagnostic Facility / Clinic Name">
              <Input
                value={labOrClinic}
                onChange={(e) => setLabOrClinic(e.target.value)}
                placeholder="e.g. Quest Diagnostics / Metropolis"
              />
            </Field>

            <Field label="Preset Test Parameters">
              <Select
                value={preset}
                onChange={(e) => setPreset(e.target.value as any)}
                options={[
                  { value: 'lipid', label: 'Lipid Profile (Cholesterol, LDL, HDL, Triglycerides)' },
                  { value: 'cbc', label: 'Complete Blood Count (CBC, Hemoglobin, WBC)' },
                  { value: 'thyroid', label: 'Thyroid Function (TSH, T3, T4)' },
                  { value: 'none', label: 'No structured test data (document scan only)' },
                ]}
              />
            </Field>
          </div>

          <Field label="Clinical Notes / Findings (Optional)">
            <textarea
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add physician notes, observed values, or relevant symptoms..."
            />
          </Field>

          {/* Privacy checkbox */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <Checkbox
              id="privacy-check"
              checked={hiddenFromDoctors}
              onChange={(e) => setHiddenFromDoctors(e.target.checked)}
              label="Keep private (hide from consulting doctors)"
              description="When enabled, doctors will not be able to view this document in their patient records tab."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" loading={uploading} disabled={!title.trim()}>
              {uploading ? 'Processing & Saving…' : 'Upload Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
