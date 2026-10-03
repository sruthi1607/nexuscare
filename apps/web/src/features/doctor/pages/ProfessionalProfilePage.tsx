import { PageHeader } from '../../../components/layout/PageHeader';
import { ErrorState } from '../../../components/common/ErrorState';
import { Card, CardBody } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/toast-context';
import { ApiError } from '../../../lib/api-client';
import {
  useAvailability,
  useDoctorProfile,
  useSpecialties,
  useUpdateDoctorProfile,
} from '../api';
import { DoctorProfileForm } from '../components/DoctorProfileForm';
import { ProfileCompleteness } from '../components/ProfileCompleteness';

export function ProfessionalProfilePage() {
  const profile = useDoctorProfile();
  const specialties = useSpecialties();
  const availability = useAvailability();
  const update = useUpdateDoctorProfile();
  const { toast } = useToast();

  const failed = profile.error ?? specialties.error;
  const loading = profile.isPending || specialties.isPending;

  return (
    <>
      <PageHeader
        title="Professional profile"
        description="Your registration, specialties, qualifications and practice details."
        breadcrumbs={[{ label: 'Dashboard', to: '/doctor' }, { label: 'Professional profile' }]}
      />
      {failed ? (
        <ErrorState
          title="Could not load your professional profile"
          message={failed.message}
          requestId={failed instanceof ApiError ? failed.requestId : undefined}
          onRetry={() => {
            void profile.refetch();
            void specialties.refetch();
          }}
        />
      ) : loading ? (
        <Card aria-busy="true" aria-label="Loading professional profile">
          <CardBody className="space-y-4 py-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          <ProfileCompleteness
            profile={profile.data!}
            hasAvailability={(availability.data?.rules.length ?? 0) > 0}
          />
          <DoctorProfileForm
            profile={profile.data!}
            specialties={specialties.data!}
            onSubmit={async (values) => {
              await update.mutateAsync(values);
              toast({ tone: 'success', title: 'Professional profile saved' });
            }}
          />
        </div>
      )}
    </>
  );
}
