import { BookOpen, ShieldCheck, CheckCircle2, Globe, Database, ExternalLink } from 'lucide-react';

export function AdminKnowledgePage() {
  const sources = [
    {
      name: 'Mayo Clinic Clinical Monograph System',
      coverage: 'Cardiovascular, Metabolic, Pharmacology',
      evidenceGrade: 'Grade A Consensus',
      status: 'Active & Verified',
      articlesIndexed: '4,280+',
      lastSync: 'Today, 04:00 AM',
    },
    {
      name: 'American Heart Association (AHA) Guidelines 2026',
      coverage: 'Hypertension, Arrhythmia, Lipid Optimization',
      evidenceGrade: 'Class I Recommendation',
      status: 'Active & Verified',
      articlesIndexed: '1,890+',
      lastSync: 'Yesterday',
    },
    {
      name: 'American Diabetes Association (ADA) Standards of Care',
      coverage: 'HbA1c Targets, Biguanides, Hypoglycemia Triage',
      evidenceGrade: 'Grade A Consensus',
      status: 'Active & Verified',
      articlesIndexed: '2,150+',
      lastSync: '3 days ago',
    },
    {
      name: 'World Health Organization (WHO) Essential Medicines',
      coverage: 'Global Formulary & Critical Triage Warnings',
      evidenceGrade: 'International Standard',
      status: 'Active & Verified',
      articlesIndexed: '980+',
      lastSync: 'Weekly sync',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Knowledge Base & Medical Sources</h1>
        <p className="mt-1 text-sm text-slate-600">
          Licensed, peer-reviewed clinical knowledge libraries powering the Nexus AI Healthcare Assistant.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sources.map((src, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{src.name}</h3>
                  <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                    {src.evidenceGrade}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="size-3" /> Active
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              <strong>Clinical Domains:</strong> {src.coverage}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
              <span>{src.articlesIndexed} clinical entities</span>
              <span>Synced {src.lastSync}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
