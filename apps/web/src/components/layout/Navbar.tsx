import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu } from 'lucide-react';
import { publicNav } from '../../app/navigation';
import { useAuth } from '../../features/auth/auth-context';
import { roleHomePath } from '../../features/auth/roles';
import { cn } from '../../lib/cn';
import { Logo } from '../common/Logo';
import { ButtonLink } from '../ui/Button';
import { Sheet } from '../ui/Sheet';

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'text-brand-800' : 'text-slate-600 hover:text-slate-900',
  );

/** Public site header: desktop links, auth actions and a slide-in menu on small screens. */
export function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Nexus Care home" className="rounded-md">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {publicNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={linkClasses}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <ButtonLink to={roleHomePath(user.role)} className="hidden sm:inline-flex">
              Go to dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" className="hidden sm:inline-flex">
                Log in
              </ButtonLink>
              <ButtonLink to="/register" className="hidden sm:inline-flex">
                Get started
              </ButtonLink>
            </>
          )}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen(true);
            }}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="right">
        <nav aria-label="Mobile" className="flex h-full flex-col p-4">
          <ul className="flex flex-col gap-1">
            <li>
              <NavLink to="/" end onClick={closeMenu} className={mobileLinkClasses}>
                Home
              </NavLink>
            </li>
            {publicNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} onClick={closeMenu} className={mobileLinkClasses}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-6">
            {user ? (
              <ButtonLink to={roleHomePath(user.role)} onClick={closeMenu} size="lg">
                Go to dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink to="/register" onClick={closeMenu} size="lg">
                  Get started
                </ButtonLink>
                <ButtonLink to="/login" onClick={closeMenu} variant="outline" size="lg">
                  Log in
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      </Sheet>
    </header>
  );
}

function mobileLinkClasses({ isActive }: { isActive: boolean }) {
  return cn(
    'block rounded-lg px-3 py-3 text-base font-medium',
    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50',
  );
}
