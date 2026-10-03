import { Info } from 'lucide-react';

/** Standard prototype / emergency disclaimer shown wherever health information appears. */
export function SafetyNotice() {
  return (
    <p className="flex items-start gap-2 text-xs text-slate-500">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        Nexus Care is a software prototype and not a medical device. In an emergency, contact your
        local emergency services immediately.
      </span>
    </p>
  );
}
