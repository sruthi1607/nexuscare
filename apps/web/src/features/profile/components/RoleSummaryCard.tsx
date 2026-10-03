import { ArrowRight, BadgeCheck, HeartHandshake, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import { doctorProfileGaps, type AppRole } from '@nexuscare/shared';
import { SectionCard } from '../../../components/common/SectionCard';
import { Badge } from '../../../components/ui/Badge';
import { ButtonLink } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAvailability, useDoctorProfile } from '../../doctor/api';
import { useMedicalProfile } from '../../medical/api';

function PatientSummary() {
  const medical = useMedicalProfile();
  const data = medical.data;
  return (
    <SectionCard
      title="Medical information"
      description="Blood group, allergies, conditions, medicines and history."
      icon={<HeartPulse aria-hidden="true" />}
    >
      {medical.isPending ? (
        <Skeleton className="h-10 w-full" />
      ) : data ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ['Blood group', data.basics.bloodGroup ?? '—'],
              ['Allergies', String(data.allergies.length)],
              ['Conditions', String(data.conditions.length)],
              ['Medicines', String(data.medications.filter((m) => m.status === 'active').length)],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="text-lg font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-slate-600">Your medical information could not be loaded.</p>
      )}
      <ButtonLink to="/patient/medical" variant="outline" size="sm" className="mt-4">
        Manage medical information
        <ArrowRight aria-hidden="true" />
      </ButtonLink>
    </SectionCard>
  );
}

function DoctorSummary() {
  const profile = useDoctorProfile();
  const availability = useAvailability();
  const loading = profile.isPending || availability.isPending;
  const gaps =
    profile.data && availability.data
      ? doctorProfileGaps(profile.data, availability.data.rules.length > 0)
      : [];

  return (
    <SectionCard
      title="Professional profile"
      description="What patients will see once you are verified."
      icon={<Stethoscope aria-hidden="true" />}
    >
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : profile.data ? (
        <div className="flex flex-wrap items-center gap-2">
          {profile.data.verificationStatus === 'verified' ? (
            <Badge tone="success" icon={<BadgeCheck aria-hidden="true" />}>
              Verified
            </Badge>
          ) : (
            <Badge tone="warning">Verification {profile.data.verificationStatus}</Badge>
          )}
          {gaps.length === 0 ? (
            <Badge tone="brand">Profile complete</Badge>
          ) : (
            <Badge tone="neutral">{gaps.length} item(s) to complete</Badge>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-600">Your professional profile could not be loaded.</p>
      )}
      <ButtonLink to="/doctor/professional" variant="outline" size="sm" className="mt-4">
        Manage professional profile
        <ArrowRight aria-hidden="true" />
      </ButtonLink>
    </SectionCard>
  );
}

/** Role-specific block on the profile page. */
export function RoleSummaryCard({ role }: { role: AppRole }) {
  switch (role) {
    case 'patient':
      return <PatientSummary />;
    case 'doctor':
      return <DoctorSummary />;
    case 'caregiver':
      return (
        <SectionCard
          title="Caregiving"
          description="People who have linked their account to you."
          icon={<HeartHandshake aria-hidden="true" />}
        >
          <p className="text-sm text-slate-600">
            No patients have linked their account to you yet. When a patient invites you and you
            accept, you will see only the information they choose to share.
          </p>
        </SectionCard>
      );
    case 'admin':
      return (
        <SectionCard
          title="Administrator"
          description="Platform administration account."
          icon={<ShieldCheck aria-hidden="true" />}
        >
          <p className="text-sm text-slate-600">
            Admin accounts manage users, doctor verification and platform settings. They do not
            have access to patients’ clinical information.
          </p>
        </SectionCard>
      );
  }
}
