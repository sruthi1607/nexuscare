import { BarChart3, TrendingUp, Users, Video, ShoppingBag, ShieldCheck } from 'lucide-react';

export function AdminAnalyticsPage() {
  const specialtyBreakdown = [
    { name: 'Cardiology & Vascular', consultations: 142, percentage: 38 },
    { name: 'Endocrinology & Diabetes', consultations: 98, percentage: 26 },
    { name: 'General Internal Medicine', consultations: 84, percentage: 22 },
    { name: 'Dermatology', consultations: 52, percentage: 14 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Analytics & Growth</h1>
        <p className="mt-1 text-sm text-slate-600">
          Aggregated telehealth volume, consultation metrics, and clinical engagement indicators.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Tele-Visits</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">376</div>
          <span className="mt-1 block text-[11px] text-emerald-600 font-semibold">↑ 18% this month</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Avg Video Call Duration</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">14.2 min</div>
          <span className="mt-1 block text-[11px] text-slate-500 font-medium">99.8% uptime</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Med Adherence Rate</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">94.6%</div>
          <span className="mt-1 block text-[11px] text-emerald-600 font-semibold">↑ 4.2% platform wide</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Pharmacy Fulfillment</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">98.9%</div>
          <span className="mt-1 block text-[11px] text-emerald-600 font-semibold">Express 2-hr target met</span>
        </div>
      </div>

      {/* Specialty Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Consultation Volume by Clinical Specialty</h2>
        <div className="mt-4 space-y-4">
          {specialtyBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-900">{item.name}</span>
                <span className="text-slate-600">{item.consultations} visits ({item.percentage}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-700"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
