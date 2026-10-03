import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, Send } from 'lucide-react';
import { Container } from '../../../components/layout/Container';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Field } from '../../../components/ui/Field';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { env } from '../../../lib/env';
import { PageHero } from '../components/PageHero';
import {
  buildContactMailto,
  contactFormSchema,
  contactTopics,
  type ContactFormValues,
} from '../contact';

export function ContactPage() {
  const contactEmail = env.contactEmail;
  const [opened, setOpened] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = (values: ContactFormValues) => {
    window.location.href = buildContactMailto(contactEmail, values);
    setOpened(true);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We’d like to hear from you."
        description="Questions about the platform, joining as a doctor or partnering with us — send us a message."
      />

      <section aria-label="Contact" className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <Alert tone="danger" title="Medical emergency?">
              Do not use this form. Contact your local emergency services immediately.
            </Alert>
            <div className="flex gap-3 text-sm text-slate-600">
              <Phone className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
              <p>
                This form is not monitored for medical questions. For advice about your health,
                please speak to a qualified doctor.
              </p>
            </div>
            {contactEmail ? (
              <div className="flex gap-3 text-sm text-slate-600">
                <Mail className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
                <p>
                  Or email us directly at{' '}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {contactEmail}
                  </a>
                  .
                </p>
              </div>
            ) : null}
          </div>

          <Card>
            <CardBody className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Send a message</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your message opens in your own email app, ready to send.
              </p>

              {!contactEmail ? (
                <Alert tone="warning" title="Messaging is not set up yet" className="mt-6">
                  A contact address has not been configured for this deployment, so messages cannot
                  be sent from this page yet.
                </Alert>
              ) : null}
              {opened ? (
                <Alert
                  tone="success"
                  title="Your email app should now be open"
                  className="mt-6"
                  onDismiss={() => {
                    setOpened(false);
                  }}
                >
                  Review the message there and press send. If nothing opened, email us at{' '}
                  {contactEmail}.
                </Alert>
              ) : null}

              <form
                noValidate
                onSubmit={(event) => void handleSubmit(onSubmit)(event)}
                className="mt-6 grid gap-5 sm:grid-cols-2"
              >
                <Field label="Your name" required error={errors.name?.message}>
                  {(p) => <Input autoComplete="name" {...p} {...register('name')} />}
                </Field>
                <Field label="Email" required error={errors.email?.message}>
                  {(p) => <Input type="email" autoComplete="email" {...p} {...register('email')} />}
                </Field>
                <Field
                  label="Topic"
                  required
                  error={errors.topic?.message}
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <Select
                      placeholder="Select a topic"
                      options={contactTopics.map((t) => ({ value: t.value, label: t.label }))}
                      {...p}
                      {...register('topic')}
                    />
                  )}
                </Field>
                <Field
                  label="Message"
                  required
                  hint="Please don’t include personal medical details."
                  error={errors.message?.message}
                  className="sm:col-span-2"
                >
                  {(p) => <Textarea rows={6} {...p} {...register('message')} />}
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={!contactEmail} className="w-full sm:w-auto">
                    <Send aria-hidden="true" />
                    Open in email app
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Container>
      </section>
    </>
  );
}
