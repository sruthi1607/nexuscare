import { useQuery } from '@tanstack/react-query';
import { adminOverviewSchema, type AdminOverview } from '@nexuscare/shared';
import { apiRequest } from '../../lib/api-client';

export const adminQueryKeys = {
  overview: ['admin', 'overview'] as const,
};

export function fetchAdminOverview(signal?: AbortSignal): Promise<AdminOverview> {
  return apiRequest('/api/v1/admin/overview', adminOverviewSchema, {
    ...(signal ? { signal } : {}),
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: adminQueryKeys.overview,
    queryFn: ({ signal }) => fetchAdminOverview(signal),
  });
}
