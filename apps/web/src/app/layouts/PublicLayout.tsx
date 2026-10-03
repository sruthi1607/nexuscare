import { Outlet, ScrollRestoration } from 'react-router';
import { Footer } from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { SkipLink } from '../../components/layout/SkipLink';

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SkipLink />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
