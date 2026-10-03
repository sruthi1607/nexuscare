import { useState } from 'react';
import { Link } from 'react-router';
import {
  Bell,
  Calendar,
  Pill,
  ShoppingBag,
  Activity,
  Users,
  CheckCheck,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useAuth } from '../../auth/auth-context';
import { useNotifications } from '../notifications-store';
import type { NotificationCategory } from '../types';

export function NotificationsPage() {
  const { user } = useAuth();
  const role = user?.role ?? 'patient';
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } =
    useNotifications(role);
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');

  const filtered = notifications.filter((n) => filter === 'all' || n.category === filter);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="size-5 text-blue-600" />;
      case 'medicine':
        return <Pill className="size-5 text-emerald-600" />;
      case 'pharmacy':
        return <ShoppingBag className="size-5 text-purple-600" />;
      case 'health':
        return <Activity className="size-5 text-rose-600" />;
      case 'family':
        return <Users className="size-5 text-amber-600" />;
      default:
        return <Bell className="size-5 text-slate-600" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Real-time updates across your consultations, prescriptions, pill schedule, and health alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <CheckCheck className="size-4 text-slate-600" />
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => clearAll()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-xs hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="size-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'all', label: 'All Updates' },
            { id: 'appointment', label: 'Appointments' },
            { id: 'medicine', label: 'Medicines' },
            { id: 'pharmacy', label: 'Pharmacy' },
            { id: 'health', label: 'Health Alerts' },
            { id: 'family', label: 'Family' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Bell className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No notifications in this view</h3>
          <p className="mt-1 text-sm text-slate-500">
            You are all caught up! New reminders, clinical alerts, and orders will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`group flex items-start gap-4 p-4 transition-colors ${
                !item.read ? 'bg-brand-50/40 hover:bg-brand-50/70' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                {getCategoryIcon(item.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm ${!item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                    {item.title}
                  </h4>
                  {!item.read && (
                    <span className="size-2 rounded-full bg-brand-600" />
                  )}
                  {item.priority === 'urgent' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      <ShieldAlert className="size-3" /> Urgent
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-[11px] text-slate-400">{formatTime(item.timestamp)}</span>
                  {item.actionUrl && (
                    <Link
                      to={item.actionUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      {item.actionLabel || 'View Details'} <ChevronRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-600 rounded-md"
                title="Delete notification"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
