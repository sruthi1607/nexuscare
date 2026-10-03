import { useSyncExternalStore } from 'react';
import type { FamilyAlert, FamilyInvitation, FamilyMember, FamilyPermissions } from './types';
import { notificationsStore } from '../notifications/notifications-store';

const STORAGE_KEY = 'nexuscare_family_store_v1';

const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    fullName: 'David Jenkins',
    relationship: 'Spouse',
    email: 'family@nexuscare.example',
    phone: '+1 (555) 234-5678',
    isEmergencyContact: true,
    status: 'active',
    permissions: {
      viewPrescriptions: true,
      viewLabReports: true,
      viewVitals: true,
      receiveEmergencyAlerts: true,
      manageAppointments: true,
    },
    joinedDate: '2026-09-15',
  },
  {
    id: 'fam-2',
    fullName: 'Priya Jenkins',
    relationship: 'Child',
    email: 'priya.jenkins@example.com',
    phone: '+1 (555) 876-5432',
    isEmergencyContact: false,
    status: 'active',
    permissions: {
      viewPrescriptions: false,
      viewLabReports: false,
      viewVitals: true,
      receiveEmergencyAlerts: true,
      manageAppointments: false,
    },
    joinedDate: '2026-09-28',
  },
];

const INITIAL_ALERTS: FamilyAlert[] = [
  {
    id: 'fam-alt-1',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    alertType: 'abnormal_vitals',
    severity: 'urgent',
    title: 'Elevated Resting Pulse (104 bpm)',
    message: 'Sarah Jenkins recorded a resting pulse of 104 bpm for 15+ minutes at 09:15 AM today.',
    timestamp: '2026-10-03T09:15:00.000Z',
    acknowledged: false,
  },
  {
    id: 'fam-alt-2',
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Sarah Jenkins',
    alertType: 'missed_medication',
    severity: 'warning',
    title: 'Evening Dose Reminder Alert',
    message: 'Evening dose for Atorvastatin 10mg was taken 45 minutes past the target window yesterday.',
    timestamp: '2026-10-02T22:45:00.000Z',
    acknowledged: true,
  },
];

const INITIAL_INVITATIONS: FamilyInvitation[] = [
  {
    id: 'inv-1',
    inviterName: 'Sarah Jenkins',
    inviterEmail: 'patient@nexuscare.example',
    relationship: 'Spouse',
    role: 'caregiver',
    status: 'accepted',
    sentDate: '2026-09-15',
    permissions: {
      viewPrescriptions: true,
      viewLabReports: true,
      viewVitals: true,
      receiveEmergencyAlerts: true,
      manageAppointments: true,
    },
  },
];

interface FamilyState {
  members: FamilyMember[];
  alerts: FamilyAlert[];
  invitations: FamilyInvitation[];
}

function loadState(): FamilyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.members)) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return {
    members: INITIAL_MEMBERS,
    alerts: INITIAL_ALERTS,
    invitations: INITIAL_INVITATIONS,
  };
}

let state: FamilyState = loadState();
const listeners = new Set<() => void>();

function saveAndNotify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore error
  }
  listeners.forEach((l) => l());
}

export const familyStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  addMember: (memberData: Omit<FamilyMember, 'id' | 'status' | 'joinedDate'>) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: `fam-${Date.now()}`,
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0] ?? '2026-10-03',
    };
    state = {
      ...state,
      members: [...state.members, newMember],
    };
    saveAndNotify();

    notificationsStore.addNotification({
      category: 'family',
      priority: 'normal',
      title: `Invitation Sent to ${memberData.fullName}`,
      message: `Caregiver invitation sent to ${memberData.email}. Permissions will activate upon acceptance.`,
      roleTarget: 'patient',
    });

    return newMember;
  },

  updatePermissions: (memberId: string, permissions: Partial<FamilyPermissions>) => {
    state = {
      ...state,
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, permissions: { ...m.permissions, ...permissions } } : m,
      ),
    };
    saveAndNotify();
  },

  removeMember: (memberId: string) => {
    state = {
      ...state,
      members: state.members.filter((m) => m.id !== memberId),
    };
    saveAndNotify();
  },

  acknowledgeAlert: (alertId: string) => {
    state = {
      ...state,
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    };
    saveAndNotify();
  },

  triggerFamilyAlert: (alertData: Omit<FamilyAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlert: FamilyAlert = {
      ...alertData,
      id: `fam-alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    state = {
      ...state,
      alerts: [newAlert, ...state.alerts],
    };
    saveAndNotify();

    notificationsStore.addNotification({
      category: 'family',
      priority: alertData.severity === 'urgent' ? 'urgent' : 'high',
      title: alertData.title,
      message: alertData.message,
      actionUrl: '/family/alerts',
      actionLabel: 'View Family Alert',
      roleTarget: 'caregiver',
    });

    return newAlert;
  },

  acceptInvitation: (invitationId: string) => {
    state = {
      ...state,
      invitations: state.invitations.map((i) =>
        i.id === invitationId ? { ...i, status: 'accepted' } : i,
      ),
    };
    saveAndNotify();
  },

  declineInvitation: (invitationId: string) => {
    state = {
      ...state,
      invitations: state.invitations.map((i) =>
        i.id === invitationId ? { ...i, status: 'declined' } : i,
      ),
    };
    saveAndNotify();
  },
};

export function useFamily() {
  const current = useSyncExternalStore(familyStore.subscribe, familyStore.getSnapshot);
  return {
    members: current.members,
    alerts: current.alerts,
    invitations: current.invitations,
    addMember: familyStore.addMember,
    updatePermissions: familyStore.updatePermissions,
    removeMember: familyStore.removeMember,
    acknowledgeAlert: familyStore.acknowledgeAlert,
    triggerFamilyAlert: familyStore.triggerFamilyAlert,
    acceptInvitation: familyStore.acceptInvitation,
    declineInvitation: familyStore.declineInvitation,
  };
}
