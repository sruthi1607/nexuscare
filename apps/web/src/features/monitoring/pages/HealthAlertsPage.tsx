import { AlertTriangle, CheckCircle2, ShieldAlert, PhoneCall, Clock, Stethoscope } from 'lucide-react';
import { useMonitoring } from '../monitoring-store';

export function HealthAlertsPage() {
  const { alerts, acknowledgeAlert } = useMonitoring();

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return (
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ' • ' +
        date.toLocaleDateString()
      );
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Health & Telemetry Alerts</h1>
          <p className="mt-1 text-sm text-slate-600">
            Automated alerts triggered by biometric anomalies and ML pattern analysis.
          </p>
        </div>
        <a
          href="tel:112"
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
        >
          <PhoneCall className="size-4" /> Emergency SOS (112)
        </a>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl border p-5 shadow-xs transition-all ${
              !alert.acknowledged
                ? 'border-rose-300 bg-rose-50/70'
                : 'border-slate-200 bg-white opacity-85'
            }`}
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    alert.severity === 'critical'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>
                    <span className="rounded-md bg-slate-900/10 px-2 py-0.5 text-[11px] font-bold text-slate-800">
                      Measured: {alert.measuredValue}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">{alert.message}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                    {alert.doctorNotified && (
                      <div className="flex items-center gap-1 text-brand-700 font-semibold">
                        <Stethoscope className="size-3.5" />
                        <span>Doctor Telemetry Feed Notified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {!alert.acknowledged ? (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
                  >
                    <CheckCircle2 className="size-4" /> Acknowledge
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="size-4" /> Acknowledged
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
