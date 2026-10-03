import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { TreatmentRecord } from '../types';
import { Printer, Download, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { treatmentStore } from '../treatment-store';

export function LabReportPreviewModal({
  record,
  onClose,
}: {
  record: TreatmentRecord | null;
  onClose: () => void;
}) {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleToggleDoctorPrivacy = () => {
    treatmentStore.toggleRecordPrivacy(record.id);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900">{record.title}</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {record.labOrClinic} • Date of Record: {record.recordDate}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleDoctorPrivacy}
              title={record.hiddenFromDoctors ? 'Make visible to doctors' : 'Hide from doctors'}
            >
              {record.hiddenFromDoctors ? (
                <>
                  <EyeOff className="size-3.5 text-amber-600" />
                  <span className="text-xs text-amber-700">Hidden from Doctors</span>
                </>
              ) : (
                <>
                  <Eye className="size-3.5 text-emerald-600" />
                  <span className="text-xs text-emerald-700">Shared with Doctors</span>
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button size="sm" onClick={() => alert('Diagnostic report PDF downloaded successfully.')}>
              <Download className="size-3.5" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Diagnostic Report Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white print:p-0">
          {/* Authentic Lab Diagnostic Header */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                  <span>METROPOLIS DIAGNOSTIC SERVICES</span>
                  <Badge tone="success" className="text-[10px] gap-1">
                    <ShieldCheck className="size-3" /> NABL & CAP ACCREDITED
                  </Badge>
                </h3>
                <p className="text-xs text-slate-500">
                  Central Diagnostic Hub & Laboratory • ISO 15189 Certified
                </p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="font-medium text-slate-900">Lab ID: #LAB-2026-99214</p>
                <p>Sample Collection: Fasting (12 hrs)</p>
              </div>
            </div>

            {/* Patient Meta Strip */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Patient Name</span>
                <span className="font-semibold text-slate-900">Sarah Jenkins</span>
              </div>
              <div>
                <span className="text-slate-500 block">Age / Gender</span>
                <span className="font-medium text-slate-900">42 Yrs / Female</span>
              </div>
              <div>
                <span className="text-slate-500 block">Referred By</span>
                <span className="font-medium text-slate-900">{record.uploadedBy || 'Dr. Arvind Mehta, MD'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Reported Date</span>
                <span className="font-medium text-slate-900">{record.recordDate}</span>
              </div>
            </div>
          </div>

          {/* Test Results Table if present */}
          {record.testResults && record.testResults.length > 0 ? (
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Investigation Results
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">Investigation (Test Parameter)</th>
                      <th className="px-4 py-2.5">Observed Value</th>
                      <th className="px-4 py-2.5">Biological Reference Interval</th>
                      <th className="px-4 py-2.5">Unit</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {record.testResults.map((result, idx) => (
                      <tr key={idx} className={result.status !== 'normal' ? 'bg-amber-50/40' : undefined}>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{result.parameter}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">
                          {result.value}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{result.referenceRange}</td>
                        <td className="px-4 py-2.5 text-slate-500">{result.unit}</td>
                        <td className="px-4 py-2.5">
                          {result.status === 'normal' ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                              Normal
                            </span>
                          ) : result.status === 'high' ? (
                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                              ▲ High
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                              ▼ Low
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center bg-slate-50">
              <p className="text-sm font-medium text-slate-700">{record.description}</p>
              <p className="mt-1 text-xs text-slate-500">
                Document type: {record.type.replace('_', ' ').toUpperCase()} • Size: {(record.sizeBytes / 1024).toFixed(0)} KB
              </p>
            </div>
          )}

          {/* Clinical Interpretation & Pathologist Sign-Off */}
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
            <h5 className="text-xs font-bold uppercase text-slate-700">Clinical Pathologist Notes</h5>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {record.description ||
                'Findings are correlated with clinical history. Borderline lipid elevations indicate cardiovascular risk assessment. Please consult the prescribing specialist for therapeutic titration.'}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-900">Dr. K. S. Ramanathan, MD (Pathology)</p>
                <p>Chief of Clinical Biochemistry & Diagnostics</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] text-slate-400">Electronically Verified • Stamp #9914</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
