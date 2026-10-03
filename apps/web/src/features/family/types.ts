export interface FamilyPermissions {
  viewPrescriptions: boolean;
  viewLabReports: boolean;
  viewVitals: boolean;
  receiveEmergencyAlerts: boolean;
  manageAppointments: boolean;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  relationship: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Caregiver' | 'Guardian' | 'Other';
  email: string;
  phone: string;
  isEmergencyContact: boolean;
  status: 'active' | 'pending';
  permissions: FamilyPermissions;
  joinedDate: string;
}

export interface FamilyAlert {
  id: string;
  patientId: string;
  patientName: string;
  alertType: 'abnormal_vitals' | 'missed_medication' | 'emergency_sos';
  severity: 'high' | 'urgent' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface FamilyInvitation {
  id: string;
  inviterName: string;
  inviterEmail: string;
  relationship: string;
  role: 'caregiver';
  status: 'pending' | 'accepted' | 'declined';
  sentDate: string;
  permissions: FamilyPermissions;
}
