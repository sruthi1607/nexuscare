import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { authQueryKeys } from '../features/auth/api';
import { ApiError } from '../lib/api-client';

/**
 * The app's QueryClient. `retry: false` is for tests, where retries would consume mocked
 * responses.
 */
export function createQueryClient({ retry = true }: { retry?: boolean } = {}): QueryClient {
  // When any request reports the session is gone (expired, revoked, user suspended), reflect that
  // immediately so route guards send the user to sign in.
  const onError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      queryClient.setQueryData(authQueryKeys.session, null);
    }
  };
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        // Retry once for transient network blips, but never retry 4xx (auth/permission/validation).
        retry: retry
          ? (failureCount, error) =>
              !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
              failureCount < 1
          : false,
      },
    },
  });
  return queryClient;
}
