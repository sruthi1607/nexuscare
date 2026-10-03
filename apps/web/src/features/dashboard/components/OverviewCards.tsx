import { Link } from 'react-router';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card';

export interface OverviewCard {
  title: string;
  icon: LucideIcon;
  to: string;
  /** Shown while the module has no data (or is not built yet) — never invented content. */
  emptyText: string;
}

export function OverviewCards({ cards }: { cards: OverviewCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map(({ title, icon: Icon, to, emptyText }) => (
        <Card key={title} className="flex flex-col">
          <CardHeader className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="size-5 text-brand-700" aria-hidden="true" />
              {title}
            </CardTitle>
            <Link
              to={to}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              View
              <ArrowRight className="size-4" aria-hidden="true" />
              <span className="sr-only">{title}</span>
            </Link>
          </CardHeader>
          <CardBody className="flex flex-1 items-center justify-center py-10 text-center text-sm text-slate-500">
            {emptyText}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
