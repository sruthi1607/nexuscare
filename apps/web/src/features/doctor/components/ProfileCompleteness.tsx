import { BadgeCheck, CheckCircle2, Circle } from 'lucide-react';
import type { DoctorProfile } from '@nexuscare/shared';
import { doctorProfileGaps } from '@nexuscare/shared';
import { Badge } from '../../../components/ui/Badge';
import { ButtonLink } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';

/**
 * Checklist of what a doctor still needs before verification and listing. Shared by the doctor
 * dashboard and the professional profile page.
 */
export function ProfileCompleteness({
  profile,
  hasAvailability,
  showActions = false,
}: {
  profile: DoctorProfile;
  hasAvailability: boolean;
  showActions?: boolean;
}) {
  const gaps = doctorProfileGaps(profile, hasAvailability);
  const total = 8;
  const done = total - gaps.length;

  return (
    <Card>
      <CardBody className="py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Profile completeness</h2>
            <p className="text-sm text-slate-600">
              {gaps.length === 0
                ? 'Everything needed for verification is in place.'
                : `${String(done)} of ${String(total)} complete — patients see your profile once it is complete and verified.`}
            </p>
          </div>
          {profile.verificationStatus === 'verified' ? (
            <Badge tone="success" icon={<BadgeCheck aria-hidden="true" />}>
              Verified
            </Badge>
          ) : (
            <Badge tone="warning">Verification {profile.verificationStatus}</Badge>
          )}
        </div>
        <div
          className="mt-4 h-2 rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Profile completeness"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
        >
          <div
            className="h-2 rounded-full bg-brand-600 transition-[width]"
            style={{ width: `${String((done / total) * 100)}%` }}
          />
        </div>
        {gaps.length > 0 ? (
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {gaps.map((gap) => (
              <li key={gap} className="flex items-center gap-2 text-slate-700">
                <Circle className="size-4 text-slate-400" aria-hidden="true" />
                {gap}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-sm text-success-700">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Profile complete
          </p>
        )}
        {showActions && gaps.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink to="/doctor/professional" size="sm">
              Complete professional profile
            </ButtonLink>
            {!hasAvailability ? (
              <ButtonLink to="/doctor/schedule" size="sm" variant="outline">
                Set availability
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
