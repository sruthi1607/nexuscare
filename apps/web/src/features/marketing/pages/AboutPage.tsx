import { Accessibility, Eye, HeartHandshake, Lock, ShieldAlert, Signal } from 'lucide-react';
import { Container } from '../../../components/layout/Container';
import { Alert } from '../../../components/ui/Alert';
import { CallToAction } from '../components/CallToAction';
import { PageHero } from '../components/PageHero';
import { SectionHeading } from '../components/Section';

const values = [
  {
    icon: HeartHandshake,
    title: 'Access first',
    text: 'We design for people who live far from hospitals, use modest phones and have limited data.',
  },
  {
    icon: Lock,
    title: 'Privacy by default',
    text: 'Health information is sensitive. Nothing is shared without the patient’s explicit permission.',
  },
  {
    icon: ShieldAlert,
    title: 'Safety over hype',
    text: 'AI and device features inform and alert. Diagnosis and treatment stay with qualified doctors.',
  },
  {
    icon: Accessibility,
    title: 'Accessible to all',
    text: 'Readable text, strong contrast, keyboard and screen-reader support across the platform.',
  },
  {
    icon: Signal,
    title: 'Resilient by design',
    text: 'Audio-only consultations and lightweight pages keep care possible on weak connections.',
  },
  {
    icon: Eye,
    title: 'Transparent',
    text: 'Simulated data, demo content and features still in development are always clearly labelled.',
  },
];

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Bringing healthcare closer to the people who need it most."
        description="Nexus Care is a telemedicine and healthcare-management platform focused on rural and underserved communities, where distance and scarce specialists make care hard to reach."
      />

      <section aria-labelledby="mission-heading" className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            id="mission-heading"
            eyebrow="Our mission"
            title="Connect every patient with the care, information and support they need."
            align="left"
          />
          <div className="space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              Too many people delay care because the nearest doctor is hours away, their reports are
              scattered across paper files, or no one at home can help them keep up with treatment.
            </p>
            <p>
              Nexus Care brings consultations, records, prescriptions, medicines, monitoring and
              family support together, so care continues between visits instead of stopping at the
              clinic door.
            </p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="values-heading" className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeading id="values-heading" eyebrow="What guides us" title="Our principles" />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-6">
                <Icon className="size-6 text-brand-700" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-label="Prototype notice" className="pt-16">
        <Container>
          <Alert tone="warning" title="A prototype, not a medical device">
            Nexus Care is a software prototype under development. It is not a clinically validated
            medical device and does not provide diagnosis. Always consult a qualified healthcare
            professional, and contact emergency services in an emergency.
          </Alert>
        </Container>
      </section>

      <CallToAction />
    </>
  );
}
