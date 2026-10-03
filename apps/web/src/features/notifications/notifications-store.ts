import { useSyncExternalStore } from 'react';
import type { AppNotification, NotificationCategory, NotificationPriority } from './types';

const STORAGE_KEY = 'nexuscare_notifications_store_v1';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'appointment',
    priority: 'high',
    title: 'Upcoming Video Consultation in 30 Mins',
    message: 'Your tele-consultation with Dr. Arvind Mehta (Cardiologist) begins today at 04:30 PM.',
    timestamp: '2026-10-03T16:00:00.000Z',
    read: false,
    actionUrl: '/patient/appointments',
    actionLabel: 'Join Consultation',
    roleTarget: 'patient',
  },
  {
    id: 'notif-2',
    category: 'medicine',
    priority: 'normal',
    title: 'Medication Dose Due: Metformin 500mg',
    message: 'It is time for your afternoon dose. Remember to take it with or after your meal.',
    timestamp: '2026-10-03T14:00:00.000Z',
    read: false,
    actionUrl: '/patient/medications',
    actionLabel: 'Mark as Taken',
    roleTarget: 'patient',
  },
  {
    id: 'notif-3',
    category: 'pharmacy',
    priority: 'normal',
    title: 'Pharmacy Order #ORD-501 Dispatched',
    message: 'Your prescription medicines have been packed and are out for delivery with Express Courier.',
    timestamp: '2026-10-03T12:30:00.000Z',
    read: true,
    actionUrl: '/patient/pharmacy/orders/ord-501',
    actionLabel: 'Track Delivery',
    roleTarget: 'patient',
  },
  {
    id: 'notif-4',
    category: 'health',
    priority: 'high',
    title: 'Abnormal Heart Rate Detected',
    message: 'Resting pulse reached 104 bpm during rest. Resting telemetry logged to your monitoring feed.',
    timestamp: '2026-10-03T09:15:00.000Z',
    read: false,
    actionUrl: '/patient/health',
    actionLabel: 'Review Vitals',
    roleTarget: 'patient',
  },
  {
    id: 'notif-5',
    category: 'family',
    priority: 'normal',
    title: 'Caregiver Update: David Jenkins linked',
    message: 'David Jenkins (Spouse) has confirmed caregiver connection and has access to shared vitals.',
    timestamp: '2026-10-02T18:00:00.000Z',
    read: true,
    actionUrl: '/patient/family',
    actionLabel: 'Manage Permissions',
    roleTarget: 'patient',
  },
  // Doctor notifications
  {
    id: 'notif-doc-1',
    category: 'appointment',
    priority: 'high',
    title: 'New Telehealth Appointment Scheduled',
    message: 'Sarah Jenkins booked a cardiology consultation for today at 04:30 PM.',
    timestamp: '2026-10-03T11:00:00.000Z',
    read: false,
    actionUrl: '/doctor/appointments',
    actionLabel: 'View Schedule',
    roleTarget: 'doctor',
  },
  {
    id: 'notif-doc-2',
    category: 'health',
    priority: 'high',
    title: 'Patient Telemetry Alert: Sarah Jenkins',
    message: 'Automated wearable telemetry logged elevated heart rate (104 bpm) for 15 mins.',
    timestamp: '2026-10-03T09:20:00.000Z',
    read: false,
    actionUrl: '/doctor/patients',
    actionLabel: 'Inspect Patient File',
    roleTarget: 'doctor',
  },
  // Family notifications
  {
    id: 'notif-fam-1',
    category: 'family',
    priority: 'high',
    title: 'Health Alert for Sarah Jenkins',
    message: 'Resting heart rate reached 104 bpm today. She has an appointment scheduled with Dr. Mehta.',
    timestamp: '2026-10-03T09:18:00.000Z',
    read: false,
    actionUrl: '/family/alerts',
    actionLabel: 'View Family Alert',
    roleTarget: 'caregiver',
  },
  {
    id: 'notif-fam-2',
    category: 'medicine',
    priority: 'normal',
    title: 'Medication Adherence Update',
    message: 'Sarah Jenkins took all morning medications on time today (7-day streak maintained).',
    timestamp: '2026-10-03T08:30:00.000Z',
    read: true,
    actionUrl: '/family/patients',
    actionLabel: 'View Summary',
    roleTarget: 'caregiver',
  },
];

interface NotificationsState {
  notifications: AppNotification[];
}

function loadState(): NotificationsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.notifications)) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return { notifications: INITIAL_NOTIFICATIONS };
}

let state: NotificationsState = loadState();
const listeners = new Set<() => void>();

function saveAndNotify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore error
  }
  listeners.forEach((l) => l());
}

export const notificationsStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    state = {
      ...state,
      notifications: [newNotif, ...state.notifications],
    };
    saveAndNotify();
    return newNotif;
  },

  markAsRead: (id: string) => {
    state = {
      ...state,
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    };
    saveAndNotify();
  },

  markAllAsRead: (role?: string) => {
    state = {
      ...state,
      notifications: state.notifications.map((n) => {
        if (!role || n.roleTarget === role || n.roleTarget === 'all') {
          return { ...n, read: true };
        }
        return n;
      }),
    };
    saveAndNotify();
  },

  deleteNotification: (id: string) => {
    state = {
      ...state,
      notifications: state.notifications.filter((n) => n.id !== id),
    };
    saveAndNotify();
  },

  clearAll: (role?: string) => {
    state = {
      ...state,
      notifications: role
        ? state.notifications.filter((n) => n.roleTarget !== role && n.roleTarget !== 'all')
        : [],
    };
    saveAndNotify();
  },
};

export function useNotifications(role?: string) {
  const current = useSyncExternalStore(notificationsStore.subscribe, notificationsStore.getSnapshot);
  const filtered = role
    ? current.notifications.filter((n) => n.roleTarget === role || n.roleTarget === 'all')
    : current.notifications;
  const unreadCount = filtered.filter((n) => !n.read).length;

  return {
    notifications: filtered,
    allNotifications: current.notifications,
    unreadCount,
    markAsRead: notificationsStore.markAsRead,
    markAllAsRead: () => notificationsStore.markAllAsRead(role),
    deleteNotification: notificationsStore.deleteNotification,
    addNotification: notificationsStore.addNotification,
    clearAll: () => notificationsStore.clearAll(role),
  };
}
