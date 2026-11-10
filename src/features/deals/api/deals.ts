import { format, parseISO } from 'date-fns';

import { paiseToRupees, rupeesToPaise } from '@/lib/format';
import { http } from '@/services';

import { DEALS_MAX, DEALS_PAGE_SIZE, type ForecastParams } from '../constants';
import type {
  Deal,
  DealCreateDto,
  DealDto,
  DealForecast,
  DealFormOutput,
  DealFormValues,
  DealHistoryDto,
  DealHistoryEntry,
  DealMoveDto,
  DealUpdateDto,
  ForecastDto,
} from '../types';

const idOrNull = (value: number | null) => (value === null ? null : String(value));

export function toDeal(dto: DealDto): Deal {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    contactId: idOrNull(dto.contact_id),
    ownerId: idOrNull(dto.owner_id),
    stageId: String(dto.stage_id),
    stageName: dto.stage_name,
    status: dto.status,
    amountPaise: dto.amount_paise,
    billingType: dto.billing_type,
    billingPeriod: dto.billing_period,
    valuePaise: dto.value_paise,
    expectedCloseDate: dto.expected_close_date,
    closedAt: dto.closed_at,
    lostReason: dto.lost_reason,
    stageEnteredAt: dto.stage_entered_at,
    winProbability: dto.win_probability,
    probabilityNotes: dto.probability_notes ?? [],
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

/** `YYYY-MM-DD` → local Date for the date picker. */
const dayToDate = (day: string | null) => (day ? parseISO(day) : undefined);
/** Picked calendar day → `YYYY-MM-DD`. */
const dateToDay = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : null);

export function dealToFormValues(
  deal: Deal | undefined,
  defaults: { stageId: string; ownerId: string },
): DealFormValues {
  return {
    title: deal?.title ?? '',
    description: deal?.description ?? '',
    amount: deal && deal.amountPaise > 0 ? String(paiseToRupees(deal.amountPaise)) : '',
    billingType: deal?.billingType ?? 'one_time',
    billingPeriod: deal?.billingPeriod ?? '',
    stageId: deal?.stageId ?? defaults.stageId,
    ownerId: deal ? (deal.ownerId ?? '') : defaults.ownerId,
    contactId: deal?.contactId ?? '',
    expectedClose: dayToDate(deal?.expectedCloseDate ?? null),
  };
}

const amountToPaise = (amount: string) => (amount === '' ? 0 : rupeesToPaise(Number(amount)));

/** POST body: only the fields the user filled in. */
export function formValuesToCreateDto(
  values: DealFormOutput,
  options: { canReassign: boolean },
): DealCreateDto {
  const body: DealCreateDto = { title: values.title };
  if (values.description) body.description = values.description;
  if (values.contactId) body.contact_id = Number(values.contactId);
  if (options.canReassign && values.ownerId) body.owner_id = Number(values.ownerId);
  if (values.stageId) body.stage_id = Number(values.stageId);
  if (values.amount !== '') body.amount_paise = amountToPaise(values.amount);
  body.billing_type = values.billingType;
  if (values.billingType === 'recurring' && values.billingPeriod) {
    body.billing_period = values.billingPeriod;
  }
  const close = dateToDay(values.expectedClose);
  if (close) body.expected_close_date = close;
  return body;
}

/** PATCH body: only the fields that changed. Never includes stage_id. */
export function formValuesToUpdateDto(
  values: DealFormOutput,
  deal: Deal,
  options: { canReassign: boolean },
): DealUpdateDto {
  const body: DealUpdateDto = {};
  if (values.title !== deal.title) body.title = values.title;
  if (values.description !== deal.description) body.description = values.description;

  const amountPaise = amountToPaise(values.amount);
  if (amountPaise !== deal.amountPaise) body.amount_paise = amountPaise;

  const periodChanged =
    values.billingType === 'recurring' && values.billingPeriod !== (deal.billingPeriod ?? '');
  if (values.billingType !== deal.billingType || periodChanged) {
    body.billing_type = values.billingType;
    if (values.billingType === 'recurring' && values.billingPeriod) {
      body.billing_period = values.billingPeriod;
    }
  }

  if (options.canReassign && values.ownerId && values.ownerId !== (deal.ownerId ?? '')) {
    body.owner_id = Number(values.ownerId);
  }

  if (values.contactId !== (deal.contactId ?? '')) {
    if (values.contactId) body.contact_id = Number(values.contactId);
    else body.clear_contact = true;
  }

  const close = dateToDay(values.expectedClose);
  if (close !== deal.expectedCloseDate) {
    if (close) body.expected_close_date = close;
    else body.clear_expected_close_date = true;
  }
  return body;
}

