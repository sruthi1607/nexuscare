export type NotificationCategory = 'appointment' | 'medicine' | 'pharmacy' | 'health' | 'family' | 'system';
export type NotificationPriority = 'normal' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  roleTarget: 'patient' | 'doctor' | 'caregiver' | 'admin' | 'all';
}
