import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  medicalProfileSchema,
  type MedicalProfile,
  type MedicalProfileSection,
} from '@nexuscare/shared';
import { apiRequest } from '../../lib/api-client';

const BASE = '/api/v1/patients/me/medical-profile';

export const medicalQueryKeys = {
  own: ['medical-profile', 'me'] as const,
};

export function useMedicalProfile(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: medicalQueryKeys.own,
    queryFn: ({ signal }) => apiRequest(BASE, medicalProfileSchema, { signal }),
    enabled: options.enabled ?? true,
  });
}

/** Saves one section; the server returns the whole updated profile, which replaces the cache. */
export function useUpdateMedicalSection(section: MedicalProfileSection) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown): Promise<MedicalProfile> =>
      apiRequest(`${BASE}/${section}`, medicalProfileSchema, { method: 'PUT', body }),
    onSuccess: (profile) => {
      queryClient.setQueryData(medicalQueryKeys.own, profile);
    },
  });
}
