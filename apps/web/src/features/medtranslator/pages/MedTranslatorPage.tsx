import { useState } from 'react';
import {
  Languages,
  Upload,
  FileText,
  Sparkles,
  HelpCircle,
  BookmarkPlus,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Globe,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useMedTranslator, SAMPLE_REPORTS } from '../medtranslator-store';

export function MedTranslatorPage() {
  const {
    report,
    language,
    isProcessing,
    selectSample,
    setLanguage,
    uploadCustomFile,
    saveToMedicalRecords,
  } = useMedTranslator();

  const [activeTab, setActiveTab] = useState<'summary' | 'findings' | 'glossary'>('summary');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleSave = () => {
    saveToMedicalRecords();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadCustomFile(file.name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCustomFile(file.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">MedTranslator™</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-700/20">
              <Sparkles className="size-3 text-brand-600" /> AI Plain-Language Explainer
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Upload complex medical reports, blood tests, and scans to receive plain-language summaries and jargon breakdowns.
          </p>
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs">
          <Globe className="size-4 text-slate-400 ml-1.5" />
          {(
            [
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'es', label: 'Español' },
            ] as const
          ).map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                language === l.code
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone & Sample Report Selector */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upload Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            dragOver
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-300 bg-white hover:border-slate-400 shadow-xs'
          }`}
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Upload className="size-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Upload PDF, JPG, or PNG</h3>
          <p className="mt-1 text-xs text-slate-500">Drag & drop your lab sheet or discharge summary</p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-800">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              onChange={handleFileInput}
            />
          </label>
        </div>

        {/* Demo Samples Selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Or select a demo clinical report:
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {SAMPLE_REPORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSample(s.id)}
                className={`flex flex-col text-left rounded-xl border p-3.5 transition-all ${
                  report.id === s.id
                    ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-brand-700" />
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{s.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{s.facility} • {s.date}</p>
                <span className="mt-2 inline-flex self-start rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {s.reportType}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analysis Card */}
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-xs">
          <Loader2 className="size-8 animate-spin text-brand-600" />
          <h3 className="mt-4 text-base font-bold text-slate-900">Decoding Medical Terminology...</h3>
          <p className="mt-1 text-xs text-slate-500">
            Extracting biochemical reference intervals, identifying risk flags, and generating plain-language translation.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {/* Report Title Bar */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{report.title}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {report.reportType}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Source Document: {report.originalFileName} • {report.facility} • Dated {report.date}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-800 transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-300" /> Saved to Records
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="size-4" /> Save to My Medical Records
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 flex gap-2 border-b border-slate-100 pb-3">
            {[
              { id: 'summary', label: 'Plain Language Summary', icon: Sparkles },
              { id: 'findings', label: 'Key Findings & Flags', icon: CheckCircle2 },
              { id: 'glossary', label: 'Medical Jargon Glossary', icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Plain Language Summary */}
          {activeTab === 'summary' && (
            <div className="mt-5 space-y-5">
              <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
                <div className="flex items-center gap-2 text-brand-900 font-bold text-sm">
                  <Sparkles className="size-4 text-brand-600" />
                  <span>Executive Plain-Language Overview</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {report.plainSummary[language] || report.plainSummary.en}
                </p>
              </div>

              {/* Recommended Questions to Ask Doctor */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="size-4 text-brand-600" />
                  Suggested Questions for Your Next Doctor Consultation:
                </h4>
                <ul className="mt-2.5 space-y-1.5 text-xs text-slate-700">
                  {report.recommendedQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ArrowRight className="size-3.5 text-brand-600 mt-0.5 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Key Findings */}
          {activeTab === 'findings' && (
            <div className="mt-5 space-y-3">
              {report.keyFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{finding.parameter}</h4>
                      <p className="mt-0.5 text-xs font-semibold text-slate-700">{finding.value}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold self-start ${
                        finding.status === 'normal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : finding.status === 'attention'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {finding.status === 'normal'
                        ? '✓ In Normal Range'
                        : finding.status === 'attention'
                          ? '⚡ Needs Attention'
                          : '⚠️ Elevated / Action Needed'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-2">
                    {finding.plainExplanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Medical Jargon Glossary */}
          {activeTab === 'glossary' && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {report.medicalGlossary.map((gloss, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="text-sm font-bold text-slate-900">{gloss.term}</h4>
                  <div className="mt-2 text-xs space-y-1">
                    <p className="text-slate-500">
                      <strong className="text-slate-700">Clinical Definition:</strong>{' '}
                      {gloss.medicalDefinition}
                    </p>
                    <p className="text-brand-900 bg-brand-50 p-2 rounded-lg font-medium mt-1">
                      <strong>Plain Meaning:</strong> {gloss.plainLanguage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Informational Disclaimer Footer */}
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-600 text-xs leading-relaxed">
            <ShieldCheck className="size-4 shrink-0 text-slate-500 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> MedTranslator™ provides plain-language explanations for health literacy and patient empowerment. It does not provide medical diagnoses or replace consultations with licensed healthcare professionals.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
