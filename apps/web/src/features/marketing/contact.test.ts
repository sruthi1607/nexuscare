import { describe, expect, it } from 'vitest';
import { buildContactMailto, contactFormSchema } from './contact';

describe('contact form', () => {
  it('validates required fields', () => {
    const result = contactFormSchema.safeParse({ name: '', email: 'x', message: 'short' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0])).toEqual(
      expect.arrayContaining(['name', 'email', 'topic', 'message']),
    );
  });

  it('builds an encoded mailto link with topic subject and signature', () => {
    const url = buildContactMailto('hello@nexuscare.example', {
      name: 'Ravi',
      email: 'ravi@example.com',
      topic: 'doctors',
      message: 'How do I join? & what is needed',
    });
    expect(url.startsWith('mailto:hello%40nexuscare.example?subject=')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('[Nexus Care] Joining as a doctor');
    expect(params.get('body')).toBe('How do I join? & what is needed\n\n— Ravi (ravi@example.com)');
  });
});
