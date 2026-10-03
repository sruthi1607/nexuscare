import { ShieldOff } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { useAuth } from '../../features/auth/auth-context';
import { ROLE_LABEL, roleHomePath } from '../../features/auth/roles';

export function ForbiddenPage() {
  const { user } = useAuth();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-700">
        <ShieldOff className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-semibold text-danger-700">403</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 text-sm text-slate-600">
        {user
          ? `Your ${ROLE_LABEL[user.role].toLowerCase()} account does not have access to this area.`
          : 'You do not have access to this area.'}
      </p>
      {user ? (
        <ButtonLink to={roleHomePath(user.role)} className="mt-6">
          Go to my dashboard
        </ButtonLink>
      ) : null}
    </div>
  );
}
