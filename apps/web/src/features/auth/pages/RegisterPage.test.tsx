import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { routes } from '../../../app/router';
import { mockApi, renderRoutes, testUser } from '../../../test/utils';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/full name/i), 'Asha Patient');
  await user.type(screen.getByLabelText(/^email/i), 'asha@example.com');
  await user.type(screen.getByLabelText(/^password/i), 'correcthorse42');
  await user.type(screen.getByLabelText(/confirm password/i), 'correcthorse42');
  await user.click(screen.getByRole('checkbox', { name: /terms of use/i }));
}

describe('1. patient registration (UI)', () => {
  it('shows validation errors without calling the API for an empty form', async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi();
    renderRoutes(routes, '/register');

    await user.click(await screen.findByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    expect(
      screen.getByText('You must accept the terms and privacy policy to continue'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith('/api/v1/auth/register', expect.anything());
  });

  it('registers, sends only the API fields and lands on the patient dashboard', async () => {
    const user = userEvent.setup();
    let sentBody: unknown;
    mockApi({
      'POST /api/v1/auth/register': ({ body }) => {
        sentBody = body;
        return { status: 201, body: { data: { user: testUser('patient') } } };
      },
    });
    const { router } = renderRoutes(routes, '/register');

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/patient');
    });
    expect(sentBody).toEqual({
      fullName: 'Asha Patient',
      email: 'asha@example.com',
      role: 'patient',
      password: 'correcthorse42',
      acceptTerms: true,
    });
  });

  it('shows a field error when the email is already registered', async () => {
    const user = userEvent.setup();
    mockApi({
      'POST /api/v1/auth/register': {
        status: 409,
        body: {
          error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' },
        },
      },
    });
    renderRoutes(routes, '/register');
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText(/already exists\. try logging in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('preselects the doctor role from the query string', async () => {
    mockApi();
    renderRoutes(routes, '/register?role=doctor');
    expect(await screen.findByRole('radio', { name: /doctor/i })).toBeChecked();
    expect(screen.getByText(/doctor accounts are reviewed/i)).toBeInTheDocument();
  });

  it('ignores an admin role in the query string', async () => {
    mockApi();
    renderRoutes(routes, '/register?role=admin');
    expect(await screen.findByRole('radio', { name: /^patient/i })).toBeChecked();
  });
});
