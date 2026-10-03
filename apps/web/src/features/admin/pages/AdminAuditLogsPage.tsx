import { ScrollText, ShieldCheck, Lock, UserCheck, FileCheck, Clock } from 'lucide-react';

export function AdminAuditLogsPage() {
  const auditLogs = [
    {
      id: 'aud-1',
      action: 'Doctor Verification Approved',
      performedBy: 'System Administrator (admin@nexuscare.example)',
      target: 'Dr. Arvind Mehta, MD (MCI-REG-2008-11234)',
      timestamp: '2026-10-03T15:20:00.000Z',
      ip: '192.168.1.1',
      status: 'Success',
    },
    {
      id: 'aud-2',
      action: 'Digital Prescription Signed & Issued',
      performedBy: 'Dr. Arvind Mehta, MD',
      target: 'Sarah Jenkins (Rx: Metformin + Atorvastatin)',
      timestamp: '2026-10-03T14:45:00.000Z',
      ip: '192.168.1.45',
      status: 'Success',
    },
    {
      id: 'aud-3',
      action: 'Caregiver Authorization Granted',
      performedBy: 'Sarah Jenkins (patient@nexuscare.example)',
      target: 'David Jenkins (Caregiver permissions granted)',
      timestamp: '2026-10-02T18:00:00.000Z',
      ip: '192.168.1.88',
      status: 'Success',
    },
    {
      id: 'aud-4',
      action: 'Medical Record Decoded & Saved',
      performedBy: 'Sarah Jenkins (via MedTranslator)',
      target: 'Lipid & Metabolic Profile (Apex Reference Labs)',
      timestamp: '2026-10-02T16:30:00.000Z',
      ip: '192.168.1.88',
      status: 'Success',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Security & Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Immutable audit trail recording administrative, clinical, and data access events.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-4 py-3.5">Actor / Operator</th>
                <th className="px-4 py-3.5">Resource Target</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Client IP</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{log.action}</td>
                  <td className="px-4 py-3.5 text-slate-700">{log.performedBy}</td>
                  <td className="px-4 py-3.5 text-slate-600">{log.target}</td>
                  <td className="px-4 py-3.5 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">{log.ip}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
