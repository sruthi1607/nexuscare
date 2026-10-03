import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BellRing,
  BookOpen,
  Bot,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Languages,
  LayoutDashboard,
  MailPlus,
  Palette,
  Pill,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  UserCircle,
  UserCog,
  Users,
  Video,
} from 'lucide-react';
import type { AppRole } from '@nexuscare/shared';
import { roleHomePath } from '../features/auth/roles';

export interface PublicNavItem {
  to: string;
  label: string;
}

/** Top-level public navigation (navbar, mobile menu and footer). */
export const publicNav: PublicNavItem[] = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/features', label: 'Features' },
  { to: '/doctors', label: 'Find doctors' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar (keep to four items per role). */
  primary?: boolean;
  /**
   * Set for sections not built yet: the route renders an honest "coming in a later phase" page
   * describing what the section will do.
   */
  planned?: { summary: string };
}

export interface DashboardNavSection {
  title: string;
  items: DashboardNavItem[];
}

const planned = (summary: string) => ({ planned: { summary } });

const patientNav: DashboardNavSection[] = [
  {
    title: 'Overview',
    items: [{ to: '/patient', label: 'Dashboard', icon: LayoutDashboard, primary: true }],
  },
  {
    title: 'My health',
    items: [
      { to: '/patient/profile', label: 'My profile', icon: UserCircle },
      { to: '/patient/medical', label: 'Medical info', icon: HeartPulse, primary: true },
    ],
  },
  {
    title: 'Care',
    items: [
      {
        to: '/patient/appointments',
        label: 'Appointments',
        icon: CalendarDays,
        primary: true,
      },
      {
        to: '/patient/consultations',
        label: 'Consultations',
        icon: Video,
      },
      {
        to: '/patient/find-doctors',
        label: 'Find doctors',
        icon: Stethoscope,
      },
    ],
  },
  {
    title: 'Health records',
    items: [
      {
        to: '/patient/records',
        label: 'Medical records',
        icon: FileText,
        primary: true,
      },
      {
        to: '/patient/prescriptions',
        label: 'Prescriptions',
        icon: ClipboardList,
      },
      {
        to: '/patient/medications',
        label: 'Medications',
        icon: Pill,
      },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      {
        to: '/patient/health',
        label: 'Health monitoring',
        icon: Activity,
      },
      {
        to: '/patient/alerts',
        label: 'Health alerts',
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: 'Assistance',
    items: [
      {
        to: '/patient/assistant',
        label: 'AI assistant',
        icon: Bot,
      },
      {
        to: '/patient/medtranslator',
        label: 'MedTranslator',
        icon: Languages,
      },
    ],
  },
  {
    title: 'More',
    items: [
      {
        to: '/patient/pharmacy',
        label: 'Pharmacy',
        icon: ShoppingBag,
      },
      {
        to: '/patient/family',
        label: 'Family',
        icon: Users,
      },
      {
        to: '/patient/notifications',
        label: 'Notifications',
        icon: BellRing,
        primary: true,
      },
      {
        to: '/patient/settings',
        label: 'Settings',
        icon: Settings,
      },
      {
        to: '/patient/insurance',
        label: 'Insurance claims',
        icon: ShieldCheck,
        ...planned('Submit and track cashless health insurance claims.'),
      },
    ],
  },
];

const doctorNav: DashboardNavSection[] = [
  {
    title: 'Overview',
    items: [{ to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, primary: true }],
  },
  {
    title: 'Practice',
    items: [
      { to: '/doctor/schedule', label: 'Availability', icon: CalendarClock, primary: true },
      {
        to: '/doctor/appointments',
        label: 'Appointments',
        icon: CalendarDays,
        primary: true,
      },
      {
        to: '/doctor/consultations',
        label: 'Consultations',
        icon: Video,
      },
      {
        to: '/doctor/patients',
        label: 'My patients',
        icon: Users,
      },
      {
        to: '/doctor/prescriptions',
        label: 'Prescriptions',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/doctor/profile', label: 'My profile', icon: UserCircle },
      { to: '/doctor/professional', label: 'Professional profile', icon: UserCog, primary: true },
      {
        to: '/doctor/notifications',
        label: 'Notifications',
        icon: BellRing,
        primary: true,
      },
    ],
  },
];

const familyNav: DashboardNavSection[] = [
  {
    title: 'Overview',
    items: [{ to: '/family', label: 'Dashboard', icon: LayoutDashboard, primary: true }],
  },
  {
    title: 'Caring for',
    items: [
      {
        to: '/family/patients',
        label: 'Linked patients',
        icon: Users,
        primary: true,
      },
      {
        to: '/family/alerts',
        label: 'Alerts',
        icon: AlertTriangle,
        primary: true,
      },
      {
        to: '/family/invitations',
        label: 'Invitations',
        icon: MailPlus,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/family/profile', label: 'My profile', icon: UserCircle },
      {
        to: '/family/notifications',
        label: 'Notifications',
        icon: BellRing,
        primary: true,
      },
    ],
  },
];

const adminNav: DashboardNavSection[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard, primary: true }],
  },
  {
    title: 'People',
    items: [
      {
        to: '/admin/users',
        label: 'Users',
        icon: Users,
        primary: true,
      },
      {
        to: '/admin/doctors',
        label: 'Doctor verification',
        icon: ShieldCheck,
        primary: true,
      },
    ],
  },
  {
    title: 'Platform',
    items: [
      {
        to: '/admin/appointments',
        label: 'Appointments',
        icon: CalendarDays,
      },
      {
        to: '/admin/pharmacy',
        label: 'Pharmacy',
        icon: ShoppingBag,
      },
      {
        to: '/admin/knowledge',
        label: 'Knowledge base',
        icon: BookOpen,
      },
      {
        to: '/admin/analytics',
        label: 'Analytics',
        icon: BarChart3,
      },
      {
        to: '/admin/audit-logs',
        label: 'Audit logs',
        icon: ScrollText,
        primary: true,
      },
      {
        to: '/admin/settings',
        label: 'Settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Account',
    items: [{ to: '/admin/profile', label: 'My profile', icon: UserCircle }],
  },
];

const navByRole: Record<AppRole, DashboardNavSection[]> = {
  patient: patientNav,
  doctor: doctorNav,
  caregiver: familyNav,
  admin: adminNav,
};

/** The design-system reference is available to every signed-in user in development builds. */
const designSection: DashboardNavSection = {
  title: 'Design',
  items: [{ to: '/ui-kit', label: 'UI kit', icon: Palette }],
};

export function navigationForRole(role: AppRole): DashboardNavSection[] {
  const sections = navByRole[role];
  return import.meta.env.DEV ? [...sections, designSection] : sections;
}

export function primaryNavItems(role: AppRole): DashboardNavItem[] {
  return navByRole[role].flatMap((section) => section.items).filter((item) => item.primary);
}

/** Finds the nav entry for a path within the given role's navigation. */
export function findNavItem(role: AppRole, pathname: string): DashboardNavItem | undefined {
  const normalised = pathname.replace(/\/+$/, '') || '/';
  return navByRole[role].flatMap((section) => section.items).find((item) => item.to === normalised);
}

/** Notification centre path for the role (used by the top bar bell). */
export function notificationsPath(role: AppRole): string {
  return `${roleHomePath(role)}/notifications`;
}
