import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, LogOut, Menu } from 'lucide-react';
import { notificationsPath } from '../../app/navigation';
import { useAuth, useCurrentUser } from '../../features/auth/auth-context';
import { ROLE_LABEL, roleHomePath } from '../../features/auth/roles';
import { Logo } from '../common/Logo';
import { Badge } from '../ui/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/Dropdown';
import { useToast } from '../ui/toast-context';

const iconButton =
  'inline-flex size-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')
  ).toUpperCase();
}

export function DashboardTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      toast({ tone: 'success', title: 'Signed out', description: 'See you next time.' });
    } catch {
      toast({
        tone: 'warning',
        title: 'Signed out on this device',
        description: 'We could not reach the server, but your local session was cleared.',
      });
    } finally {
      setSigningOut(false);
      void navigate('/login', { replace: true });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:px-4">
      <button
        type="button"
        className={`${iconButton} lg:hidden`}
        aria-label="Open navigation"
        onClick={onOpenMenu}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <Link
        to={roleHomePath(user.role)}
        aria-label="Nexus Care dashboard"
        className="rounded-md lg:w-60"
      >
        <Logo />
      </Link>

      <Badge tone="brand" className="ml-1 hidden sm:inline-flex">
        {ROLE_LABEL[user.role]}
      </Badge>

      <div className="ml-auto flex items-center gap-1">
        <Link to={notificationsPath(user.role)} className={iconButton} aria-label="Notifications">
          <Bell className="size-5" aria-hidden="true" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 sm:pr-2"
            aria-label={`Account menu for ${user.fullName}`}
          >
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white"
            >
              {initials(user.fullName)}
            </span>
            <span className="hidden max-w-40 truncate text-sm font-medium text-slate-800 sm:block">
              {user.fullName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              <span className="block text-sm font-semibold text-slate-900">{user.fullName}</span>
              <span className="block truncate">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tone="danger"
              disabled={signingOut}
              onSelect={() => {
                void signOut();
              }}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
