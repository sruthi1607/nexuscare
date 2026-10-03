import { useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { DashboardTopbar } from '../../components/layout/DashboardTopbar';
import { MobileBottomNav, MobileNavDrawer } from '../../components/layout/MobileNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { SkipLink } from '../../components/layout/SkipLink';
import { useCurrentUser } from '../../features/auth/auth-context';
import { navigationForRole, primaryNavItems } from '../navigation';

/**
 * Authenticated application shell; navigation comes from the signed-in user's role.
 * - lg and up: fixed sidebar + top bar.
 * - md to lg (tablet): top bar with a menu button that opens the navigation drawer.
 * - below md (phone): additionally a bottom tab bar for the primary destinations.
 */
export function DashboardLayout() {
  const user = useCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sections = navigationForRole(user.role);
  const openDrawer = () => {
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <SkipLink />
      <DashboardTopbar onOpenMenu={openDrawer} />
      <Sidebar sections={sections} />
      <MobileNavDrawer open={drawerOpen} onOpenChange={setDrawerOpen} sections={sections} />

      <main id="main" tabIndex={-1} className="pt-16 pb-24 focus:outline-none md:pb-10 lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>

      <MobileBottomNav items={primaryNavItems(user.role)} onOpenMenu={openDrawer} />
      <ScrollRestoration />
    </div>
  );
}
