export const STAGE_KINDS = ['open', 'won', 'lost'] as const;
export type StageKind = (typeof STAGE_KINDS)[number];

export const STAGE_KIND_LABELS: Record<StageKind, string> = {
  open: 'Open',
  won: 'Won',
  lost: 'Lost',
};

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

const OPEN_STAGE_COLORS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const;

/**
 * The API has no stage colour: won is green, lost is red and open stages cycle through the
 * chart palette in pipeline order.
 */
export function stageColor(kind: StageKind, openIndex: number): StageColor {
  if (kind === 'won') return 'success';
  if (kind === 'lost') return 'destructive';
  return OPEN_STAGE_COLORS[openIndex % OPEN_STAGE_COLORS.length] ?? 'chart-1';
}

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

/** Fields a stage can require before a deal may enter it. */
export const STAGE_REQUIRED_FIELDS = ['amount', 'expected_close_date', 'contact'] as const;
export type StageRequiredField = (typeof STAGE_REQUIRED_FIELDS)[number];

export const STAGE_REQUIRED_FIELD_LABELS: Record<StageRequiredField, string> = {
  amount: 'Amount',
  expected_close_date: 'Close date',
  contact: 'Contact',
};

export const BILLING_TYPES = ['one_time', 'recurring'] as const;
export type BillingType = (typeof BILLING_TYPES)[number];

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  one_time: 'One-time',
  recurring: 'Recurring',
};

export const BILLING_PERIODS = ['monthly', 'quarterly', 'yearly'] as const;
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export const DEAL_STATUSES = ['open', 'won', 'lost'] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

/** List pages fetched for the client-side board. */
export const DEALS_PAGE_SIZE = 200;
export const DEALS_MAX = 5000;

export interface ForecastParams {
  /** First month, `YYYY-MM`. */
  from: string;
  months: number;
  ownerId?: string;
}

export const dealKeys = {
  all: ['deals'] as const,
  list: () => [...dealKeys.all, 'list'] as const,
  detail: (id: string) => [...dealKeys.all, 'detail', id] as const,
  history: (id: string) => [...dealKeys.all, 'history', id] as const,
  forecast: (params: ForecastParams) => [...dealKeys.all, 'forecast', params] as const,
  stages: () => [...dealKeys.all, 'stages'] as const,
};

/** Queries the server changes when a deal is won or lost. */
export const MOVE_SIDE_EFFECT_KEYS = [['tasks'], ['invoices'], ['contacts']] as const;
