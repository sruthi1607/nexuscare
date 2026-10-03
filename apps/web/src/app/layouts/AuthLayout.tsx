import { Link, Outlet, ScrollRestoration } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { SkipLink } from '../../components/layout/SkipLink';

const highlights = [
  'Consult verified doctors from home',
  'Keep records and prescriptions together',
  'Share only what you choose with family',
];

/** Split layout: brand panel on large screens, centred form everywhere. */
export function AuthLayout() {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <SkipLink />
      <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 size-96 rounded-full bg-brand-700/40"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 size-80 rounded-full bg-brand-800/60"
        />
        <Link to="/" aria-label="Nexus Care home" className="relative w-fit rounded-md">
          <Logo inverted />
        </Link>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight">
            Care that reaches you, wherever you live.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((text) => (
              <li key={text} className="flex items-center gap-3 text-brand-50">
                <CheckCircle2 className="size-5 text-brand-300" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-12 text-xs text-brand-200">
            Nexus Care is a software prototype and not a medical device.
          </p>
        </div>
      </aside>

      <main id="main" tabIndex={-1} className="flex flex-col focus:outline-none">
        <div className="flex h-16 items-center px-4 sm:px-8 lg:hidden">
          <Link to="/" aria-label="Nexus Care home" className="rounded-md">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </main>
      <ScrollRestoration />
    </div>
  );
}
