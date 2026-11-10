import { format } from 'date-fns';

import { paiseToRupees } from '@/lib/format';

const compactInr = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Axis ticks: 1,25,00,000 paise → "₹1.3L". */
export function formatCompactPaise(paise: number): string {
  return `₹${compactInr.format(paiseToRupees(paise))}`;
}

const percentFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

/** 42.857 → "42.9%". */
export function formatPercent(value: number): string {
  return `${percentFormat.format(value)}%`;
}

const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** `YYYY-MM` → "Nov 26" (or "November 2026" when `long`). */
export function formatReportMonth(month: string, long = false): string {
  const [year, monthIndex] = month.split('-').map(Number);
  if (!year || !monthIndex) return month;
  return format(new Date(year, monthIndex - 1, 1), long ? 'MMMM yyyy' : 'MMM yy');
}
