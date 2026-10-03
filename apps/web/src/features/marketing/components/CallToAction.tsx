import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '../../../components/ui/Button';
import { Container } from '../../../components/layout/Container';

export function CallToAction() {
  return (
    <section aria-labelledby="cta-heading" className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="absolute -top-20 -left-20 size-72 rounded-full bg-brand-700/40"
          />
          <div
            aria-hidden="true"
            className="absolute -right-16 -bottom-24 size-72 rounded-full bg-brand-800/70"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2
              id="cta-heading"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Better access to care starts with one account.
            </h2>
            <p className="mt-4 text-base text-brand-100">
              Join as a patient, a caregiver supporting someone you love, or a doctor ready to reach
              more communities.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink
                to="/register"
                size="lg"
                className="bg-white text-brand-900 hover:bg-brand-50 active:bg-brand-100"
              >
                Create an account
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                to="/register?role=doctor"
                size="lg"
                variant="outline"
                className="border-brand-400/60 bg-transparent text-white hover:border-white hover:bg-white/10"
              >
                Join as a doctor
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
