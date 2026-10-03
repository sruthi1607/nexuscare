import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  availabilitySchema,
  doctorProfileSchema,
  specialtySchema,
  type AvailabilityUpdate,
  type DoctorProfileUpdateInput,
} from '@nexuscare/shared';
import { apiRequest } from '../../lib/api-client';

export const doctorQueryKeys = {
  profile: ['doctor', 'me', 'profile'] as const,
  availability: ['doctor', 'me', 'availability'] as const,
  specialties: ['specialties'] as const,
};

export function useSpecialties() {
  return useQuery({
    queryKey: doctorQueryKeys.specialties,
    queryFn: ({ signal }) => apiRequest('/api/v1/specialties', z.array(specialtySchema), { signal }),
    staleTime: 60 * 60_000,
  });
}

export function useDoctorProfile(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: doctorQueryKeys.profile,
    queryFn: ({ signal }) =>
      apiRequest('/api/v1/doctors/me/profile', doctorProfileSchema, { signal }),
    enabled: options.enabled ?? true,
  });
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorProfileUpdateInput) =>
      apiRequest('/api/v1/doctors/me/profile', doctorProfileSchema, { method: 'PUT', body: input }),
    onSuccess: (profile) => {
      queryClient.setQueryData(doctorQueryKeys.profile, profile);
    },
  });
}

export function useAvailability(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: doctorQueryKeys.availability,
    queryFn: ({ signal }) =>
      apiRequest('/api/v1/doctors/me/availability', availabilitySchema, { signal }),
    enabled: options.enabled ?? true,
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AvailabilityUpdate) =>
      apiRequest('/api/v1/doctors/me/availability', availabilitySchema, {
        method: 'PUT',
        body: input,
      }),
    onSuccess: async (availability) => {
      queryClient.setQueryData(doctorQueryKeys.availability, availability);
      // Slot length is part of the professional profile too.
      await queryClient.invalidateQueries({ queryKey: doctorQueryKeys.profile });
    },
  });
}
