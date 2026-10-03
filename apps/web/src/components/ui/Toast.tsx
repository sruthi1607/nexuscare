import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ToastContext, type ToastApi, type ToastRecord, type ToastTone } from './toast-context';

const MAX_VISIBLE = 4;

const toneStyles: Record<ToastTone, { icon: ReactNode; accent: string }> = {
  info: { icon: <Info aria-hidden="true" />, accent: 'text-info-700' },
  success: { icon: <CheckCircle2 aria-hidden="true" />, accent: 'text-success-700' },
  warning: { icon: <AlertTriangle aria-hidden="true" />, accent: 'text-warning-700' },
  danger: { icon: <XCircle aria-hidden="true" />, accent: 'text-danger-700' },
};

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);

  useEffect(() => {
    if (toast.duration === 0 || paused) return;
    startedAt.current = Date.now();
    const timer = window.setTimeout(() => {
      onDismiss(toast.id);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, toast.duration, toast.id, onDismiss]);

  const { icon, accent } = toneStyles[toast.tone];
  const pause = () => {
    setPaused(true);
  };
  const resume = () => {
    setPaused(false);
  };

  return (
    <li
      role={toast.tone === 'danger' ? 'alert' : undefined}
      aria-atomic="true"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="pointer-events-auto flex w-full gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-overlay animate-toast-in"
    >
      <span className={cn('mt-0.5 shrink-0 [&_svg]:size-5', accent)}>{icon}</span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-slate-900">{toast.title}</p>
        {toast.description ? <p className="mt-0.5 text-slate-600">{toast.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => {
          onDismiss(toast.id);
        }}
        className="-m-1 h-fit rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Dismiss notification"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Provides useToast() and renders the toast stack (bottom-right desktop, bottom on mobile). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastApi['toast']>(
    ({ title, description, tone = 'info', duration }) => {
      const id = nextId.current++;
      const record: ToastRecord = {
        id,
        title,
        tone,
        duration: duration ?? (tone === 'danger' ? 8000 : 5000),
        ...(description === undefined ? {} : { description }),
      };
      setToasts((current) => [...current, record].slice(-MAX_VISIBLE));
      return id;
    },
    [],
  );

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4 sm:justify-end"
      >
        {/* The live region exists before any toast is added so additions are announced. */}
        <ol
          className="flex w-full max-w-sm flex-col gap-2"
          aria-live="polite"
          aria-relevant="additions"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </ol>
      </section>
    </ToastContext.Provider>
  );
}
