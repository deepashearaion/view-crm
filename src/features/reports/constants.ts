import type { ReportRange } from './types';

export const reportKeys = {
  all: ['reports'] as const,
  dashboard: (range: ReportRange) =>
    [...reportKeys.all, 'dashboard', range.from, range.to] as const,
  funnel: (range: ReportRange) => [...reportKeys.all, 'funnel', range.from, range.to] as const,
  pipeline: () => [...reportKeys.all, 'pipeline'] as const,
  sources: (range: ReportRange) => [...reportKeys.all, 'sources', range.from, range.to] as const,
  reps: (range: ReportRange) => [...reportKeys.all, 'reps', range.from, range.to] as const,
  revenue: (months: number) => [...reportKeys.all, 'revenue', months] as const,
  settings: () => [...reportKeys.all, 'settings'] as const,
};

/** The API rejects longer periods. */
export const MAX_REPORT_RANGE_DAYS = 731;

export const REVENUE_MONTH_OPTIONS = [6, 12, 24, 36] as const;
export type RevenueMonths = (typeof REVENUE_MONTH_OPTIONS)[number];
export const DEFAULT_REVENUE_MONTHS: RevenueMonths = 12;

export const REPORT_RANGE_PRESETS = [
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'this_quarter', label: 'This quarter' },
  { id: 'last_90_days', label: 'Last 90 days' },
  { id: 'this_year', label: 'This year' },
  { id: 'last_year', label: 'Last year' },
] as const;

export type ReportRangePreset = (typeof REPORT_RANGE_PRESETS)[number]['id'];

/** Label for the API's `"(none)"` source bucket. */
export const UNKNOWN_SOURCE = '(none)';
