import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi, renderRoutes, signedInAs } from '../test/utils';
import { routes } from './router';

describe('public routes', () => {
  it('renders the landing page with all major sections inside the public layout', async () => {
    mockApi();
    renderRoutes(routes, '/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /quality healthcare/i }),
    ).toBeInTheDocument();
    for (const name of [
      /care is too far away/i,
      /four steps/i,
      /one connected platform/i,
      /see a doctor from wherever/i,
      /book the right time/i,
      /health history/i,
      /never lose track of a dose/i,
      /understand your health/i,
      /know when something needs attention/i,
      /let family help/i,
      /starts with one account/i,
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it.each([
    ['/how-it-works', /simple for patients/i],
    ['/features', /everything needed for remote care/i],
    ['/doctors', /consult verified doctors/i],
    ['/about', /bringing healthcare closer/i],
    ['/contact', /like to hear from you/i],
  ])('renders %s', async (path, heading) => {
    mockApi();
    renderRoutes(routes, path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('shows "Go to dashboard" instead of sign-in links when signed in', async () => {
    mockApi({ 'GET /api/v1/auth/session': signedInAs('patient') });
    renderRoutes(routes, '/');
    const nav = await screen.findByRole('banner');
    expect(await within(nav).findByRole('link', { name: 'Go to dashboard' })).toHaveAttribute(
      'href',
      '/patient',
    );
    expect(within(nav).queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
  });

  it('renders the not-found page for unknown paths', async () => {
    mockApi();
    renderRoutes(routes, '/no-such-page');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});

describe('6. unauthorized route access', () => {
  it.each(['/patient', '/doctor', '/family', '/admin', '/dashboard', '/patient/records'])(
    'redirects a signed-out visitor from %s to login, remembering the destination',
    async (path) => {
      mockApi();
      const { router } = renderRoutes(routes, path);
      expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/login');
      expect(router.state.location.search).toBe(`?redirectTo=${encodeURIComponent(path)}`);
      expect(screen.getByText('Please log in to continue.')).toBeInTheDocument();
    },
  );

  it.each([
    ['patient', '/admin'],
    ['patient', '/doctor'],
    ['doctor', '/patient'],
    ['caregiver', '/admin/users'],
    ['admin', '/family'],
  ] as const)('shows access denied when a %s opens %s', async (role, path) => {
    mockApi({ 'GET /api/v1/auth/session': signedInAs(role) });
    renderRoutes(routes, path);
    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to my dashboard' })).toBeInTheDocument();
  });
});

describe('role-based routing', () => {
  it.each([
    ['patient', '/patient', /hello, asha/i],
    ['doctor', '/doctor', /welcome, ravi doctor/i],
    ['caregiver', '/family', /hello, meera/i],
  ] as const)('/dashboard sends a %s to %s', async (role, home, heading) => {
    mockApi({ 'GET /api/v1/auth/session': signedInAs(role) });
    const { router } = renderRoutes(routes, '/dashboard');
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(home);
  });

  it('/dashboard sends an admin to the platform overview with live figures', async () => {
    mockApi({
      'GET /api/v1/auth/session': signedInAs('admin'),
      'GET /api/v1/admin/overview': {
        body: {
          data: {
            totalUsers: 12,
            usersByRole: { patient: 8, doctor: 2, caregiver: 1, admin: 1 },
            suspendedUsers: 0,
            doctorsPendingVerification: 2,
            activeSessions: 4,
            newUsersLast7Days: 5,
          },
        },
      },
    });
    const { router } = renderRoutes(routes, '/dashboard');
    expect(await screen.findByText('Total users')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/admin');
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('shows the doctor verification status from the session', async () => {
    mockApi({ 'GET /api/v1/auth/session': signedInAs('doctor') });
    renderRoutes(routes, '/doctor');
    expect(await screen.findByText('Your account is awaiting verification')).toBeInTheDocument();
  });

  it('redirects signed-in users away from login and register', async () => {
    mockApi({ 'GET /api/v1/auth/session': signedInAs('caregiver') });
    const { router } = renderRoutes(routes, '/login');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/family');
    });
  });

  it('describes planned sections inside the role area and 404s unknown ones', async () => {
    mockApi({ 'GET /api/v1/auth/session': signedInAs('patient') });
    const { router } = renderRoutes(routes, '/patient/insurance');
    expect(await screen.findByText('This section is coming in a later phase')).toBeInTheDocument();

    await router.navigate('/patient/typo-here');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});

describe('8. session persistence and expiry', () => {
  it('restores the signed-in user from the server session on load', async () => {
    const fetchMock = mockApi({ 'GET /api/v1/auth/session': signedInAs('patient') });
    renderRoutes(routes, '/patient');
    expect(await screen.findByRole('heading', { name: /hello, asha/i })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/session',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('signs the user out locally when an API call reports the session expired', async () => {
    mockApi({
      'GET /api/v1/auth/session': signedInAs('admin'),
      'GET /api/v1/admin/overview': {
        status: 401,
        body: { error: { code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' } },
      },
    });
    const { router } = renderRoutes(routes, '/admin');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
  });
});

describe('3. logout', () => {
  it('signs out from the account menu, clears the session and returns to login', async () => {
    const user = userEvent.setup();
    // Behaves like the real server: once logged out, the session endpoint reports signed out.
    let serverSession = true;
    const fetchMock = mockApi({
      'GET /api/v1/auth/session': () =>
        serverSession
          ? (signedInAs('patient') as { body: unknown })
          : { body: { data: { user: null } } },
      'POST /api/v1/auth/logout': () => {
        serverSession = false;
        return { status: 204 };
      },
    });
    const { router } = renderRoutes(routes, '/patient');

    await user.click(await screen.findByRole('button', { name: /account menu/i }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(await screen.findByText('Signed out')).toBeInTheDocument();

    // Going back to a protected page now requires signing in again.
    await router.navigate('/patient');
    await waitFor(() => {
      expect(router.state.location.search).toBe('?redirectTo=%2Fpatient');
    });
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });
});
