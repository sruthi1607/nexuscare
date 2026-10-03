import type { ComponentType } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import type { AppRole } from '@nexuscare/shared';
import { LandingPage } from '../features/marketing/pages/LandingPage';
import { RedirectIfAuthenticated, RequireAuth, RequireRole, RoleHomeRedirect } from './guards';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorPage } from './pages/RouteErrorPage';

const plannedSection: RouteObject = {
  path: '*',
  lazy: async () => ({
    Component: (await import('../features/dashboard/pages/PlannedSectionPage')).PlannedSectionPage,
  }),
};

/** Lazy-loaded profile pages, shared by every role area. */
const profileRoutes: RouteObject[] = [
  {
    path: 'profile',
    lazy: async () => ({
      Component: (await import('../features/profile/pages/ProfilePage')).ProfilePage,
    }),
  },
  {
    path: 'profile/edit',
    lazy: async () => ({
      Component: (await import('../features/profile/pages/EditProfilePage')).EditProfilePage,
    }),
  },
];

/** One protected area per role: home page + built section pages + catch-all for planned ones. */
function roleArea(
  path: string,
  role: AppRole,
  loadHome: () => Promise<{ Component: ComponentType }>,
  extraRoutes: RouteObject[] = [],
): RouteObject {
  return {
    path,
    element: <RequireRole roles={[role]} />,
    children: [{ index: true, lazy: loadHome }, ...profileRoutes, ...extraRoutes, plannedSection],
  };
}

