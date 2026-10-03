import type { JourneyStep } from '../content';

/** Numbered steps; horizontal on wide screens, vertical on phones. */
export function JourneySteps({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ icon: Icon, title, description }, index) => (
        <li key={title} className="relative rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-slate-400">Step {index + 1}</span>
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
        </li>
      ))}
    </ol>
  );
}
