import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import {
  availabilitySchema,
  doctorProfileSchema,
  specialtySchema,
  type Availability,
  type AvailabilityUpdate,
  type DoctorProfile,
  type DoctorProfileUpdateInput,
  type Specialty,
} from '@nexuscare/shared';
import { ApiError, apiRequest } from '../../lib/api-client';

export const doctorQueryKeys = {
  profile: ['doctor', 'me', 'profile'] as const,
  availability: ['doctor', 'me', 'availability'] as const,
  specialties: ['specialties'] as const,
};

export const DEFAULT_SPECIALTIES: Specialty[] = [
  { id: '11111111-1111-4111-8111-111111111101', name: 'Cardiology & Heart Care', slug: 'cardiology' },
  { id: '11111111-1111-4111-8111-111111111102', name: 'Internal Medicine', slug: 'internal-medicine' },
  { id: '11111111-1111-4111-8111-111111111103', name: 'Endocrinology & Diabetology', slug: 'endocrinology' },
  { id: '11111111-1111-4111-8111-111111111104', name: 'General Medicine & Family Practice', slug: 'general-medicine' },
  { id: '11111111-1111-4111-8111-111111111105', name: 'Neurology', slug: 'neurology' },
  { id: '11111111-1111-4111-8111-111111111106', name: 'Pulmonology & Respiratory Care', slug: 'pulmonology' },
  { id: '11111111-1111-4111-8111-111111111107', name: 'Emergency & Acute Care', slug: 'emergency-medicine' },
];

export const DEFAULT_DEMO_DOCTOR_PROFILE: DoctorProfile = {
  doctorId: '00000000-0000-4000-8000-000000000002',
  verificationStatus: 'verified',
  registrationNumber: 'MED-KA-2012-98442',
  registrationCouncil: 'Karnataka Medical Council / National Medical Commission',
  specialties: [
    { id: '11111111-1111-4111-8111-111111111101', name: 'Cardiology & Heart Care', slug: 'cardiology' },
    { id: '11111111-1111-4111-8111-111111111102', name: 'Internal Medicine', slug: 'internal-medicine' },
  ],
  qualifications: [
    {
      id: '22222222-2222-4222-8222-222222222201',
      degree: 'MBBS, MD (Internal Medicine)',
      institution: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
      year: 2008,
    },
    {
      id: '22222222-2222-4222-8222-222222222202',
      degree: 'DM (Cardiology), FACC',
      institution: 'Postgraduate Institute of Medical Education & Research',
      year: 2012,
    },
  ],
  yearsExperience: 16,
  consultationModes: ['video', 'audio', 'in_person'],
  languages: ['en', 'hi', 'kn'],
  clinicName: 'Nexus Heart & Wellness Specialty Clinic',
  clinicAddress: 'Suite 401, Apollo Medical Arts Tower, Bannerghatta Rd',
  clinicCity: 'Bengaluru',
  consultationFee: 800,
  feeCurrency: 'INR',
  bio: 'Senior Consultant Cardiologist and Interventional Cardiology Specialist with over 16 years of clinical experience. Specializing in acute coronary syndromes, hypertensive heart disease, telemetry analysis, and preventative cardio-metabolic care.',
  acceptsNewPatients: true,
  slotMinutes: 20,
};

export const DEFAULT_DEMO_AVAILABILITY: Availability = {
  timezone: 'Asia/Kolkata',
  slotMinutes: 20,
  rules: [
    { weekday: 1, startTime: '09:00', endTime: '13:00' },
    { weekday: 1, startTime: '15:00', endTime: '18:00' },
    { weekday: 2, startTime: '09:00', endTime: '13:00' },
    { weekday: 2, startTime: '15:00', endTime: '18:00' },
    { weekday: 3, startTime: '09:00', endTime: '13:00' },
    { weekday: 3, startTime: '15:00', endTime: '18:00' },
    { weekday: 4, startTime: '09:00', endTime: '13:00' },
    { weekday: 4, startTime: '15:00', endTime: '18:00' },
    { weekday: 5, startTime: '09:00', endTime: '13:00' },
    { weekday: 5, startTime: '15:00', endTime: '17:00' },
  ],
};

const DOCTOR_PROFILE_STORAGE_KEY = 'nexuscare_demo_doctor_profile_v2';
const AVAILABILITY_STORAGE_KEY = 'nexuscare_demo_doctor_availability_v2';

