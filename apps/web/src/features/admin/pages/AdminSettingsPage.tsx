import { useState } from 'react';
import { Settings, Phone, ShieldCheck, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';

export function AdminSettingsPage() {
  const [emergencyPhone, setEmergencyPhone] = useState('112');
  const [enableAI, setEnableAI] = useState(true);
  const [enableIoT, setEnableIoT] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure global platform parameters, emergency dispatch numbers, and feature toggles.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-slate-700">Primary Emergency Dispatch Number</label>
          <input
            type="text"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            className="mt-1 max-w-xs rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-hidden"
          />
          <p className="mt-1 text-xs text-slate-500">Default emergency hotline dialed by the SOS button.</p>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Feature Flags</h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-bold text-slate-900">Nexus AI Healthcare Assistant & MedTranslator</span>
              <p className="text-xs text-slate-500">Enable grounded clinical NLP and plain-language decoder.</p>
            </div>
            <button
              type="button"
              onClick={() => setEnableAI(!enableAI)}
              className={`text-2xl ${enableAI ? 'text-brand-700' : 'text-slate-300'}`}
            >
              {enableAI ? <ToggleRight className="size-8" /> : <ToggleLeft className="size-8" />}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-bold text-slate-900">Continuous IoT Wearables Telemetry</span>
              <p className="text-xs text-slate-500">Enable real-time pulse streaming and ML risk indication.</p>
            </div>
            <button
              type="button"
              onClick={() => setEnableIoT(!enableIoT)}
              className={`text-2xl ${enableIoT ? 'text-brand-700' : 'text-slate-300'}`}
            >
              {enableIoT ? <ToggleRight className="size-8" /> : <ToggleLeft className="size-8" />}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-bold text-slate-900">System Maintenance Mode</span>
              <p className="text-xs text-slate-500">Restricts non-admin access for scheduled database maintenance.</p>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`text-2xl ${maintenanceMode ? 'text-rose-600' : 'text-slate-300'}`}
            >
              {maintenanceMode ? <ToggleRight className="size-8" /> : <ToggleLeft className="size-8" />}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="size-4" /> Platform settings saved successfully
            </span>
          )}
          <button
            type="submit"
            className="ml-auto rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-800"
          >
            Save Global Settings
          </button>
        </div>
      </form>
    </div>
  );
}
