import { Link } from 'react-router';
import { Phone } from 'lucide-react';
import { publicNav } from '../../app/navigation';
import { Logo } from '../common/Logo';

const columns = [
  {
    title: 'Platform',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/how-it-works', label: 'How it works' },
      { to: '/doctors', label: 'Find doctors' },
      { to: '/register?role=doctor', label: 'Join as a doctor' },
    ],
  },
  {
    title: 'Company',
    links: publicNav.filter((item) => ['/about', '/contact'].includes(item.to)),
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Log in' },
      { to: '/register', label: 'Create account' },
      { to: '/status', label: 'System status' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-slate-600">
              Telemedicine and healthcare management designed for rural and underserved communities.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold text-slate-900">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 sm:flex-row sm:items-start">
          <Phone className="size-5 shrink-0 text-danger-700" aria-hidden="true" />
          <p>
            <strong className="font-semibold text-slate-900">In an emergency</strong>, contact your
            local emergency services immediately. Nexus Care is not an emergency service.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Nexus Care. Software prototype.</p>
          <p>
            Not a medical device. Information on this platform does not replace professional medical
            advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
