import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileSchema, type Profile, type ProfileUpdateInput } from '@nexuscare/shared';
import { ApiError, apiRequest } from '../../lib/api-client';
import { authQueryKeys, getStoredDemoUser, setStoredDemoUser } from '../auth/api';

export const profileQueryKeys = {
  own: ['profile', 'me'] as const,
};

const PROFILE_STORAGE_KEY = 'nexuscare_demo_profile_storage';

const DEFAULT_DEMO_PROFILES: Record<string, Profile> = {
  patient: {
    userId: '00000000-0000-4000-8000-000000000001',
    email: 'patient@nexuscare.example',
    fullName: 'Sarah Jenkins',
    role: 'patient',
    status: 'active',
    avatarUrl: null,
    phone: '+1 (555) 234-5678',
    dateOfBirth: '1988-06-14',
    sex: 'female',
    preferredLanguage: 'en',
    timezone: 'America/New_York',
    address: {
      line1: '742 Evergreen Terrace',
      line2: 'Apt 4B',
      city: 'Springfield',
      region: 'OR',
      postalCode: '97477',
      country: 'USA',
    },
    memberSince: '2025-01-15T00:00:00.000Z',
  },
  doctor: {
    userId: '00000000-0000-4000-8000-000000000002',
    email: 'doctor@nexuscare.example',
    fullName: 'Dr. Arvind Mehta, MD',
    role: 'doctor',
    status: 'active',
    avatarUrl: null,
    phone: '+1 (555) 345-6789',
    dateOfBirth: '1979-03-22',
    sex: 'male',
    preferredLanguage: 'en',
    timezone: 'America/New_York',
    address: {
      line1: '100 Medical Center Way',
      line2: null,
      city: 'Springfield',
      region: 'OR',
      postalCode: '97477',
      country: 'USA',
    },
    memberSince: '2024-08-10T00:00:00.000Z',
  },
  caregiver: {
    userId: '00000000-0000-4000-8000-000000000003',
    email: 'family@nexuscare.example',
    fullName: 'David Jenkins',
    role: 'caregiver',
    status: 'active',
    avatarUrl: null,
    phone: '+1 (555) 234-5679',
    dateOfBirth: '1986-11-05',
    sex: 'male',
    preferredLanguage: 'en',
    timezone: 'America/New_York',
    address: {
      line1: '742 Evergreen Terrace',
      line2: 'Apt 4B',
      city: 'Springfield',
      region: 'OR',
      postalCode: '97477',
      country: 'USA',
    },
    memberSince: '2025-02-01T00:00:00.000Z',
  },
  admin: {
    userId: '00000000-0000-4000-8000-000000000004',
    email: 'admin@nexuscare.example',
    fullName: 'System Administrator',
    role: 'admin',
    status: 'active',
    avatarUrl: null,
    phone: '+1 (555) 000-1122',
    dateOfBirth: '1985-01-01',
    sex: 'other',
    preferredLanguage: 'en',
    timezone: 'America/New_York',
    address: {
      line1: null,
      line2: null,
      city: null,
      region: null,
      postalCode: null,
      country: null,
    },
    memberSince: '2024-01-01T00:00:00.000Z',
  },
};

export function getStoredDemoProfile(role = 'patient'): Profile {
  try {
    const raw = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${role}`);
    if (raw) return JSON.parse(raw) as Profile;
  } catch {
    // ignore
  }
  return DEFAULT_DEMO_PROFILES[role] ?? DEFAULT_DEMO_PROFILES.patient!;
}

export function setStoredDemoProfile(profile: Profile): void {
  try {
    localStorage.setItem(`${PROFILE_STORAGE_KEY}_${profile.role}`, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function useProfile() {
  const currentUser = getStoredDemoUser();
  const currentRole = currentUser?.role ?? 'patient';

  return useQuery({
    queryKey: profileQueryKeys.own,
    queryFn: async ({ signal }) => {
      try {
        return await apiRequest('/api/v1/me/profile', profileSchema, { signal });
      } catch (error) {
        if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
          return getStoredDemoProfile(currentRole);
        }
        throw error;
      }
    },
    initialData: () => getStoredDemoProfile(currentRole),
  });
}

/** After any profile change, refresh the cached profile and the session (name/avatar in the shell). */
function useProfileMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Profile>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (profile) => {
      setStoredDemoProfile(profile);
      queryClient.setQueryData(profileQueryKeys.own, profile);

      const storedUser = getStoredDemoUser();
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
        };
        setStoredDemoUser(updatedUser);
        queryClient.setQueryData(authQueryKeys.session, updatedUser);
      }
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
    },
  });
}

export function useUpdateProfile() {
  const currentUser = getStoredDemoUser();
  const currentRole = currentUser?.role ?? 'patient';

  return useProfileMutation(async (input: ProfileUpdateInput) => {
    try {
      return await apiRequest('/api/v1/me/profile', profileSchema, { method: 'PUT', body: input });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
        const existing = getStoredDemoProfile(currentRole);
        const updated: Profile = {
          ...existing,
          fullName: input.fullName,
          phone: input.phone ?? null,
          dateOfBirth: input.dateOfBirth ?? null,
          sex: input.sex ?? null,
          preferredLanguage: input.preferredLanguage ?? 'en',
          timezone: input.timezone ?? 'America/New_York',
          address: {
            line1: input.address?.line1 ?? null,
            line2: input.address?.line2 ?? null,
            city: input.address?.city ?? null,
            region: input.address?.region ?? null,
            postalCode: input.address?.postalCode ?? null,
            country: input.address?.country ?? null,
          },
        };
        setStoredDemoProfile(updated);
        return updated;
      }
      throw error;
    }
  });
}

/** Sends the raw image; the server validates, resizes to 256 px and strips metadata. */
export function useUploadAvatar() {
  const currentUser = getStoredDemoUser();
  const currentRole = currentUser?.role ?? 'patient';

  return useProfileMutation(async (file: File) => {
    try {
      return await apiRequest('/api/v1/me/avatar', profileSchema, { method: 'PUT', body: file });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
        const existing = getStoredDemoProfile(currentRole);
        const avatarUrl = URL.createObjectURL(file);
        const updated = { ...existing, avatarUrl };
        setStoredDemoProfile(updated);
        return updated;
      }
      throw error;
    }
  });
}

export function useRemoveAvatar() {
  const currentUser = getStoredDemoUser();
  const currentRole = currentUser?.role ?? 'patient';

  return useProfileMutation(async () => {
    try {
      return await apiRequest('/api/v1/me/avatar', profileSchema, { method: 'DELETE' });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
        const existing = getStoredDemoProfile(currentRole);
        const updated = { ...existing, avatarUrl: null };
        setStoredDemoProfile(updated);
        return updated;
      }
      throw error;
    }
  });
}


