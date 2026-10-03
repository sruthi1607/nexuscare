import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ApiError } from '../../lib/api-client';
import { ErrorState } from './ErrorState';

export interface QueryStateProps<T> {
  query: UseQueryResult<T>;
  /** Skeleton matching the final layout. */
  loading: ReactNode;
  errorTitle?: string;
  children: (data: T) => ReactNode;
}

/**
 * Renders the loading, error (with retry) or success state of a query consistently. Empty states
 * are the caller's job because only it knows what "empty" means for its data.
 */
export function QueryState<T>({
  query,
  loading,
  errorTitle = 'Could not load this information',
  children,
}: QueryStateProps<T>) {
  if (query.isPending) return <>{loading}</>;
  if (query.isError) {
    const error = query.error;
    return (
      <ErrorState
        title={errorTitle}
        message={error.message}
        requestId={error instanceof ApiError ? error.requestId : undefined}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }
  return <>{children(query.data)}</>;
}
