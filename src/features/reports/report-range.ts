import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
  subYears,
  endOfYear,
} from 'date-fns';

import { toIstDate } from '@/lib/format';

import { MAX_REPORT_RANGE_DAYS, REPORT_RANGE_PRESETS, type ReportRangePreset } from './constants';
import type { ReportRange } from './types';

const DAY_FORMAT = 'yyyy-MM-dd';

/**
 * Report ranges are IST calendar days. They are handled as local `Date`s at midnight so
 * calendar arithmetic (month starts, day counts) doesn't depend on the browser's zone.
 */
export function parseReportDay(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = parse(value, DAY_FORMAT, new Date());
  return isValid(date) ? date : undefined;
}

export function formatReportDay(date: Date): string {
  return format(date, DAY_FORMAT);
}

/** Today's IST calendar day as a local midnight `Date`. */
export function istToday(now: Date = new Date()): Date {
  return parseReportDay(toIstDate(now)) ?? now;
}

/** The API's default period: the current IST month up to today. */
export function currentMonthRange(now: Date = new Date()): ReportRange {
  const today = istToday(now);
  return { from: formatReportDay(startOfMonth(today)), to: formatReportDay(today) };
}

export function resolveReportPreset(
  preset: ReportRangePreset,
  now: Date = new Date(),
): ReportRange {
  const today = istToday(now);
  const range = (from: Date, to: Date = today): ReportRange => ({
    from: formatReportDay(from),
    to: formatReportDay(to),
  });
  switch (preset) {
    case 'this_month':
      return range(startOfMonth(today));
    case 'last_month': {
      const month = subMonths(today, 1);
      return range(startOfMonth(month), endOfMonth(month));
    }
    case 'this_quarter':
      return range(startOfQuarter(today));
    case 'last_90_days':
      return range(subDays(today, 89));
    case 'this_year':
      return range(startOfYear(today));
    case 'last_year': {
      const year = subYears(today, 1);
      return range(startOfYear(year), endOfYear(year));
    }
  }
}

/** The preset that produces exactly this range today, if any. */
export function matchReportPreset(
  range: ReportRange,
  now: Date = new Date(),
): ReportRangePreset | undefined {
  return REPORT_RANGE_PRESETS.find((preset) => {
    const resolved = resolveReportPreset(preset.id, now);
    return resolved.from === range.from && resolved.to === range.to;
  })?.id;
}

/** Inclusive number of days in the range. */
export function reportRangeDays(range: ReportRange): number {
  const from = parseReportDay(range.from);
  const to = parseReportDay(range.to);
  if (!from || !to) return 0;
  return differenceInCalendarDays(to, from) + 1;
}

/** Why the API would reject this range, or undefined when it's fine. */
export function reportRangeProblem(range: ReportRange): string | undefined {
  const days = reportRangeDays(range);
  if (days < 1) return 'The start date must be on or before the end date.';
  if (days > MAX_REPORT_RANGE_DAYS)
    return `Pick at most ${MAX_REPORT_RANGE_DAYS} days (about two years).`;
  return undefined;
}

/** Reads `?from=&to=` (e.g. from the weekly email link); falls back to the current month. */
export function rangeFromSearchParams(params: URLSearchParams, now?: Date): ReportRange {
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  if (parseReportDay(from) && parseReportDay(to) && !reportRangeProblem({ from, to }))
    return { from, to };
  return currentMonthRange(now);
}

const shortDay = (date: Date) => format(date, 'd MMM yyyy');

/** "1 Nov – 10 Nov 2026". */
export function formatReportRange(range: ReportRange): string {
  const from = parseReportDay(range.from);
  const to = parseReportDay(range.to);
  if (!from || !to) return '';
  if (range.from === range.to) return shortDay(from);
  const sameYear = from.getFullYear() === to.getFullYear();
  return `${format(from, sameYear ? 'd MMM' : 'd MMM yyyy')} – ${shortDay(to)}`;
}
