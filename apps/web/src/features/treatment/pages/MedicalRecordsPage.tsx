import { useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { useTreatmentStore, treatmentStore } from '../treatment-store';
import { TreatmentFlowBanner } from '../components/TreatmentFlowBanner';
import { LabReportPreviewModal } from '../components/LabReportPreviewModal';
import { LabReportUploadModal } from '../components/LabReportUploadModal';
import {
  FileText,
  UploadCloud,
  Search,
  Eye,
  EyeOff,
  Filter,
  Activity,
  Calendar,
  Building2,
  Download,
  ShieldCheck,
} from 'lucide-react';
import type { TreatmentRecord } from '../types';

export function MedicalRecordsPage() {
  const { records } = useTreatmentStore();
  const [selectedRecord, setSelectedRecord] = useState<TreatmentRecord | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TreatmentRecord['type']>('all');

  const filtered = records.filter((rec) => {
    if (typeFilter !== 'all' && rec.type !== typeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.title.toLowerCase().includes(q) ||
      rec.labOrClinic.toLowerCase().includes(q) ||
      rec.description.toLowerCase().includes(q) ||
      rec.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <PageHeader
        title="Medical Records & Diagnostic Reports"
        description="Access and upload your laboratory tests, imaging scans, pathology findings, and clinical documentation."
        actions={
          <Button onClick={() => setUploadModalOpen(true)} className="gap-1.5">
            <UploadCloud className="size-4" />
            Upload Report / Scan
          </Button>
        }
      />

      {/* Connected Treatment Flow Stepper */}
      <TreatmentFlowBanner currentStep="records" />

      {/* Search and Filters Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test name, clinic, or findings..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors shrink-0 ${
              typeFilter === 'all'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Documents ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('lab_report')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors shrink-0 ${
              typeFilter === 'lab_report'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Lab Reports
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('imaging')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors shrink-0 ${
              typeFilter === 'imaging'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Imaging & ECG
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('prescription_scan')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition-colors shrink-0 ${
              typeFilter === 'prescription_scan'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Prescriptions
          </button>
        </div>
      </div>

      {/* Medical Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((record) => {
          const hasAbnormalValues = record.testResults?.some((t) => t.status !== 'normal');

          return (
            <Card
              key={record.id}
              className="flex flex-col justify-between p-5 transition-all hover:shadow-md hover:border-brand-300 cursor-pointer group"
              onClick={() => setSelectedRecord(record)}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-100 transition-colors">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {record.hiddenFromDoctors ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <EyeOff className="size-3" /> Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Eye className="size-3" /> Shared with Doctors
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-3 font-bold text-slate-900 text-sm group-hover:text-brand-700 transition-colors">
                  {record.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Building2 className="size-3.5 text-slate-400" />
                  {record.labOrClinic}
                </p>

                <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {record.description}
                </p>

                {/* Structured parameters preview */}
                {record.testResults && record.testResults.length > 0 ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-[11px] space-y-1">
                    <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider">
                      Key Biomarkers:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {record.testResults.slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          className={`rounded px-1.5 py-0.5 font-medium ${
                            r.status === 'normal'
                              ? 'bg-white text-slate-800 border border-slate-200'
                              : 'bg-amber-100 text-amber-900 font-bold'
                          }`}
                        >
                          {r.parameter}: {r.value} {r.unit}
                        </span>
                      ))}
                      {record.testResults.length > 3 ? (
                        <span className="text-slate-400 self-center">
                          +{record.testResults.length - 3} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {record.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5 text-slate-400" />
                  {record.recordDate}
                </span>
                <span className="font-semibold text-brand-600 group-hover:underline">
                  View Full Report →
                </span>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center bg-slate-50">
            <FileText className="size-10 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No medical records match your search</p>
            <p className="text-xs text-slate-500 mt-1">Upload reports or clear search filters.</p>
            <Button size="sm" onClick={() => setUploadModalOpen(true)} className="mt-4">
              Upload New Record
            </Button>
          </div>
        ) : null}
      </div>

      {/* Modals */}
      {selectedRecord ? (
        <LabReportPreviewModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      ) : null}

      <LabReportUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={(created) => setSelectedRecord(created)}
      />
    </>
  );
}
