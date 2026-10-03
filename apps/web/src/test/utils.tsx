import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import type { AppRole, HealthReport, SessionUser } from '@nexuscare/shared';
import { vi } from 'vitest';
import { createQueryClient } from '../app/query-client';
import { ToastProvider } from '../components/ui/Toast';
import { AuthProvider } from '../features/auth/AuthProvider';

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function healthReport(overrides: Partial<HealthReport> = {}): HealthReport {
  return {
    status: 'ok',
    service: 'nexuscare-api',
    version: '0.1.0',
    environment: 'test',
    timestamp: '2026-10-03T10:00:00.000Z',
    uptimeSeconds: 125,
    checks: {
      database: { status: 'up', latencyMs: 2.4, serverVersion: 'PostgreSQL 18.0', error: null },
    },
    ...overrides,
  };
}

const NAMES: Record<AppRole, string> = {
  patient: 'Asha Patient',
  doctor: 'Ravi Doctor',
  caregiver: 'Meera Family',
  admin: 'Ada Admin',
};

export function testUser(role: AppRole, overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    email: `${role}@test.example`,
    role,
    fullName: NAMES[role],
    status: 'active',
    doctorVerification: role === 'doctor' ? 'pending' : null,
    avatarUrl: null,
    ...overrides,
  };
}

/** Low-level: stubs fetch with a queue of responses (or thrown errors), in call order. */
export function mockFetch(...responses: (Response | Error)[]) {
  const fn = vi.fn<typeof fetch>();
  for (const response of responses) {
    if (response instanceof Error) fn.mockRejectedValueOnce(response);
    else fn.mockResolvedValueOnce(response);
  }
  vi.stubGlobal('fetch', fn);
  return fn;
}

export interface MockReply {
  status?: number;
  body?: unknown;
}
type ReplyFactory = (request: { body: unknown }) => MockReply;
export type MockRoute = MockReply | Error | ReplyFactory | (MockReply | Error)[];

/**
 * Route-based fetch mock keyed by "METHOD /path". Arrays are consumed in order (the last entry
 * repeats). GET /api/v1/auth/session defaults to signed out. Unmatched requests fail the test.
 */
export function mockApi(routes: Record<string, MockRoute> = {}) {
  const queues = new Map<string, MockRoute>(
    Object.entries({ 'GET /api/v1/auth/session': { body: { data: { user: null } } }, ...routes }),
  );
  const fn = vi.fn<typeof fetch>((input, init) => {
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      'http://localhost',
    );
    const key = `${(init?.method ?? 'GET').toUpperCase()} ${url.pathname}`;
    let route = queues.get(key);
    if (route === undefined) return Promise.reject(new Error(`Unmocked request: ${key}`));
    if (Array.isArray(route)) {
      const next = route.length > 1 ? route.shift() : route[0];
      route = next;
    }
    if (route instanceof Error) return Promise.reject(route);
    const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    const reply = typeof route === 'function' ? route({ body }) : (route ?? {});
    const status = reply.status ?? 200;
    return Promise.resolve(
      status === 204
        ? new Response(null, { status })
        : jsonResponse(reply.body ?? { data: null }, status),
    );
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

/** Session mock for a signed-in user of the given role. */
export function signedInAs(role: AppRole, overrides: Partial<SessionUser> = {}): MockRoute {
  return { body: { data: { user: testUser(role, overrides) } } };
}

/** Same provider stack as the app (query client, auth, toasts), with retries disabled. */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = createQueryClient({ retry: false });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
  return { ...result, queryClient };
}

export function renderRoutes(routes: RouteObject[], initialPath = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  return { ...renderWithProviders(<RouterProvider router={router} />), router };
}
