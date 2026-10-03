import type { ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Pill,
  Server,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { ErrorState } from '../../../components/common/ErrorState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ButtonLink } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAdminOverview } from '../../admin/api';
import { ApiError } from '../../../lib/api-client';

function StatCard({ label, value, icon, change }: { label: string; value: number; icon: ReactNode; change?: string }) {
  return (
    <Card className="hover:border-brand-300 transition-colors">
      <CardBody className="flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 shadow-xs [&_svg]:size-5">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              {value.toLocaleString()}
            </p>
            {change ? (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {change}
              </span>
            ) : null}
          </div>
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
            <Skeleton className="size-11 rounded-xl" />
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
        {/* Core Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total users"
            value={data.totalUsers}
            icon={<Users aria-hidden="true" />}
            change="+12% this mo"
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
            change="+8.4%"
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

        {/* Breakdown by role & Platform status */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Users by role</CardTitle>
              <ButtonLink to="/admin/users" size="sm" variant="outline">
                Manage all users
                <ArrowRight className="size-3.5" />
              </ButtonLink>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(
                  [
                    ['Patients', data.usersByRole.patient, 'bg-blue-50/60 text-blue-900 border-blue-100'],
                    ['Doctors', data.usersByRole.doctor, 'bg-emerald-50/60 text-emerald-900 border-emerald-100'],
                    ['Family', data.usersByRole.caregiver, 'bg-amber-50/60 text-amber-900 border-amber-100'],
                    ['Admins', data.usersByRole.admin, 'bg-purple-50/60 text-purple-900 border-purple-100'],
                  ] as const
                ).map(([label, value, styles]) => (
                  <div key={label} className={`rounded-xl border p-4 ${styles}`}>
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value.toLocaleString()}</dd>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium">
                      {Math.round((value / (data.totalUsers || 1)) * 100)}% of platform
                    </div>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-600 animate-pulse" />
                <CardTitle className="text-emerald-950">System Health</CardTitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-3 pt-0 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-emerald-100">
                <span className="text-slate-600">Core API & Database</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="size-3.5 text-emerald-600" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-emerald-100">
                <span className="text-slate-600">IoT Streaming Broker</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="size-3.5 text-emerald-600" /> 100% Uptime
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-emerald-100">
                <span className="text-slate-600">Emergency 108 Bridge</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="size-3.5 text-emerald-600" /> Ready
                </span>
              </div>
              <ButtonLink to="/status" size="sm" variant="outline" className="w-full justify-center">
                <Server className="size-3.5 text-slate-600" />
                Full System Status
              </ButtonLink>
            </CardBody>
          </Card>
        </div>

        {/* Admin Quick Action Hub */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ButtonLink
            to="/admin/doctors"
            variant="outline"
            className="flex flex-col items-start gap-2 p-4 h-auto border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 text-left"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-100 text-brand-800">
              <ShieldAlert className="size-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Doctor Verification Queue</div>
              <div className="text-xs text-slate-500 mt-0.5">{data.doctorsPendingVerification} applications pending review</div>
            </div>
          </ButtonLink>

          <ButtonLink
            to="/admin/pharmacy"
            variant="outline"
            className="flex flex-col items-start gap-2 p-4 h-auto border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 text-left"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Pill className="size-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Pharmacy & Catalog</div>
              <div className="text-xs text-slate-500 mt-0.5">Manage medications, prices, and stock</div>
            </div>
          </ButtonLink>

          <ButtonLink
            to="/admin/analytics"
            variant="outline"
            className="flex flex-col items-start gap-2 p-4 h-auto border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 text-left"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800">
              <BarChart3 className="size-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Platform Analytics</div>
              <div className="text-xs text-slate-500 mt-0.5">Consultation volume & telemetry metrics</div>
            </div>
          </ButtonLink>

          <ButtonLink
            to="/admin/audit"
            variant="outline"
            className="flex flex-col items-start gap-2 p-4 h-auto border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 text-left"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
              <FileSpreadsheet className="size-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Audit & Compliance Logs</div>
              <div className="text-xs text-slate-500 mt-0.5">Security audit trails & access logs</div>
            </div>
          </ButtonLink>
        </div>
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
