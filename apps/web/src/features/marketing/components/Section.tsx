import type { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Container } from '../../../components/layout/Container';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? <p className="text-sm font-semibold text-brand-700">{eyebrow}</p> : null}
      <h2 id={id} className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

export interface FeatureSpotlightProps {
  id: string;
  eyebrow: string;
  title: string;
  description: ReactNode;
  points: string[];
  visual: ReactNode;
  /** Put the visual on the left on wide screens. */
  reverse?: boolean;
  /** Safety or scope note shown under the points. */
  note?: ReactNode;
  action?: ReactNode;
  muted?: boolean;
}

/** Two-column feature section: copy and bullet points beside a product illustration. */
export function FeatureSpotlight({
  id,
  eyebrow,
  title,
  description,
  points,
  visual,
  reverse = false,
  note,
  action,
  muted = false,
}: FeatureSpotlightProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn('scroll-mt-20 py-16 sm:py-20', muted && 'bg-slate-50')}
    >
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn(reverse && 'lg:order-2')}>
          <SectionHeading
            id={headingId}
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="left"
          />
          <ul className="mt-6 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-slate-700 sm:text-base">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-brand-600"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
          {note ? <div className="mt-6">{note}</div> : null}
          {action ? <div className="mt-8">{action}</div> : null}
        </div>
        <div className={cn('mx-auto w-full max-w-md', reverse && 'lg:order-1')}>{visual}</div>
      </Container>
    </section>
  );
}
