import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Info, ShieldCheck, Signal, Stethoscope } from 'lucide-react';
import { Container } from '../../../components/layout/Container';
import { ButtonLink } from '../../../components/ui/Button';
import { CallToAction } from '../components/CallToAction';
import { JourneySteps } from '../components/JourneySteps';
import { FeatureSpotlight, SectionHeading } from '../components/Section';
import {
  AppointmentsVisual,
  AssistantVisual,
  FamilyVisual,
  HeroVisual,
  MedicationVisual,
  MonitoringVisual,
  RecordsVisual,
  TelemedicineVisual,
} from '../components/visuals';
import { accessProblems, coreFeatures, patientJourney } from '../content';

const trustPoints = [
  { icon: Stethoscope, label: 'Verified doctors only' },
  { icon: ShieldCheck, label: 'You control your data' },
  { icon: Signal, label: 'Built for low bandwidth' },
];

function SafetyNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
      <Info className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function LandingPage() {
  return (
    <>
      {/* 1. Hero */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-gradient-to-b from-brand-50/80 to-white"
        />
        <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-800">
              <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              Telemedicine for rural and underserved communities
            </p>
            <h1
              id="hero-heading"
              className="mt-5 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl"
            >
              Quality healthcare, without the long journey.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Nexus Care connects patients with verified doctors, keeps records and prescriptions in
              one place, and lets families support the people they care about — from any phone.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/register" size="lg">
                Get started
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/doctors" size="lg" variant="outline">
                Find a doctor
              </ButtonLink>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon className="size-4 text-brand-700" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </Container>
      </section>

      {/* 2. Healthcare access problem */}
      <section aria-labelledby="problem-heading" className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="problem-heading"
            eyebrow="The challenge"
            title="For many families, care is too far away."
            description="Distance, cost and fragmented information keep people from the care they need — especially outside large cities."
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {accessProblems.map(({ icon: Icon, title, description }) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-danger-50 text-danger-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3. How Nexus Care works */}
      <section aria-labelledby="how-heading" className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="how-heading"
            eyebrow="How it works"
            title="From sign-up to follow-up in four steps."
            description="Designed to be simple enough for first-time smartphone users."
          />
          <div className="mt-12">
            <JourneySteps steps={patientJourney} />
          </div>
          <p className="mt-8 text-center">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              See how it works for doctors and families
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        </Container>
      </section>

      {/* 4. Core features */}
      <section aria-labelledby="features-heading" className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="features-heading"
            eyebrow="Core features"
            title="One connected platform for everyday care."
            description="Every part of Nexus Care works together — appointments, records, medicines, alerts and family support."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {coreFeatures.map(({ id, icon: Icon, title, description }) => (
              <li key={id}>
                <Link
                  to={`/features#${id}`}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300"
                >
                  <Icon className="size-5 text-brand-700" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-brand-800">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 5. Telemedicine */}
      <FeatureSpotlight
        id="telemedicine"
        eyebrow="Telemedicine"
        title="See a doctor from wherever you are."
        description="Consult verified doctors by video or audio, without travelling to a city clinic."
        points={[
          'Join from a phone or computer — no app download required',
          'Switch to audio-only when the connection is weak',
          'Chat and share reports during the consultation',
          'A written summary from your doctor after every visit',
        ]}
        visual={<TelemedicineVisual />}
      />

      {/* 6. Appointment management */}
      <FeatureSpotlight
        id="appointments"
        eyebrow="Appointment management"
        title="Book the right time, change it when life happens."
        description="See real availability, book in a few taps and get reminders before your visit."
        points={[
          'Only free slots are shown, so double bookings cannot happen',
          'Reschedule or cancel up to a short time before the visit',
          'Reminders the day before and an hour before',
          'Family members can manage bookings if you allow it',
        ]}
        visual={<AppointmentsVisual />}
        reverse
        muted
      />

      {/* 7. Medical records */}
      <FeatureSpotlight
        id="records"
        eyebrow="Medical records"
        title="Your health history, safe and in one place."
        description="Upload lab reports, scans and discharge summaries so the right people can see them when it matters."
        points={[
          'Private by default, stored securely',
          'Doctors you consult can view records you have not marked private',
          'Download your records whenever you need them',
          'Prescriptions and consultation summaries are added automatically',
        ]}
        visual={<RecordsVisual />}
      />

      {/* 8. Medication management */}
      <FeatureSpotlight
        id="medications"
        eyebrow="Medication management"
        title="Never lose track of a dose."
        description="Prescriptions turn into a clear medicine schedule with reminders at the right times."
        points={[
          'Reminders for every dose, at the times you choose',
          'Mark doses as taken or skipped in one tap',
          'Missed doses can alert a caregiver you trust',
          'Order prescribed medicines from partner pharmacies',
        ]}
        visual={<MedicationVisual />}
        reverse
        muted
      />

      {/* 9. AI healthcare assistant */}
      <FeatureSpotlight
        id="assistant"
        eyebrow="AI healthcare assistant"
        title="Understand your health in plain language."
        description="Ask general health questions, or have medical documents explained in the language you are most comfortable with."
        points={[
          'Answers grounded in trusted, cited health sources',
          'MedTranslator explains reports term by term',
          'Suggests questions to ask your doctor',
          'Recognises urgent symptoms and points you to emergency help',
        ]}
        visual={<AssistantVisual />}
        note={
          <SafetyNote>
            The assistant is an information tool, not a doctor. It does not diagnose conditions or
            recommend changes to your treatment.
          </SafetyNote>
        }
      />

      {/* 10. Health monitoring */}
      <FeatureSpotlight
        id="monitoring"
        eyebrow="Health monitoring"
        title="Know when something needs attention."
        description="Connect compatible monitoring devices to follow heart rate, oxygen saturation and temperature over time."
        points={[
          'Live and historical readings on one dashboard',
          'Alerts when readings move outside your configured range',
          'Physiological anomaly and risk indications to discuss with your doctor',
          'An SOS button that alerts your chosen caregivers',
        ]}
        visual={<MonitoringVisual />}
        reverse
        muted
        note={
          <SafetyNote>
            Monitoring provides health alerts and risk indications only. It cannot diagnose a heart
            attack or any other condition. If you feel unwell, contact emergency services.
          </SafetyNote>
        }
      />

      {/* 11. Family ecosystem */}
      <FeatureSpotlight
        id="family"
        eyebrow="Family ecosystem"
        title="Let family help — on your terms."
        description="Invite the people who support you and choose exactly what each of them can see and do."
        points={[
          'Nothing is shared until you grant permission',
          'Separate permissions for appointments, records, medicines and alerts',
          'Revoke access instantly, at any time',
          'Caregivers get missed-dose and emergency alerts only if you allow it',
        ]}
        visual={<FamilyVisual />}
      />

      {/* 12. Call to action */}
      <CallToAction />
      {/* 13. Footer is rendered by the public layout. */}
    </>
  );
}
