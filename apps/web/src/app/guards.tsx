import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import type { AppRole } from '@nexuscare/shared';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../features/auth/auth-context';
import { resolvePostLoginPath, roleHomePath } from '../features/auth/roles';
import { ForbiddenPage } from './pages/ForbiddenPage';

/*
 * Route guards improve UX (no flash of private pages, sensible redirects). They are NOT the
 * security boundary — the API rejects every unauthorised request regardless of what the UI shows.
 */

function FullPageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50">
      <Spinner label="Checking your session" />
    </div>
  );
}

/** Signed-out users are sent to /login, remembering where they were going. */
export function RequireAuth({ children }: { children?: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'unauthenticated') {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} replace />;
  }
  return children ?? <Outlet />;
}

/** Signed-in users with another role see an access-denied page (rendered inside their shell). */
export function RequireRole({ roles }: { roles: AppRole[] }) {
  const { user } = useAuth();
  if (!user) return null; // RequireAuth above handles signed-out users.
  if (!roles.includes(user.role)) return <ForbiddenPage />;
  return <Outlet />;
}

/**
 * /login and /register: signed-in users go to their dashboard — or to a safe `redirectTo` inside
 * their own area. This also completes the login flow, so it must apply the same rule as the form.
 */
export function RedirectIfAuthenticated() {
  const { status, user } = useAuth();
  const [searchParams] = useSearchParams();
  if (status === 'loading') return <FullPageLoader />;
  if (user) {
    return (
      <Navigate to={resolvePostLoginPath(user.role, searchParams.get('redirectTo'))} replace />
    );
  }
  return <Outlet />;
}

/** /dashboard → the signed-in user's role home. */
export function RoleHomeRedirect() {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={roleHomePath(user.role)} replace />;
}
