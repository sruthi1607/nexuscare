import { Info } from 'lucide-react';
import { QueryState } from '../../../components/common/QueryState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardBody } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/toast-context';
import { useAvailability, useUpdateAvailability } from '../api';
import { AvailabilityEditor } from '../components/AvailabilityEditor';

export function AvailabilityPage() {
  const query = useAvailability();
  const update = useUpdateAvailability();
  const { toast } = useToast();

  return (
    <>
      <PageHeader
        title="Availability"
        description="Your regular weekly consultation hours."
        breadcrumbs={[{ label: 'Dashboard', to: '/doctor' }, { label: 'Availability' }]}
      />
      <p className="mb-6 flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Patients will be able to book free slots inside these hours once appointment booking
        launches. Time off and one-off changes will be added with booking.
      </p>
      <QueryState
        query={query}
        errorTitle="Could not load your availability"
        loading={
          <Card aria-busy="true" aria-label="Loading availability">
            <CardBody className="space-y-3 py-6">
              {Array.from({ length: 7 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </CardBody>
          </Card>
        }
      >
        {(availability) => (
          <AvailabilityEditor
            availability={availability}
            onSave={async (value) => {
              await update.mutateAsync(value);
              toast({ tone: 'success', title: 'Availability saved' });
            }}
          />
        )}
      </QueryState>
    </>
  );
}
