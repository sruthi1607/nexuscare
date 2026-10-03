import { SearchX } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you are looking for does not exist or has moved.
      </p>
      <ButtonLink to="/" className="mt-6">
        Back to home
      </ButtonLink>
    </div>
  );
}
