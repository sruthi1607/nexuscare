import type { ReactNode } from 'react';
import { Activity, ShieldCheck, Stethoscope, UserPlus, Users, UserX } from 'lucide-react';
import { ErrorState } from '../../../components/common/ErrorState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAdminOverview } from '../../admin/api';
import { ApiError } from '../../../lib/api-client';

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 [&_svg]:size-5">
          {icon}
        </span>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {value.toLocaleString()}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function LoadingStats() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading platform overview"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i}>
          <CardBody className="flex items-center gap-4">
            <Skeleton className="size-11" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, error, isPending, isFetching, refetch } = useAdminOverview();

  let content: ReactNode;
  if (isPending) {
    content = <LoadingStats />;
  } else if (error) {
    content = (
      <ErrorState
        title="Could not load the overview"
        message={error.message}
        requestId={error instanceof ApiError ? error.requestId : undefined}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  } else {
    content = (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total users"
            value={data.totalUsers}
            icon={<Users aria-hidden="true" />}
          />
          <StatCard
            label="Doctors awaiting verification"
            value={data.doctorsPendingVerification}
            icon={<ShieldCheck aria-hidden="true" />}
          />
          <StatCard
            label="New users (last 7 days)"
            value={data.newUsersLast7Days}
            icon={<UserPlus aria-hidden="true" />}
          />
          <StatCard
            label="Active sessions"
            value={data.activeSessions}
            icon={<Activity aria-hidden="true" />}
          />
          <StatCard
            label="Doctors"
            value={data.usersByRole.doctor}
            icon={<Stethoscope aria-hidden="true" />}
          />
          <StatCard
            label="Suspended or deactivated"
            value={data.suspendedUsers}
            icon={<UserX aria-hidden="true" />}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users by role</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(
                [
                  ['Patients', data.usersByRole.patient],
                  ['Doctors', data.usersByRole.doctor],
                  ['Family', data.usersByRole.caregiver],
                  ['Admins', data.usersByRole.admin],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-xl font-semibold text-slate-900">{value.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Aggregate figures only — no personal data."
      />
      {content}
    </>
  );
}
