import { Contact, MapPin, Pencil, UserRound } from 'lucide-react';
import type { Profile } from '@nexuscare/shared';
import { DescriptionList } from '../../../components/common/DescriptionList';
import { QueryState } from '../../../components/common/QueryState';
import { SectionCard } from '../../../components/common/SectionCard';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { ButtonLink } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  ageFromDateOfBirth,
  formatAddress,
  formatDate,
  languageLabel,
  sexLabel,
} from '../../../lib/format';
import { useCurrentUser } from '../../auth/auth-context';
import { ROLE_LABEL, profilePath, roleHomePath } from '../../auth/roles';
import { useProfile } from '../api';
import { AvatarUploader } from '../components/AvatarUploader';
import { RoleSummaryCard } from '../components/RoleSummaryCard';

function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      <Card>
        <CardBody className="flex items-center gap-4 py-6">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardBody>
      </Card>
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardBody className="space-y-3 py-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function ProfileDetails({ profile }: { profile: Profile }) {
  const age = ageFromDateOfBirth(profile.dateOfBirth);
  const memberSince = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(profile.memberSince));

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <AvatarUploader profile={profile} />
          <div className="text-center sm:text-right">
            <p className="text-lg font-semibold text-slate-900">{profile.fullName}</p>
            <p className="text-sm text-slate-600">{profile.email}</p>
            <div className="mt-2 flex justify-center gap-2 sm:justify-end">
              <Badge tone="brand">{ROLE_LABEL[profile.role]}</Badge>
              <Badge>Member since {memberSince}</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Personal details" icon={<UserRound aria-hidden="true" />}>
          <DescriptionList
            items={[
              { label: 'Full name', value: profile.fullName },
              {
                label: 'Date of birth',
                value: profile.dateOfBirth
                  ? `${formatDate(profile.dateOfBirth) ?? ''}${age !== null ? ` (${String(age)} years)` : ''}`
                  : null,
              },
              { label: 'Sex', value: sexLabel(profile.sex) },
              { label: 'Preferred language', value: languageLabel(profile.preferredLanguage) },
              { label: 'Time zone', value: profile.timezone.replaceAll('_', ' ') },
            ]}
          />
        </SectionCard>

        <SectionCard title="Contact information" icon={<Contact aria-hidden="true" />}>
          <DescriptionList
            items={[
              { label: 'Email', value: profile.email },
              { label: 'Phone', value: profile.phone },
              {
                label: 'Address',
                value: formatAddress(profile.address) ? (
                  <span className="whitespace-pre-line">{formatAddress(profile.address)}</span>
                ) : null,
                wide: true,
              },
            ]}
          />
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3.5" aria-hidden="true" />
            Your address helps match you with nearby clinics and pharmacies later.
          </p>
        </SectionCard>
      </div>

      <RoleSummaryCard role={profile.role} />
    </div>
  );
}

export function ProfilePage() {
  const user = useCurrentUser();
  const query = useProfile();

  return (
    <>
      <PageHeader
        title="My profile"
        description="Your personal and contact details."
        breadcrumbs={[{ label: 'Dashboard', to: roleHomePath(user.role) }, { label: 'My profile' }]}
        actions={
          <ButtonLink to={`${profilePath(user.role)}/edit`}>
            <Pencil aria-hidden="true" />
            Edit profile
          </ButtonLink>
        }
      />
      <QueryState query={query} loading={<ProfileSkeleton />} errorTitle="Could not load your profile">
        {(profile) => <ProfileDetails profile={profile} />}
      </QueryState>
    </>
  );
}
