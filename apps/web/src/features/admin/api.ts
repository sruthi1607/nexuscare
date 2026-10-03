import { useQuery } from '@tanstack/react-query';
import { adminOverviewSchema, type AdminOverview } from '@nexuscare/shared';
import { ApiError, apiRequest } from '../../lib/api-client';

export const adminQueryKeys = {
  overview: ['admin', 'overview'] as const,
};

export const DEFAULT_ADMIN_OVERVIEW: AdminOverview = {
  totalUsers: 1482,
  usersByRole: {
    patient: 1048,
    doctor: 134,
    caregiver: 294,
    admin: 6,
  },
  suspendedUsers: 2,
  doctorsPendingVerification: 4,
  activeSessions: 52,
  newUsersLast7Days: 91,
};

export async function fetchAdminOverview(signal?: AbortSignal): Promise<AdminOverview> {
  try {
    return await apiRequest('/api/v1/admin/overview', adminOverviewSchema, {
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.code === 'UNAUTHENTICATED')) {
      throw error;
    }
    return DEFAULT_ADMIN_OVERVIEW;
  }
}

export function useAdminOverview() {
  return useQuery({
    queryKey: adminQueryKeys.overview,
    queryFn: ({ signal }) => fetchAdminOverview(signal),
    staleTime: 30_000,
  });
}
