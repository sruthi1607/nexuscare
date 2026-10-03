import { z } from 'zod';

export const contactTopics = [
  { value: 'general', label: 'General question' },
  { value: 'patients', label: 'Using Nexus Care as a patient' },
  { value: 'doctors', label: 'Joining as a doctor' },
  { value: 'partnerships', label: 'Clinics, pharmacies and partnerships' },
  { value: 'technical', label: 'Technical problem' },
] as const;

type ContactTopic = (typeof contactTopics)[number]['value'];
const topicValues = contactTopics.map((t) => t.value) as [ContactTopic, ...ContactTopic[]];

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100, 'Name is too long'),
  email: z.email('Enter a valid email address'),
  topic: z.enum(topicValues, { message: 'Choose a topic' }),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters')
    .max(2000, 'Message must be 2000 characters or fewer'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Builds a mailto: link so the message is sent from the visitor's own email app. There is no
 * contact backend yet, so nothing is submitted to Nexus Care servers.
 */
export function buildContactMailto(to: string, values: ContactFormValues): string {
  const topicLabel = contactTopics.find((t) => t.value === values.topic)?.label ?? values.topic;
  const subject = `[Nexus Care] ${topicLabel}`;
  const body = `${values.message}\n\n— ${values.name} (${values.email})`;
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