/*
 * The landing page is bundled eagerly for the fastest first paint; every other page is a lazy
 * chunk so phones on slow networks only download what they open.
 *
 * Guards here are for UX only. The API independently authenticates and authorises every request.
 */
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          {
            path: 'how-it-works',
            lazy: async () => ({
              Component: (await import('../features/marketing/pages/HowItWorksPage'))
                .HowItWorksPage,
            }),
          },
          {
            path: 'features',
            lazy: async () => ({
              Component: (await import('../features/marketing/pages/FeaturesPage')).FeaturesPage,
            }),
          },
          {
            path: 'doctors',
            lazy: async () => ({
              Component: (await import('../features/marketing/pages/DoctorsPage')).DoctorsPage,
            }),
          },
          {
            path: 'about',
            lazy: async () => ({
              Component: (await import('../features/marketing/pages/AboutPage')).AboutPage,
            }),
          },
          {
            path: 'contact',
            lazy: async () => ({
              Component: (await import('../features/marketing/pages/ContactPage')).ContactPage,
            }),
          },
          {
            path: 'status',
            lazy: async () => ({
              Component: (await import('../features/system/pages/SystemStatusPage'))
                .SystemStatusPage,
            }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        element: <RedirectIfAuthenticated />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: 'login',
                lazy: async () => ({
                  Component: (await import('../features/auth/pages/LoginPage')).LoginPage,
                }),
              },
              {
                path: 'register',
                lazy: async () => ({
                  Component: (await import('../features/auth/pages/RegisterPage')).RegisterPage,
                }),
              },
            ],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <RoleHomeRedirect /> },
          {
            element: <DashboardLayout />,
            children: [
              roleArea(
                'patient',
                'patient',
                async () => ({
                  Component: (await import('../features/dashboard/pages/PatientDashboardPage'))
                    .PatientDashboardPage,
                }),
                [
                  {
                    path: 'profile',
                    lazy: async () => ({
                      Component: (await import('../features/profile/pages/ProfilePage')).ProfilePage,
                    }),
                  },
                  {
                    path: 'profile/edit',
                    lazy: async () => ({
                      Component: (await import('../features/profile/pages/EditProfilePage'))
                        .EditProfilePage,
                    }),
                  },
                  {
                    path: 'medical',
                    lazy: async () => ({
                      Component: (
                        await import('../features/medical/pages/MedicalProfilePage')
                      ).MedicalProfilePage,
                    }),
                  },
                  {
                    path: 'appointments',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/AppointmentsPage')
                      ).AppointmentsPage,
                    }),
                  },
                  {
                    path: 'consultations',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/ConsultationsPage')
                      ).ConsultationsPage,
                    }),
                  },
                  {
                    path: 'consultations/:id',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/ConsultationRoomPage')
                      ).ConsultationRoomPage,
                    }),
                  },
                  {
                    path: 'records',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/MedicalRecordsPage')
                      ).MedicalRecordsPage,
                    }),
                  },
                  {
                    path: 'prescriptions',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/PrescriptionsPage')
                      ).PrescriptionsPage,
                    }),
                  },
                  {
                    path: 'medications',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/MedicationsPage')
                      ).MedicationsPage,
                    }),
                  },
                  {
                    path: 'pharmacy',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/PharmacyPage')
                      ).PharmacyPage,
                    }),
                  },
                  {
                    path: 'pharmacy/cart',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/PharmacyCartPage')
                      ).PharmacyCartPage,
                    }),
                  },
                  {
                    path: 'pharmacy/checkout',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/PharmacyCheckoutPage')
                      ).PharmacyCheckoutPage,
                    }),
                  },
                  {
                    path: 'pharmacy/orders',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/PharmacyOrdersPage')
                      ).PharmacyOrdersPage,
                    }),
                  },
                  {
                    path: 'pharmacy/orders/:id',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/PharmacyOrderDetailPage')
                      ).PharmacyOrderDetailPage,
                    }),
                  },
                  {
                    path: 'find-doctors',
                    lazy: async () => ({
                      Component: (
                        await import('../features/doctor/pages/DoctorDiscoveryPage')
                      ).DoctorDiscoveryPage,
                    }),
                  },
                  {
                    path: 'health',
                    lazy: async () => ({
                      Component: (
                        await import('../features/monitoring/pages/HealthMonitoringPage')
                      ).HealthMonitoringPage,
                    }),
                  },
                  {
                    path: 'alerts',
                    lazy: async () => ({
                      Component: (
                        await import('../features/monitoring/pages/HealthAlertsPage')
                      ).HealthAlertsPage,
                    }),
                  },
                  {
                    path: 'assistant',
                    lazy: async () => ({
                      Component: (
                        await import('../features/assistant/pages/AiAssistantPage')
                      ).AiAssistantPage,
                    }),
                  },
                  {
                    path: 'medtranslator',
                    lazy: async () => ({
                      Component: (
                        await import('../features/medtranslator/pages/MedTranslatorPage')
                      ).MedTranslatorPage,
                    }),
                  },
                  {
                    path: 'family',
                    lazy: async () => ({
                      Component: (
                        await import('../features/family/pages/PatientFamilyPage')
                      ).PatientFamilyPage,
                    }),
                  },
                  {
                    path: 'notifications',
                    lazy: async () => ({
                      Component: (
                        await import('../features/notifications/pages/NotificationsPage')
                      ).NotificationsPage,
                    }),
                  },
                  {
                    path: 'settings',
                    lazy: async () => ({
                      Component: (
                        await import('../features/patient/pages/PatientSettingsPage')
                      ).PatientSettingsPage,
                    }),
                  },
                ],
              ),
              roleArea(
                'doctor',
                'doctor',
                async () => ({
                  Component: (await import('../features/dashboard/pages/DoctorDashboardPage'))
                    .DoctorDashboardPage,
                }),
                [
                  {
                    path: 'profile',
                    lazy: async () => ({
                      Component: (await import('../features/profile/pages/ProfilePage'))
                        .ProfilePage,
                    }),
                  },
                  {
                    path: 'profile/edit',
                    lazy: async () => ({
                      Component: (await import('../features/profile/pages/EditProfilePage'))
                        .EditProfilePage,
                    }),
                  },
                  {
                    path: 'professional',
                    lazy: async () => ({
                      Component: (
                        await import('../features/doctor/pages/ProfessionalProfilePage')
                      ).ProfessionalProfilePage,
                    }),
                  },
                  {
                    path: 'schedule',
                    lazy: async () => ({
                      Component: (await import('../features/doctor/pages/AvailabilityPage'))
                        .AvailabilityPage,
                    }),
                  },
                  {
                    path: 'appointments',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/DoctorAppointmentsPage')
                      ).DoctorAppointmentsPage,
                    }),
                  },
                  {
                    path: 'consultations',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/DoctorConsultationsPage')
                      ).DoctorConsultationsPage,
                    }),
                  },
                  {
                    path: 'prescriptions',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/DoctorPrescriptionsPage')
                      ).DoctorPrescriptionsPage,
                    }),
                  },
                  {
                    path: 'patients',
                    lazy: async () => ({
                      Component: (
                        await import('../features/treatment/pages/DoctorPatientsPage')
                      ).DoctorPatientsPage,
                    }),
                  },
                  {
                    path: 'notifications',
                    lazy: async () => ({
                      Component: (
                        await import('../features/notifications/pages/NotificationsPage')
                      ).NotificationsPage,
                    }),
                  },
                ],
              ),
              roleArea(
                'family',
                'caregiver',
                async () => ({
                  Component: (await import('../features/family/pages/FamilyDashboardPage'))
                    .FamilyDashboardPage,
                }),
                [
                  {
                    path: 'profile',
                    lazy: async () => ({
                      Component: (await import('../features/profile/pages/ProfilePage'))
                        .ProfilePage,
                    }),
                  },
                  {
                    path: 'profile/edit',
                    lazy: async () => ({
                      Component: (await import('../features/profile/pages/EditProfilePage'))
                        .EditProfilePage,
                    }),
                  },
                  {
                    path: 'patients',
                    lazy: async () => ({
                      Component: (
                        await import('../features/family/pages/FamilyPatientsPage')
                      ).FamilyPatientsPage,
                    }),
                  },
                  {
                    path: 'alerts',
                    lazy: async () => ({
                      Component: (
                        await import('../features/family/pages/FamilyAlertsPage')
                      ).FamilyAlertsPage,
                    }),
                  },
                  {
                    path: 'invitations',
                    lazy: async () => ({
                      Component: (
                        await import('../features/family/pages/FamilyInvitationsPage')
                      ).FamilyInvitationsPage,
                    }),
                  },
                  {
                    path: 'notifications',
                    lazy: async () => ({
                      Component: (
                        await import('../features/notifications/pages/NotificationsPage')
                      ).NotificationsPage,
                    }),
                  },
                ],
              ),
              roleArea(
                'admin',
                'admin',
                async () => ({
                  Component: (await import('../features/dashboard/pages/AdminDashboardPage'))
                    .AdminDashboardPage,
                }),
                [
                  {
                    path: 'profile',
                    lazy: async () => ({
                      Component: (await import('../features/profile/pages/ProfilePage'))
                        .ProfilePage,
                    }),
                  },
                  {
                    path: 'profile/edit',
                    lazy: async () => ({
                      Component: (await import('../features/profile/pages/EditProfilePage'))
                        .EditProfilePage,
                    }),
                  },
                  {
                    path: 'users',
                    lazy: async () => ({
                      Component: (
                        await import('../features/admin/pages/AdminUsersPage')
                      ).AdminUsersPage,
                    }),
                  },
                  {
                    path: 'doctors',
                    lazy: async () => ({
                      Component: (
                        await import('../features/admin/pages/AdminDoctorsPage')
                      ).AdminDoctorsPage,
                    }),
                  },
                  {
                    path: 'appointments',
                    lazy: async () => ({
                      Component: (
                        await import('../features/admin/pages/AdminAppointmentsPage')
                      ).AdminAppointmentsPage,
                    }),
                  },
                  {
                    path: 'pharmacy',
                    lazy: async () => ({
                      Component: (
                        await import('../features/admin/pages/AdminPharmacyPage')
                      ).AdminPharmacyPage,
                    }),
                  },
                  {
                    path: 'knowledge',
                    lazy: async () => ({
                      Component: (
                        await import('../features/admin/pages/AdminKnowledgePage')
                      ).AdminKnowledgePage,
                    }),
                  },
                  {
                    path: 'analytics',
                    lazy: async () => ({
                      Component: (
                        await import('../features/admin/pages/AdminAnalyticsPage')
                      ).AdminAnalyticsPage,
                    }),
                  },
                  {
                    path: 'audit-logs',
                    lazy: async () => ({
                      Component: (
                        await import('../features/admin/pages/AdminAuditLogsPage')
                      ).AdminAuditLogsPage,
                    }),
                  },
                  {
                    path: 'settings',
                    lazy: async () => ({
                      Component: (
                        await import('../features/admin/pages/AdminSettingsPage')
                      ).AdminSettingsPage,
                    }),
                  },
                ],
              ),
              {
                path: 'ui-kit',
                lazy: async () => ({
                  Component: (await import('../features/dashboard/pages/UiKitPage')).UiKitPage,
                }),
              },
            ],
          },
        ],
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
