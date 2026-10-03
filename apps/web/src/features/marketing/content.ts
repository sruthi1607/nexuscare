import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bot,
  CalendarDays,
  ClipboardList,
  FileText,
  Languages,
  Pill,
  ShoppingBag,
  Stethoscope,
  UserPlus,
  Users,
  Video,
  Bus,
  FolderX,
  CalendarX,
  UserX,
  BellRing,
  ShieldCheck,
} from 'lucide-react';

/**
 * Marketing copy shared by the landing, features and how-it-works pages. Kept in one module so
 * wording stays consistent and can be moved into translation files when i18n is introduced.
 */

export interface FeatureSummary {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const coreFeatures: FeatureSummary[] = [
  {
    id: 'telemedicine',
    icon: Video,
    title: 'Telemedicine',
    description:
      'Video and audio consultations with verified doctors, with an audio-only mode for weak connections.',
  },
  {
    id: 'appointments',
    icon: CalendarDays,
    title: 'Appointments',
    description:
      'Find available slots, book in a few taps and reschedule or cancel when plans change.',
  },
  {
    id: 'records',
    icon: FileText,
    title: 'Medical records',
    description:
      'Keep reports, scans and discharge summaries together, and decide who can see them.',
  },
  {
    id: 'prescriptions',
    icon: ClipboardList,
    title: 'Prescriptions',
    description:
      'Digital prescriptions from your consultations, always available when you need them.',
  },
  {
    id: 'medications',
    icon: Pill,
    title: 'Medication reminders',
    description: 'Reminders at the right times and a simple record of doses taken.',
  },
  {
    id: 'pharmacy',
    icon: ShoppingBag,
    title: 'Online pharmacy',
    description: 'Order prescribed medicines from partner pharmacies and track delivery.',
  },
  {
    id: 'assistant',
    icon: Bot,
    title: 'AI health assistant',
    description: 'Answers to general health questions, grounded in trusted sources with citations.',
  },
  {
    id: 'medtranslator',
    icon: Languages,
    title: 'MedTranslator',
    description: 'Plain-language explanations of medical documents, in the language you prefer.',
  },
  {
    id: 'monitoring',
    icon: Activity,
    title: 'Health monitoring',
    description:
      'Connect monitoring devices and see your readings, with alerts when something needs attention.',
  },
  {
    id: 'family',
    icon: Users,
    title: 'Family ecosystem',
    description: 'Let caregivers help — with permissions you choose and can revoke at any time.',
  },
];

export interface Problem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const accessProblems: Problem[] = [
  {
    icon: Bus,
    title: 'Distance and travel',
    description:
      'A routine consultation can mean a long journey, lost wages and a full day away from family.',
  },
  {
    icon: UserX,
    title: 'Too few specialists',
    description:
      'Specialist care is concentrated in cities, so people outside them often wait or go without.',
  },
  {
    icon: FolderX,
    title: 'Scattered records',
    description: 'Paper reports get lost between visits, so doctors rarely see the full picture.',
  },
  {
    icon: CalendarX,
    title: 'Missed follow-ups',
    description: 'Without reminders or support at home, treatment plans and follow-up visits slip.',
  },
];

export interface JourneyStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const patientJourney: JourneyStep[] = [
  {
    icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up and add your basic health profile. It takes a few minutes.',
  },
  {
    icon: Stethoscope,
    title: 'Find a verified doctor',
    description: 'Search by specialty and language, then pick a time that suits you.',
  },
  {
    icon: Video,
    title: 'Consult remotely',
    description: 'Join a video or audio consultation from your phone or computer.',
  },
  {
    icon: BellRing,
    title: 'Stay on track',
    description: 'Prescriptions, reminders and follow-ups arrive in one place.',
  },
];

export const doctorJourney: JourneyStep[] = [
  {
    icon: UserPlus,
    title: 'Apply as a doctor',
    description: 'Register with your medical registration details and specialties.',
  },
  {
    icon: ShieldCheck,
    title: 'Get verified',
    description: 'Our team verifies your credentials before your profile is listed.',
  },
  {
    icon: CalendarDays,
    title: 'Publish availability',
    description: 'Set weekly hours and time off. Patients book only free slots.',
  },
  {
    icon: ClipboardList,
    title: 'Consult and prescribe',
    description: 'Hold consultations, write notes and issue digital prescriptions.',
  },
];

export const familyJourney: JourneyStep[] = [
  {
    icon: Users,
    title: 'Receive an invitation',
    description: 'A patient invites you as a caregiver using your email address.',
  },
  {
    icon: UserPlus,
    title: 'Accept and sign in',
    description: 'Create a caregiver account or sign in to accept the invitation.',
  },
  {
    icon: ShieldCheck,
    title: 'See what you are allowed to',
    description: 'You only see the information the patient chose to share.',
  },
  {
    icon: BellRing,
    title: 'Get timely alerts',
    description: 'Receive missed-medication and emergency alerts if the patient allows it.',
  },
];
