import { LANGUAGES, SEX_OPTIONS, type Address } from '@nexuscare/shared';

/** "1988-04-12" → "12 April 1988" in the user's locale. Dates are calendar dates (no time zone). */
export function formatDate(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Whole years between a YYYY-MM-DD birth date and today. */
export function ageFromDateOfBirth(isoDate: string | null, today = new Date()): number | null {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  let age = today.getFullYear() - y;
  const beforeBirthday =
    today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export function formatAddress(address: Address | Record<keyof Address, string | null>): string | null {
  const parts = [
    address.line1,
    address.line2,
    [address.city, address.region].filter(Boolean).join(', '),
    [address.postalCode, address.country].filter(Boolean).join(' '),
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join('\n') : null;
}

export function sexLabel(value: string | null): string | null {
  return SEX_OPTIONS.find((o) => o.value === value)?.label ?? null;
}

export function languageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

export function formatMoney(amount: number | null, currency: string | null): string | null {
  if (amount === null || !currency) return null;
  if (amount === 0) return 'Free';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${String(amount)}`;
  }
}

/** All IANA time zones the browser knows (falls back to a short list on very old browsers). */
export function timeZoneOptions(current?: string): { value: string; label: string }[] {
  let zones: string[];
  try {
    zones = Intl.supportedValuesOf('timeZone');
  } catch {
    zones = ['UTC', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Kathmandu', 'Africa/Nairobi', 'Europe/London'];
  }
  if (!zones.includes('UTC')) zones = ['UTC', ...zones];
  if (current && !zones.includes(current)) zones = [current, ...zones];
  return zones.map((zone) => ({ value: zone, label: zone.replaceAll('_', ' ') }));
}

/** The browser's own time zone — a sensible default suggestion. */
export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
