import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { healthReport, mockApi, renderWithProviders } from '../../../test/utils';
import { formatUptime } from '../format';
import { SystemStatusPage } from './SystemStatusPage';

describe('SystemStatusPage', () => {
  it('shows a loading state, then healthy API and database details', async () => {
    mockApi({ 'GET /api/health': { body: { data: healthReport() } } });
    renderWithProviders(<SystemStatusPage />);

    expect(screen.getByLabelText('Loading system status')).toBeInTheDocument();
    expect(await screen.findByText('All systems operational.')).toBeInTheDocument();
    expect(screen.getAllByText('Operational')).toHaveLength(2);
    expect(screen.getByText('PostgreSQL 18.0')).toBeInTheDocument();
    expect(screen.getByText('2.4 ms')).toBeInTheDocument();
  });

  it('shows a degraded state when the API reports the database is down (HTTP 503)', async () => {
    mockApi({
      'GET /api/health': {
        status: 503,
        body: {
          data: healthReport({
            status: 'degraded',
            checks: {
              database: {
                status: 'down',
                latencyMs: null,
                serverVersion: null,
                error: 'Database unreachable',
              },
            },
          }),
        },
      },
    });
    renderWithProviders(<SystemStatusPage />);

    expect(await screen.findByText(/Degraded/)).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Database unreachable')).toBeInTheDocument();
  });

  it('shows an error state with retry when the API is unreachable, and recovers', async () => {
    mockApi({
      'GET /api/health': [new TypeError('Failed to fetch'), { body: { data: healthReport() } }],
    });
    renderWithProviders(<SystemStatusPage />);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Cannot reach the Nexus Care API')).toBeInTheDocument();

    await userEvent.click(within(alert).getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('All systems operational.')).toBeInTheDocument();
  });
});

describe('formatUptime', () => {
  it.each([
    [42, '42s'],
    [125, '2m'],
    [3_700, '1h 1m'],
    [90_000, '1d 1h'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatUptime(seconds)).toBe(expected);
  });
});
