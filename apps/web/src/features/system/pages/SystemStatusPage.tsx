import type { ReactNode } from 'react';
import { CheckCircle2, Database, RotateCw, Server, XCircle } from 'lucide-react';
import type { HealthReport } from '@nexuscare/shared';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/common/ErrorState';
import { ApiError } from '../../../lib/api-client';
import { useHealth } from '../api';
import { formatUptime } from '../format';

function StatusBadge({ up }: { up: boolean }) {
  return up ? (
    <Badge tone="success" icon={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}>
      Operational
    </Badge>
  ) : (
    <Badge tone="danger" icon={<XCircle className="h-3.5 w-3.5" aria-hidden="true" />}>
      Unavailable
    </Badge>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  up,
  children,
}: {
  icon: ReactNode;
  title: string;
  up: boolean;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          {icon}
          {title}
        </h2>
        <StatusBadge up={up} />
      </CardHeader>
      <CardBody>
        <dl className="divide-y divide-slate-100">{children}</dl>
      </CardBody>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading system status">
      {[0, 1].map((key) => (
        <Card key={key}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardBody className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function HealthDetails({ report }: { report: HealthReport }) {
  const { database } = report.checks;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ServiceCard
        icon={<Server className="h-5 w-5 text-brand-700" aria-hidden="true" />}
        title="API server"
        up
      >
        <Detail label="Service">{report.service}</Detail>
        <Detail label="Version">{report.version}</Detail>
        <Detail label="Environment">{report.environment}</Detail>
        <Detail label="Uptime">{formatUptime(report.uptimeSeconds)}</Detail>
      </ServiceCard>
      <ServiceCard
        icon={<Database className="h-5 w-5 text-brand-700" aria-hidden="true" />}
        title="Database"
        up={database.status === 'up'}
      >
        {database.status === 'up' ? (
          <>
            <Detail label="Engine">{database.serverVersion}</Detail>
            <Detail label="Response time">{database.latencyMs} ms</Detail>
          </>
        ) : (
          <Detail label="Issue">{database.error ?? 'Unknown'}</Detail>
        )}
      </ServiceCard>
    </div>
  );
}

export function SystemStatusPage() {
  const { data, error, isPending, isFetching, refetch, dataUpdatedAt } = useHealth();
  const retry = () => void refetch();

  let content: ReactNode;
  if (isPending) {
    content = <LoadingState />;
  } else if (error) {
    content = (
      <ErrorState
        title="Cannot reach the Nexus Care API"
        message={error.message}
        requestId={error instanceof ApiError ? error.requestId : undefined}
        onRetry={retry}
        retrying={isFetching}
      />
    );
  } else {
    content = <HealthDetails report={data} />;
  }

  const overall = data?.status;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">System status</h1>
          <p className="mt-1 text-sm text-slate-600">
            Live connectivity check: browser → API server → database.
          </p>
        </div>
        <Button variant="secondary" onClick={retry} disabled={isFetching}>
          <RotateCw
            className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      {overall && !error ? (
        <p
          role="status"
          className={
            overall === 'ok'
              ? 'mb-4 rounded-lg bg-success-50 px-4 py-3 text-sm font-medium text-success-700'
              : 'mb-4 rounded-lg bg-warning-50 px-4 py-3 text-sm font-medium text-warning-700'
          }
        >
          {overall === 'ok'
            ? 'All systems operational.'
            : 'Degraded: the API is running but the database is unavailable.'}
        </p>
      ) : null}

      {content}

      {dataUpdatedAt > 0 ? (
        <p className="mt-4 text-xs text-slate-500">
          Last checked {new Date(dataUpdatedAt).toLocaleTimeString()} · refreshes every 30 seconds
        </p>
      ) : null}
    </div>
  );
}
