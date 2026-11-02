import { http } from '@/services';

import type {
  Deal,
  DealDto,
  DealFormOutput,
  DealFormValues,
  DealStage,
  DealWriteDto,
} from '../types';

const idOrNull = (value: number | null) => (value === null ? null : String(value));
const numberOrNull = (value: string) => (value ? Number(value) : null);

export function toDeal(dto: DealDto): Deal {
  return {
    id: String(dto.id),
    title: dto.title,
    value: dto.value,
    stageId: dto.stage_id,
    ownerId: idOrNull(dto.owner_id),
    contactId: idOrNull(dto.contact_id),
    companyId: idOrNull(dto.company_id),
    priority: dto.priority,
    expectedClose: dto.expected_close,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function dealToFormValues(
  deal: Deal | undefined,
  defaults: { stageId: string; ownerId: string },
): DealFormValues {
  return {
    title: deal?.title ?? '',
    value: deal ? String(deal.value) : '',
    stageId: deal?.stageId ?? defaults.stageId,
    ownerId: deal ? (deal.ownerId ?? '') : defaults.ownerId,
    contactId: deal?.contactId ?? '',
    companyId: deal?.companyId ?? '',
    priority: deal?.priority ?? 'medium',
    expectedClose: deal?.expectedClose ? new Date(deal.expectedClose) : undefined,
  };
}

export function formValuesToDto(values: DealFormOutput): DealWriteDto {
  return {
    title: values.title,
    value: Number(values.value),
    stage_id: values.stageId,
    owner_id: numberOrNull(values.ownerId),
    contact_id: numberOrNull(values.contactId),
    company_id: numberOrNull(values.companyId),
    priority: values.priority,
    expected_close: values.expectedClose ? values.expectedClose.toISOString() : null,
  };
}

export async function fetchDeals(signal?: AbortSignal): Promise<Deal[]> {
  const response = await http.get<{ deals: DealDto[] }>('/api/deals', { signal });
  return response.deals.map(toDeal);
}

export async function createDeal(body: DealWriteDto): Promise<Deal> {
  const response = await http.post<{ deal: DealDto }>('/api/deals', body);
  return toDeal(response.deal);
}

export async function updateDeal(id: string, body: DealWriteDto): Promise<Deal> {
  const response = await http.patch<{ deal: DealDto }>(
    `/api/deals/${encodeURIComponent(id)}`,
    body,
  );
  return toDeal(response.deal);
}

export async function deleteDeal(id: string): Promise<void> {
  await http.delete(`/api/deals/${encodeURIComponent(id)}`);
}

export async function fetchStages(signal?: AbortSignal): Promise<DealStage[]> {
  const response = await http.get<{ stages: DealStage[] }>('/api/deal-stages', { signal });
  return response.stages;
}

/** Replaces the ordered stage list. Deals in removed stages are moved by the server. */
export async function saveStages(stages: DealStage[]): Promise<DealStage[]> {
  const response = await http.put<{ stages: DealStage[] }>('/api/deal-stages', { stages });
  return response.stages;
}
