import { useQuery } from '@tanstack/react-query';
import { healthReportSchema, type HealthReport } from '@nexuscare/shared';
import { apiRequest } from '../../lib/api-client';

export const systemQueryKeys = {
  health: ['system', 'health'] as const,
};

/** GET /api/health — a 503 still carries a (degraded) health report, so it is not an error. */
export function fetchHealth(signal?: AbortSignal): Promise<HealthReport> {
  return apiRequest('/api/health', healthReportSchema, {
    successStatuses: [503],
    ...(signal ? { signal } : {}),
  });
}

export function useHealth() {
  return useQuery({
    queryKey: systemQueryKeys.health,
    queryFn: ({ signal }) => fetchHealth(signal),
    refetchInterval: 30_000,
  });
}
