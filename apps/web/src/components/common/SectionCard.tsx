import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';

export interface SectionCardProps {
  id?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Shows an Edit button when provided and not already editing. */
  onEdit?: () => void;
  editing?: boolean;
  children: ReactNode;
}

/** Titled card with an optional Edit action — the building block of profile pages. */
export function SectionCard({
  id,
  title,
  description,
  icon,
  onEdit,
  editing = false,
  children,
}: SectionCardProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <Card id={id} className="scroll-mt-24">
      <section aria-labelledby={headingId}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 [&_svg]:size-5">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 id={headingId} className="font-semibold text-slate-900">
                {title}
              </h2>
              {description ? <p className="mt-0.5 text-sm text-slate-600">{description}</p> : null}
            </div>
          </div>
          {onEdit && !editing ? (
            <Button variant="outline" size="sm" onClick={onEdit} aria-label={`Edit ${title}`}>
              <Pencil aria-hidden="true" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          ) : null}
        </div>
        <CardBody className="py-5">{children}</CardBody>
      </section>
    </Card>
  );
}
