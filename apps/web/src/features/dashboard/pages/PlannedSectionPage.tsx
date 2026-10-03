import { useLocation } from 'react-router';
import { Construction } from 'lucide-react';
import { findNavItem } from '../../../app/navigation';
import { NotFoundPage } from '../../../app/pages/NotFoundPage';
import { EmptyState } from '../../../components/common/EmptyState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ButtonLink } from '../../../components/ui/Button';
import { useCurrentUser } from '../../auth/auth-context';
import { roleHomePath } from '../../auth/roles';

/**
 * Catch-all inside a role area for sections that are planned but not built. Unknown paths still
 * 404, so mistyped URLs are not disguised as "coming soon".
 */
export function PlannedSectionPage() {
  const { pathname } = useLocation();
  const user = useCurrentUser();
  const item = findNavItem(user.role, pathname);
  const home = roleHomePath(user.role);

  if (!item?.planned) return <NotFoundPage />;

  const Icon = item.icon;
  return (
    <>
      <PageHeader
        title={item.label}
        breadcrumbs={[{ label: 'Dashboard', to: home }, { label: item.label }]}
      />
      <EmptyState
        icon={<Icon aria-hidden="true" />}
        title="This section is coming in a later phase"
        description={
          <>
            <p>{item.planned.summary}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Construction className="size-3.5" aria-hidden="true" />
              Not available yet
            </p>
          </>
        }
        action={
          <ButtonLink to={home} variant="outline">
            Back to dashboard
          </ButtonLink>
        }
      />
    </>
  );
}
