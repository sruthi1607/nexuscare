import { Mail, Check, X, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useFamily } from '../family-store';

export function FamilyInvitationsPage() {
  const { invitations, acceptInvitation, declineInvitation } = useFamily();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Caregiver Invitations</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review and respond to caregiver invitations from patients seeking your care support.
        </p>
      </div>

      <div className="space-y-4">
        {invitations.map((inv) => (
          <div key={inv.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Invitation from {inv.inviterName} ({inv.relationship})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {inv.inviterEmail} • Sent on {inv.sentDate}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {inv.permissions.viewVitals && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        ✓ Vitals
                      </span>
                    )}
                    {inv.permissions.viewPrescriptions && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        ✓ Prescriptions
                      </span>
                    )}
                    {inv.permissions.receiveEmergencyAlerts && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        ✓ Emergency Alerts
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {inv.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => acceptInvitation(inv.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-800"
                    >
                      <Check className="size-4" /> Accept
                    </button>
                    <button
                      onClick={() => declineInvitation(inv.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <X className="size-4" /> Decline
                    </button>
                  </div>
                ) : (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      inv.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {inv.status === 'accepted' ? 'Accepted' : 'Declined'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
