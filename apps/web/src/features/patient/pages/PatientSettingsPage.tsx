import { useState } from 'react';
import { Settings, Bell, Lock, Globe, Shield, CheckCircle2, PhoneCall } from 'lucide-react';
import { useAuth } from '../../auth/auth-context';

export function PatientSettingsPage() {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emergencySharing, setEmergencySharing] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account & Health Preferences</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your communication preferences, emergency contacts, and privacy settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notifications & Reminders Preferences */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="size-4 text-brand-600" /> Notifications & Dose Reminders
          </h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="size-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Email Notifications</span>
                <p className="text-xs text-slate-500">Receive consultation confirmations, doctor notes, and pharmacy receipts.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="size-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">SMS & Pill Dose Alerts</span>
                <p className="text-xs text-slate-500">Receive urgent missed medication reminders and appointment alerts on your phone.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Emergency & Caregiver Sharing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="size-4 text-rose-600" /> Emergency Health Sharing
          </h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emergencySharing}
                onChange={(e) => setEmergencySharing(e.target.checked)}
                className="size-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Automated Caregiver Emergency Dispatch</span>
                <p className="text-xs text-slate-500">
                  Automatically alert your designated emergency contact (David Jenkins) if resting vitals breach critical thresholds.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Language Preference */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="size-4 text-blue-600" /> Language & Regional Localization
          </h2>
          <div className="mt-4 max-w-xs">
            <label className="block text-xs font-semibold text-slate-700">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Spanish">Español (Spanish)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="size-4" /> Preferences updated successfully
            </span>
          )}
          <button
            type="submit"
            className="ml-auto rounded-xl bg-brand-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-800"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
