import { useCallback, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginInput, RegisterRequest, SessionUser } from '@nexuscare/shared';
import { authQueryKeys, fetchSession, loginRequest, logoutRequest, registerRequest } from './api';
import { AuthContext, type AuthContextValue } from './auth-context';

/**
 * Client-side auth state. The session itself lives in an httpOnly cookie the browser cannot read;
 * this provider asks the API who is signed in (on load and on window focus) and keeps the answer
 * in the query cache. It is a UX layer only — the API enforces every permission.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: authQueryKeys.session,
    queryFn: ({ signal }) => fetchSession(signal),
    staleTime: 60_000,
    retry: 1,
  });

  const setUser = useCallback(
    (user: SessionUser | null) => {
      queryClient.setQueryData(authQueryKeys.session, user);
    },
    [queryClient],
  );

  const login = useCallback(
    async (input: LoginInput) => {
      const user = await loginRequest(input);
      // Drop anything cached for a previous user before showing the new one.
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'auth' });
      setUser(user);
      return user;
    },
    [queryClient, setUser],
  );

  const register = useCallback(
    async (input: RegisterRequest) => {
      const user = await registerRequest(input);
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'auth' });
      setUser(user);
      return user;
    },
    [queryClient, setUser],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      // Even if the network call fails, never keep showing private data on this device.
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'auth' });
      setUser(null);
    }
  }, [queryClient, setUser]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session.data ?? null;
    let status: AuthContextValue['status'];
    if (session.isPending) status = 'loading';
    else if (user) status = 'authenticated';
    else status = 'unauthenticated';
    return { status, user, login, register, logout };
  }, [session.data, session.isPending, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
