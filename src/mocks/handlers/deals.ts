import type { DealDto, DealStage } from '@/features/deals';

import { db, newId } from '../db';
import { mock, mockError } from '../router';

type DealWrite = Partial<Omit<DealDto, 'id' | 'created_at' | 'updated_at'>>;

function asWrite(body: unknown): DealWrite {
  if (typeof body !== 'object' || body === null) mockError(400, 'Invalid request body');
  return body;
}

function find(id: string | undefined): DealDto {
  const deal = db.deals.find((item) => String(item.id) === id);
  if (!deal) mockError(404, 'Deal not found');
  return deal;
}

function assertStage(stageId: string | undefined) {
  if (stageId !== undefined && !db.stages.some((stage) => stage.id === stageId)) {
    mockError(400, 'Unknown stage');
  }
}

mock('GET', '/api/deal-stages', () => ({ stages: db.stages }));

mock('PUT', '/api/deal-stages', ({ body }) => {
  const stages = (body as { stages?: DealStage[] } | null)?.stages;
  if (!Array.isArray(stages) || stages.length === 0) mockError(400, 'stages are required');
  const fallback = stages.find((stage) => stage.kind === 'open');
  if (!fallback) mockError(400, 'At least one open stage is required');
  const kept = new Set(stages.map((stage) => stage.id));
  // Deals in removed stages move to the first open stage rather than disappearing.
  for (const deal of db.deals) {
    if (!kept.has(deal.stage_id)) deal.stage_id = fallback.id;
  }
  db.stages = stages;
  return { stages: db.stages };
});

mock('GET', '/api/deals', () => ({ deals: db.deals }));

mock('POST', '/api/deals', ({ body }) => {
  const input = asWrite(body);
  if (!input.title?.trim()) mockError(400, 'title is required');
  assertStage(input.stage_id);
  const now = new Date().toISOString();
  const deal: DealDto = {
    value: 0,
    stage_id: db.stages[0]?.id ?? '',
    owner_id: null,
    contact_id: null,
    company_id: null,
    priority: 'medium',
    expected_close: null,
    ...input,
    title: input.title,
    id: newId(),
    created_at: now,
    updated_at: now,
  };
  db.deals.unshift(deal);
  return { deal };
});

mock('PATCH', '/api/deals/:id', ({ params, body }) => {
  const deal = find(params.id);
  const input = asWrite(body);
  assertStage(input.stage_id);
  Object.assign(deal, input, { updated_at: new Date().toISOString() });
  return { deal };
});

mock('DELETE', '/api/deals/:id', ({ params }) => {
  const deal = find(params.id);
  db.deals = db.deals.filter((item) => item !== deal);
  return { message: 'Deal deleted' };
});
