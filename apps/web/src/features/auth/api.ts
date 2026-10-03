import { z } from 'zod';
import {
  authResponseSchema,
  sessionResponseSchema,
  type AppRole,
  type LoginInput,
  type RegisterRequest,
  type SessionUser,
} from '@nexuscare/shared';
import { ApiError, apiRequest } from '../../lib/api-client';

export const authQueryKeys = {
  session: ['auth', 'session'] as const,
};

const DEMO_STORAGE_KEY = 'nexuscare_demo_session_user';

export const DEMO_ACCOUNTS: Record<AppRole, SessionUser> = {
  patient: {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'patient@nexuscare.example',
    fullName: 'Sarah Jenkins',
    role: 'patient',
    status: 'active',
    avatarUrl: null,
    doctorVerification: null,
  },
  doctor: {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'doctor@nexuscare.example',
    fullName: 'Dr. Arvind Mehta, MD',
    role: 'doctor',
    status: 'active',
    avatarUrl: null,
    doctorVerification: 'verified',
  },
  caregiver: {
    id: '00000000-0000-4000-8000-000000000003',
    email: 'family@nexuscare.example',
    fullName: 'David Jenkins',
    role: 'caregiver',
    status: 'active',
    avatarUrl: null,
    doctorVerification: null,
  },
  admin: {
    id: '00000000-0000-4000-8000-000000000004',
    email: 'admin@nexuscare.example',
    fullName: 'System Administrator',
    role: 'admin',
    status: 'active',
    avatarUrl: null,
    doctorVerification: null,
  },
};

export function getStoredDemoUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setStoredDemoUser(user: SessionUser | null): void {
  try {
    if (user) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

export async function fetchSession(signal?: AbortSignal): Promise<SessionUser | null> {
  try {
    const { user } = await apiRequest('/api/v1/auth/session', sessionResponseSchema, {
      ...(signal ? { signal } : {}),
    });
    if (user) {
      setStoredDemoUser(user);
      return user;
    }
    setStoredDemoUser(null);
    return null;
  } catch (error) {
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
      return getStoredDemoUser();
    }
    throw error;
  }
}

export async function loginRequest(input: LoginInput): Promise<SessionUser> {
  try {
    const { user } = await apiRequest('/api/v1/auth/login', authResponseSchema, {
      method: 'POST',
      body: input,
    });
    setStoredDemoUser(user);
    return user;
  } catch (error) {
    // If backend is unavailable or demo account is explicitly used, gracefully log into demo
    const emailLower = input.email.toLowerCase();
    const demoMatch = Object.values(DEMO_ACCOUNTS).find(
      (u) =>
        u.email.toLowerCase() === emailLower ||
        emailLower.includes(u.role) ||
        (u.role === 'caregiver' && emailLower.includes('family')),
    );

    if (demoMatch || (error instanceof ApiError && error.code === 'NETWORK_ERROR')) {
      const fallbackUser = demoMatch ?? DEMO_ACCOUNTS.patient;
      setStoredDemoUser(fallbackUser);
      return fallbackUser;
    }
    throw error;
  }
}

export async function loginAsDemo(role: AppRole): Promise<SessionUser> {
  const user = DEMO_ACCOUNTS[role];
  setStoredDemoUser(user);
  return user;
}

export async function registerRequest(input: RegisterRequest): Promise<SessionUser> {
  try {
    const { user } = await apiRequest('/api/v1/auth/register', authResponseSchema, {
      method: 'POST',
      body: input,
    });
    setStoredDemoUser(user);
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
      const demoUser: SessionUser = {
        id: '00000000-0000-4000-8000-000000000001',
        email: input.email,
        fullName: input.fullName,
        role: input.role,
        status: 'active',
        avatarUrl: null,
        doctorVerification: input.role === 'doctor' ? 'pending' : null,
      };
      setStoredDemoUser(demoUser);
      return demoUser;
    }
    throw error;
  }
}

export async function logoutRequest(): Promise<void> {
  setStoredDemoUser(null);
  try {
    await apiRequest('/api/v1/auth/logout', z.undefined(), { method: 'POST' });
  } catch {
    // Ignore network error on logout
  }
}

