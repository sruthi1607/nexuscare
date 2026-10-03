import type { AppRole } from '@nexuscare/shared';

/** Each role has its own area of the app. */
const ROLE_HOME: Record<AppRole, string> = {
  patient: '/patient',
  doctor: '/doctor',
  caregiver: '/family',
  admin: '/admin',
};

export const ROLE_LABEL: Record<AppRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  caregiver: 'Family',
  admin: 'Admin',
};

export function roleHomePath(role: AppRole): string {
  return ROLE_HOME[role];
}

/** Paths any signed-in role may land on after login. */
const SHARED_PATHS = ['/ui-kit'];

/**
 * Where to go after signing in. Honours a `redirectTo` only when it is a same-site path inside the
 * user's own area (prevents open redirects and bouncing users onto an "access denied" page).
 */
export function resolvePostLoginPath(role: AppRole, redirectTo: string | null): string {
  const home = roleHomePath(role);
  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) return home;
  if (redirectTo.includes('\\')) return home;
  const pathOnly = redirectTo.split(/[?#]/)[0] ?? '';
  const allowed =
    pathOnly === home ||
    pathOnly.startsWith(`${home}/`) ||
    SHARED_PATHS.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`));
  return allowed ? redirectTo : home;
}

/** The signed-in user's own profile page. */
export function profilePath(role: AppRole): string {
  return `${ROLE_HOME[role]}/profile`;
}
