import type { ReactNode } from 'react';
import { Container } from '../../../components/layout/Container';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';

export interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}

/** Header band for public sub-pages, with breadcrumb back to home. */
export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="border-b border-slate-100 bg-gradient-to-b from-brand-50/70 to-white">
      <Container className="py-12 sm:py-16">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: eyebrow }]} />
        <h1 className="mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{description}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
