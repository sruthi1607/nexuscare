import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { AppRole } from '@nexuscare/shared';
import { routes } from '../../../app/router';
import { mockApi, renderRoutes, testUser } from '../../../test/utils';

async function logIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/^email/i), 'someone@example.com');
  await user.type(screen.getByLabelText(/^password/i), 'correcthorse42');
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('2/4/5. login routes each role to its dashboard', () => {
  it.each([
    ['patient', '/patient'],
    ['doctor', '/doctor'],
    ['caregiver', '/family'],
    ['admin', '/admin'],
  ] as const)('%s → %s', async (role: AppRole, home) => {
    const user = userEvent.setup();
    mockApi({
      'POST /api/v1/auth/login': { body: { data: { user: testUser(role) } } },
      'GET /api/v1/admin/overview': {
        body: {
          data: {
            totalUsers: 1,
            usersByRole: { patient: 0, doctor: 0, caregiver: 0, admin: 1 },
            suspendedUsers: 0,
            doctorsPendingVerification: 0,
            activeSessions: 1,
            newUsersLast7Days: 1,
          },
        },
      },
    });
    const { router } = renderRoutes(routes, '/login');
    await logIn(user);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(home);
    });
  });
});

describe('LoginPage', () => {
  it('returns to the originally requested page inside the user’s own area', async () => {
    const user = userEvent.setup();
    mockApi({ 'POST /api/v1/auth/login': { body: { data: { user: testUser('patient') } } } });
    const { router } = renderRoutes(routes, '/login?redirectTo=%2Fpatient%2Frecords');
    await logIn(user);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/patient/records');
    });
  });

  it('ignores a redirect into another role’s area', async () => {
    const user = userEvent.setup();
    mockApi({ 'POST /api/v1/auth/login': { body: { data: { user: testUser('patient') } } } });
    const { router } = renderRoutes(routes, '/login?redirectTo=%2Fadmin');
    await logIn(user);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/patient');
    });
  });

  it('shows the server message for invalid credentials and stays on the page', async () => {
    const user = userEvent.setup();
    mockApi({
      'POST /api/v1/auth/login': {
        status: 401,
        body: {
          error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' },
        },
      },
    });
    const { router } = renderRoutes(routes, '/login');
    await logIn(user);
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('validates input before calling the API', async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi();
    renderRoutes(routes, '/login');
    await user.click(await screen.findByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Enter your email address')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith('/api/v1/auth/login', expect.anything());
  });
});
