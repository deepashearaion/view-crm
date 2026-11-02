export const STAGE_KINDS = ['open', 'won', 'lost'] as const;
export type StageKind = (typeof STAGE_KINDS)[number];

export const STAGE_COLORS = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'success',
  'destructive',
] as const;
export type StageColor = (typeof STAGE_COLORS)[number];

/** Literal class names so Tailwind can see them. */
export const stageColorClass: Record<StageColor, { dot: string; bar: string }> = {
  'chart-1': { dot: 'bg-chart-1', bar: 'bg-chart-1' },
  'chart-2': { dot: 'bg-chart-2', bar: 'bg-chart-2' },
  'chart-3': { dot: 'bg-chart-3', bar: 'bg-chart-3' },
  'chart-4': { dot: 'bg-chart-4', bar: 'bg-chart-4' },
  'chart-5': { dot: 'bg-chart-5', bar: 'bg-chart-5' },
  success: { dot: 'bg-success', bar: 'bg-success' },
  destructive: { dot: 'bg-destructive', bar: 'bg-destructive' },
};

export const DEAL_PRIORITIES = [
  { value: 'low', label: 'Low', variant: 'secondary' },
  { value: 'medium', label: 'Medium', variant: 'warm' },
  { value: 'high', label: 'High', variant: 'hot' },
] as const;

export type DealPriority = (typeof DEAL_PRIORITIES)[number]['value'];

export function priorityByValue(value: string) {
  return DEAL_PRIORITIES.find((priority) => priority.value === value);
}

export const dealKeys = {
  all: ['deals'] as const,
  list: () => [...dealKeys.all, 'list'] as const,
  stages: () => [...dealKeys.all, 'stages'] as const,
};
