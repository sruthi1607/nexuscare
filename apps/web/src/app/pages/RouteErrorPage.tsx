import { isRouteErrorResponse, useRouteError } from 'react-router';
import { ErrorState } from '../../components/common/ErrorState';
import { NotFoundPage } from './NotFoundPage';

/** Rendered by the router when a route throws while loading or rendering. */
export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <ErrorState
        title="Something went wrong"
        message="An unexpected error occurred while displaying this page. Reloading usually fixes it."
        onRetry={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