export function getStoredDemoDoctorProfile(): DoctorProfile {
  try {
    const raw = localStorage.getItem(DOCTOR_PROFILE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as DoctorProfile;
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_DEMO_DOCTOR_PROFILE;
}

export function setStoredDemoDoctorProfile(profile: DoctorProfile): void {
  try {
    localStorage.setItem(DOCTOR_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage write error
  }
}

export function getStoredDemoAvailability(): Availability {
  try {
    const raw = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Availability;
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_DEMO_AVAILABILITY;
}

export function setStoredDemoAvailability(availability: Availability): void {
  try {
    localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(availability));
  } catch {
    // Ignore storage write error
  }
}

export function useSpecialties() {
  return useQuery({
    queryKey: doctorQueryKeys.specialties,
    queryFn: async ({ signal }) => {
      try {
        return await apiRequest('/api/v1/specialties', z.array(specialtySchema), { signal });
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.code === 'UNAUTHENTICATED')) {
          throw error;
        }
        return DEFAULT_SPECIALTIES;
      }
    },
    staleTime: 60 * 60_000,
  });
}

export function useDoctorProfile(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: doctorQueryKeys.profile,
    queryFn: async ({ signal }) => {
      try {
        const fetched = await apiRequest('/api/v1/doctors/me/profile', doctorProfileSchema, { signal });
        setStoredDemoDoctorProfile(fetched);
        return fetched;
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.code === 'UNAUTHENTICATED')) {
          throw error;
        }
        return getStoredDemoDoctorProfile();
      }
    },
    enabled: options.enabled ?? true,
  });
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DoctorProfileUpdateInput) => {
      const current = getStoredDemoDoctorProfile();
      // Map chosen specialtyIds to full specialty objects
      const matchingSpecialties = DEFAULT_SPECIALTIES.filter((s) => input.specialtyIds?.includes(s.id));
      const qualifications = (input.qualifications ?? []).map((q, idx) => ({
        id: q.id ?? `22222222-2222-4222-8222-${String(idx + 1).padStart(12, '0')}`,
        degree: q.degree,
        institution: q.institution,
        year: q.year ?? null,
      }));

      const updated: DoctorProfile = {
        ...current,
        registrationNumber: input.registrationNumber ?? current.registrationNumber,
        registrationCouncil: input.registrationCouncil ?? current.registrationCouncil,
        specialties: matchingSpecialties.length > 0 ? matchingSpecialties : current.specialties,
        qualifications: qualifications.length > 0 ? qualifications : current.qualifications,
        yearsExperience: input.yearsExperience ?? current.yearsExperience,
        consultationModes: input.consultationModes ?? current.consultationModes,
        languages: input.languages ?? current.languages,
        clinicName: input.clinicName ?? current.clinicName,
        clinicAddress: input.clinicAddress ?? current.clinicAddress,
        clinicCity: input.clinicCity ?? current.clinicCity,
        consultationFee: input.consultationFee ?? current.consultationFee,
        feeCurrency: input.feeCurrency ?? current.feeCurrency,
        bio: input.bio ?? current.bio,
        acceptsNewPatients: input.acceptsNewPatients ?? current.acceptsNewPatients,
      };

      try {
        const serverResult = await apiRequest('/api/v1/doctors/me/profile', doctorProfileSchema, {
          method: 'PUT',
          body: input,
        });
        setStoredDemoDoctorProfile(serverResult);
        return serverResult;
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.code === 'UNAUTHENTICATED')) {
          throw error;
        }
        setStoredDemoDoctorProfile(updated);
        return updated;
      }
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(doctorQueryKeys.profile, profile);
    },
  });
}

export function useAvailability(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: doctorQueryKeys.availability,
    queryFn: async ({ signal }) => {
      try {
        const fetched = await apiRequest('/api/v1/doctors/me/availability', availabilitySchema, { signal });
        setStoredDemoAvailability(fetched);
        return fetched;
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.code === 'UNAUTHENTICATED')) {
          throw error;
        }
        return getStoredDemoAvailability();
      }
    },
    enabled: options.enabled ?? true,
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AvailabilityUpdate) => {
      const current = getStoredDemoAvailability();
      const updated: Availability = {
        ...current,
        slotMinutes: input.slotMinutes,
        rules: input.rules,
      };

      try {
        const serverResult = await apiRequest('/api/v1/doctors/me/availability', availabilitySchema, {
          method: 'PUT',
          body: input,
        });
        setStoredDemoAvailability(serverResult);
        return serverResult;
      } catch {
        setStoredDemoAvailability(updated);
        return updated;
      }
    },
    onSuccess: async (availability) => {
      queryClient.setQueryData(doctorQueryKeys.availability, availability);
      // Sync slot length to doctor profile as well
      const currentProfile = getStoredDemoDoctorProfile();
      const updatedProfile = { ...currentProfile, slotMinutes: availability.slotMinutes };
      setStoredDemoDoctorProfile(updatedProfile);
      queryClient.setQueryData(doctorQueryKeys.profile, updatedProfile);
      await queryClient.invalidateQueries({ queryKey: doctorQueryKeys.profile });
    },
  });
}
