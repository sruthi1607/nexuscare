import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  medicalProfileSchema,
  type MedicalProfile,
  type MedicalProfileSection,
} from '@nexuscare/shared';
import { ApiError, apiRequest } from '../../lib/api-client';

const BASE = '/api/v1/patients/me/medical-profile';

export const medicalQueryKeys = {
  own: ['medical-profile', 'me'] as const,
};

const MEDICAL_PROFILE_STORAGE_KEY = 'nexuscare_demo_medical_profile_v2';

export const DEFAULT_DEMO_MEDICAL_PROFILE: MedicalProfile = {
  patientId: '00000000-0000-4000-8000-000000000001',
  basics: {
    bloodGroup: 'O+',
    heightCm: 168,
    weightKg: 68,
  },
  emergencyContact: {
    name: 'David Jenkins',
    relationship: 'Spouse',
    phone: '+1 (555) 234-5679',
  },
  allergies: [
    {
      id: '00000000-0000-4000-8000-000000000011',
      substance: 'Penicillin & Amoxicillin derivatives',
      reaction: 'Severe urticaria, cutaneous rash, and mild bronchospasm',
      severity: 'severe',
    },
    {
      id: '00000000-0000-4000-8000-000000000012',
      substance: 'Peanuts & Tree nuts',
      reaction: 'Oral itching and lip swelling',
      severity: 'moderate',
    },
  ],
  conditions: [
    {
      id: '00000000-0000-4000-8000-000000000021',
      name: 'Essential Hypertension (Stage 1)',
      status: 'active',
      sinceYear: 2021,
      notes: 'Well-managed on Telmisartan 40mg daily with regular home BP logs.',
    },
    {
      id: '00000000-0000-4000-8000-000000000022',
      name: 'Type 2 Diabetes Mellitus',
      status: 'managed',
      sinceYear: 2023,
      notes: 'Latest HbA1c 6.8% (Target < 7.0%). Controlled with Metformin 500mg ER.',
    },
  ],
  medications: [
    {
      id: '00000000-0000-4000-8000-000000000031',
      patientId: '00000000-0000-4000-8000-000000000001',
      prescriptionItemId: null,
      name: 'Telmisartan',
      dose: '40 mg',
      frequency: 'Once daily in the morning',
      startedOn: '2023-06-01',
      status: 'active',
      source: 'prescribed',
      notes: 'Prescribed by Dr. Arvind Mehta for cardiovascular risk reduction.',
    },
    {
      id: '00000000-0000-4000-8000-000000000032',
      patientId: '00000000-0000-4000-8000-000000000001',
      prescriptionItemId: null,
      name: 'Metformin Hydrochloride ER',
      dose: '500 mg',
      frequency: 'Twice daily with meals',
      startedOn: '2024-01-15',
      status: 'active',
      source: 'prescribed',
      notes: 'Take with breakfast and dinner.',
    },
    {
      id: '00000000-0000-4000-8000-000000000033',
      patientId: '00000000-0000-4000-8000-000000000001',
      prescriptionItemId: null,
      name: 'Vitamin D3 (Cholecalciferol)',
      dose: '60,000 IU',
      frequency: 'Once weekly (Sundays)',
      startedOn: '2025-01-01',
      status: 'active',
      source: 'self_reported',
      notes: 'Over-the-counter dietary supplement.',
    },
  ],
  history: [
    {
      id: '00000000-0000-4000-8000-000000000041',
      kind: 'surgery',
      year: 2018,
      description: 'Laparoscopic Appendectomy',
      notes: 'Uncomplicated recovery, no adverse anaesthetic events.',
    },
    {
      id: '00000000-0000-4000-8000-000000000042',
      kind: 'injury',
      year: 2020,
      description: 'Right Ankle Sprain (Grade II)',
      notes: 'Treated with physiotherapy and brace.',
    },
  ],
  updatedAt: null,
};

export function getStoredDemoMedicalProfile(): MedicalProfile {
  try {
    const raw = localStorage.getItem(MEDICAL_PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MedicalProfile;
  } catch {
    // ignore
  }
  return DEFAULT_DEMO_MEDICAL_PROFILE;
}

export function setStoredDemoMedicalProfile(profile: MedicalProfile): void {
  try {
    localStorage.setItem(MEDICAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function useMedicalProfile(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: medicalQueryKeys.own,
    queryFn: async ({ signal }) => {
      try {
        return await apiRequest(BASE, medicalProfileSchema, { signal });
      } catch (error) {
        if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
          return getStoredDemoMedicalProfile();
        }
        throw error;
      }
    },
    initialData: () => getStoredDemoMedicalProfile(),
    enabled: options.enabled ?? true,
  });
}

/** Saves one section; the server returns the whole updated profile, which replaces the cache. */
export function useUpdateMedicalSection(section: MedicalProfileSection) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: unknown): Promise<MedicalProfile> => {
      try {
        return await apiRequest(`${BASE}/${section}`, medicalProfileSchema, { method: 'PUT', body });
      } catch (error) {
        if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
          const current = getStoredDemoMedicalProfile();
          const updated: MedicalProfile = {
            ...current,
            [section]: body as any,
          };
          setStoredDemoMedicalProfile(updated);
          return updated;
        }
        throw error;
      }
    },
    onSuccess: (profile) => {
      setStoredDemoMedicalProfile(profile);
      queryClient.setQueryData(medicalQueryKeys.own, profile);
    },
  });
}


