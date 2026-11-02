const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** "4 minutes ago", "yesterday", "in 2 days". */
export function formatRelativeTime(value: string | Date, now: Date = new Date()): string {
  const seconds = Math.round((new Date(value).getTime() - now.getTime()) / 1000);
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size)
      return relativeFormatter.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function toValidDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** "2 Nov 2026"; empty string for missing/invalid dates. */
export function formatDate(value: string | Date | null | undefined): string {
  const date = toValidDate(value);
  return date ? dateFormatter.format(date) : '';
}

/** "2 Nov 2026, 3:45 pm"; empty string for missing/invalid dates. */
export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toValidDate(value);
  return date ? dateTimeFormatter.format(date) : '';
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

/** ₹4,18,638.00 */
export function formatCurrency(value: number): string {
  return inrFormatter.format(value);
}

/** "Priya Sharma" → "PS". */
export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  );
}
