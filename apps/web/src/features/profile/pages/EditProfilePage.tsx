import { useNavigate } from 'react-router';
import { QueryState } from '../../../components/common/QueryState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardBody } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/toast-context';
import { useCurrentUser } from '../../auth/auth-context';
import { profilePath, roleHomePath } from '../../auth/roles';
import { useProfile, useUpdateProfile } from '../api';
import { ProfileForm } from '../components/ProfileForm';

export function EditProfilePage() {
  const user = useCurrentUser();
  const query = useProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const back = profilePath(user.role);

  return (
    <>
      <PageHeader
        title="Edit profile"
        description="Update your personal details, contact information and preferences."
        breadcrumbs={[
          { label: 'Dashboard', to: roleHomePath(user.role) },
          { label: 'My profile', to: back },
          { label: 'Edit' },
        ]}
      />
      <QueryState
        query={query}
        errorTitle="Could not load your profile"
        loading={
          <Card aria-busy="true" aria-label="Loading profile">
            <CardBody className="space-y-4 py-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </CardBody>
          </Card>
        }
      >
        {(profile) => (
          <ProfileForm
            profile={profile}
            onCancel={() => void navigate(back)}
            onSubmit={async (values) => {
              await update.mutateAsync(values);
              toast({ tone: 'success', title: 'Profile saved' });
              void navigate(back);
            }}
          />
        )}
      </QueryState>
    </>
  );
}
