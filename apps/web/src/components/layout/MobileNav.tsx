import { NavLink } from 'react-router';
import { Menu } from 'lucide-react';
import type { DashboardNavItem, DashboardNavSection } from '../../app/navigation';
import { cn } from '../../lib/cn';
import { Sheet } from '../ui/Sheet';
import { SidebarNav } from './Sidebar';

export interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: DashboardNavSection[];
}

/** Full dashboard navigation in a slide-in drawer (below lg). */
export function MobileNavDrawer({ open, onOpenChange, sections }: MobileNavDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Dashboard navigation">
      <SidebarNav
        sections={sections}
        onNavigate={() => {
          onOpenChange(false);
        }}
      />
    </Sheet>
  );
}

/**
 * Bottom tab bar for phones (below md): the four primary destinations plus "Menu", which opens
 * the full drawer. Thumb-reachable navigation for one-handed use.
 */
export function MobileBottomNav({
  items,
  onOpenMenu,
}: {
  items: DashboardNavItem[];
  onOpenMenu: () => void;
}) {
  const itemClasses =
    'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium';

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex flex-1">
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                cn(itemClasses, isActive ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800')
              }
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </NavLink>
          </li>
        ))}
        <li className="flex flex-1">
          <button
            type="button"
            onClick={onOpenMenu}
            className={cn(itemClasses, 'text-slate-500 hover:text-slate-800')}
          >
            <Menu className="size-5" aria-hidden="true" />
            <span>Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
