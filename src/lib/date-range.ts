import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

export const DATE_PRESETS = [
  { id: 'all_time', label: 'All time' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This week' },
  { id: 'last_week', label: 'Last week' },
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'this_year', label: 'This year' },
  { id: 'last_year', label: 'Last year' },
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number]['id'];

export interface DateRange {
  from: Date;
  to: Date;
}

const weekOptions = { weekStartsOn: 1 } as const;

/** Resolves a preset to an inclusive range; `undefined` means unbounded (all time). */
export function resolveDatePreset(
  preset: DatePreset,
  now: Date = new Date(),
): DateRange | undefined {
  switch (preset) {
    case 'all_time':
      return undefined;
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'yesterday': {
      const day = subDays(now, 1);
      return { from: startOfDay(day), to: endOfDay(day) };
    }
    case 'this_week':
      return { from: startOfWeek(now, weekOptions), to: endOfWeek(now, weekOptions) };
    case 'last_week': {
      const week = subWeeks(now, 1);
      return { from: startOfWeek(week, weekOptions), to: endOfWeek(week, weekOptions) };
    }
    case 'this_month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'last_month': {
      const month = subMonths(now, 1);
      return { from: startOfMonth(month), to: endOfMonth(month) };
    }
    case 'this_year':
      return { from: startOfYear(now), to: endOfYear(now) };
    case 'last_year': {
      const year = subYears(now, 1);
      return { from: startOfYear(year), to: endOfYear(year) };
    }
  }
}

export function isWithinPreset(value: string | Date, preset: DatePreset, now?: Date): boolean {
  const range = resolveDatePreset(preset, now);
  if (!range) return true;
  const time = new Date(value).getTime();
  return time >= range.from.getTime() && time <= range.to.getTime();
}

export function isDatePreset(value: string): value is DatePreset {
  return DATE_PRESETS.some((preset) => preset.id === value);
}
