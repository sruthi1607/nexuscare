import { BadgeCheck, CalendarDays, FileCheck2, Search, Stethoscope } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';
import { Container } from '../../../components/layout/Container';
import { ButtonLink } from '../../../components/ui/Button';
import { PageHero } from '../components/PageHero';
import { SectionHeading } from '../components/Section';

const verificationSteps = [
  {
    icon: FileCheck2,
    title: 'Registration details checked',
    text: 'Doctors submit their medical registration number and council, which our team reviews.',
  },
  {
    icon: BadgeCheck,
    title: 'Listed only after approval',
    text: 'Profiles stay hidden from patients until verification is complete.',
  },
  {
    icon: CalendarDays,
    title: 'Real availability',
    text: 'Doctors publish their own consultation hours; patients only see free slots.',
  },
];

/**
 * Public doctor directory. Search arrives with the doctor-discovery phase; until then the page is
 * honest that no verified doctors are listed rather than showing placeholder profiles.
 */
export function DoctorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Find doctors"
        title="Consult verified doctors across specialties."
        description="Search by specialty, language and consultation type, then book a time that suits you."
      />

      <section aria-labelledby="directory-heading" className="py-16 sm:py-20">
        <Container>
          <h2 id="directory-heading" className="sr-only">
            Doctor directory
          </h2>
          <EmptyState
            icon={<Search aria-hidden="true" />}
            title="The doctor directory is not open yet"
            description="Verified doctors will appear here once doctor onboarding launches. No profiles are listed until a real doctor has been verified."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <ButtonLink to="/register?role=doctor">
                  <Stethoscope aria-hidden="true" />
                  Join as a doctor
                </ButtonLink>
                <ButtonLink to="/register" variant="outline">
                  Create a patient account
                </ButtonLink>
              </div>
            }
          />
        </Container>
      </section>

      <section aria-labelledby="verification-heading" className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="verification-heading"
            eyebrow="Verification"
            title="Every doctor is verified before you see them."
          />
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {verificationSteps.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-6">
                <Icon className="size-6 text-brand-700" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