const dealPath = (id: string) => `/api/v1/deals/${encodeURIComponent(id)}`;

/** Every deal the user can see: offset pages of 200 until a short page (capped at 5,000). */
export async function fetchDeals(signal?: AbortSignal): Promise<Deal[]> {
  const deals: Deal[] = [];
  for (let offset = 0; offset < DEALS_MAX; offset += DEALS_PAGE_SIZE) {
    const response = await http.get<{ deals: DealDto[] | null }>('/api/v1/deals', {
      query: { limit: DEALS_PAGE_SIZE, offset },
      signal,
    });
    const page = response.deals ?? [];
    deals.push(...page.map(toDeal));
    if (page.length < DEALS_PAGE_SIZE) break;
  }
  return deals;
}

export async function fetchDeal(id: string, signal?: AbortSignal): Promise<Deal> {
  const response = await http.get<{ deal: DealDto }>(dealPath(id), { signal });
  return toDeal(response.deal);
}

export async function createDeal(body: DealCreateDto): Promise<Deal> {
  const response = await http.post<{ deal: DealDto }>('/api/v1/deals', body);
  return toDeal(response.deal);
}

export async function updateDeal(id: string, body: DealUpdateDto): Promise<Deal> {
  const response = await http.patch<{ deal: DealDto }>(dealPath(id), body);
  return toDeal(response.deal);
}

export async function deleteDeal(id: string): Promise<void> {
  await http.delete(dealPath(id));
}

/**
 * The only way to change a deal's stage. `422 stage_requirements` lists missing fields;
 * lost stages need `lost_reason`.
 */
export async function moveDeal(id: string, body: DealMoveDto): Promise<Deal> {
  const response = await http.post<{ deal: DealDto }>(`${dealPath(id)}/stage`, body);
  return toDeal(response.deal);
}

export async function fetchDealHistory(
  id: string,
  signal?: AbortSignal,
): Promise<DealHistoryEntry[]> {
  const response = await http.get<{ history: DealHistoryDto[] | null }>(`${dealPath(id)}/history`, {
    signal,
  });
  return (response.history ?? []).map((entry) => ({
    fromStageId: idOrNull(entry.from_stage_id),
    fromStage: entry.from_stage,
    toStageId: String(entry.to_stage_id),
    toStage: entry.to_stage,
    changedById: idOrNull(entry.changed_by_id),
    changedAt: entry.changed_at,
  }));
}

export async function fetchForecast(
  params: ForecastParams,
  signal?: AbortSignal,
): Promise<DealForecast> {
  const response = await http.get<{ forecast: ForecastDto }>('/api/v1/deals/forecast', {
    query: { from: params.from, months: params.months, owner_id: params.ownerId },
    signal,
  });
  const { forecast } = response;
  return {
    method: forecast.method,
    months: (forecast.months ?? []).map((month) => ({
      month: month.month,
      wonDeals: month.won_deals,
      wonPaise: month.won_paise,
      openDeals: month.open_deals,
      bestCasePaise: month.best_case_paise,
      weightedPaise: month.weighted_paise,
      forecastPaise: month.forecast_paise,
      commitPaise: month.commit_paise,
    })),
    overdue: { deals: forecast.overdue.deals, valuePaise: forecast.overdue.value_paise },
    undated: { deals: forecast.undated.deals, valuePaise: forecast.undated.value_paise },
  };
}
