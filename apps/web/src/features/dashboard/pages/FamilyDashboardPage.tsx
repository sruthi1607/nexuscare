import { HeartHandshake, ShieldCheck } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useCurrentUser } from '../../auth/auth-context';
import { firstName } from '../../../lib/names';

export function FamilyDashboardPage() {
  const user = useCurrentUser();
  return (
    <>
      <PageHeader
        title={`Hello, ${firstName(user.fullName)}`}
        description="Support the people you care for."
      />
      <EmptyState
        icon={<HeartHandshake aria-hidden="true" />}
        title="No one has linked their account to you yet"
        description="When a patient invites you as a caregiver and you accept, they will appear here with the information they have chosen to share."
      />
      <p className="mt-6 flex items-start gap-2 text-sm text-slate-600">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
        Patients decide exactly what you can see, and can change or revoke access at any time.
      </p>
    </>
  );
}
