import { NavLink } from 'react-router';
import type { DashboardNavSection } from '../../app/navigation';
import { cn } from '../../lib/cn';

export interface SidebarNavProps {
  sections: DashboardNavSection[];
  /** Called after a link is chosen (closes the mobile drawer). */
  onNavigate?: () => void;
  className?: string;
}

/** Section-grouped dashboard navigation, shared by the desktop sidebar and the mobile drawer. */
export function SidebarNav({ sections, onNavigate, className }: SidebarNavProps) {
  return (
    <nav aria-label="Dashboard" className={cn('flex flex-col gap-6 p-3', className)}>
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="px-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {section.title}
          </h2>
          <ul className="mt-2 flex flex-col gap-0.5">
            {section.items.map(({ to, label, icon: Icon, planned }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )
                  }
                >
                  <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{label}</span>
                  {planned ? (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 group-aria-[current=page]:bg-white">
                      Soon
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Fixed desktop sidebar (lg and up). Smaller screens use the drawer and bottom bar. */
export function Sidebar({ sections }: { sections: DashboardNavSection[] }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Logo row mirrors the top bar height */}
      <div className="flex-1 overflow-y-auto pt-16">
        <SidebarNav sections={sections} />
      </div>
    </aside>
  );
}
