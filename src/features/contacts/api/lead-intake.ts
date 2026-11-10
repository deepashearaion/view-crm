import { hasProblemCode, http } from '@/services';

import type { LeadRequest, LeadResult, LeadResultDto } from '../types';

export function toLeadResult(dto: LeadResultDto): LeadResult {
  return {
    contactId: String(dto.contact_id),
    created: dto.created,
    score: dto.score,
    temperature: dto.temperature,
    reasons: dto.reasons ?? [],
    ownerId: dto.owner_id === null ? null : String(dto.owner_id),
  };
}

/**
 * POST /api/v1/leads: creates (201) or merges into an existing contact matched by email/mobile
 * (200), then scores and routes it. Leave out fields that weren't filled in.
 */
export async function createLead(body: LeadRequest): Promise<LeadResult> {
  const response = await http.post<{ lead: LeadResultDto }>('/api/v1/leads', body);
  return toLeadResult(response.lead);
}

/** POST /api/v1/leads/{contactId}/rescore: re-runs the scoring rules. */
export async function rescoreLead(contactId: string): Promise<LeadResult> {
  const response = await http.post<{ lead: LeadResultDto }>(
    `/api/v1/leads/${encodeURIComponent(contactId)}/rescore`,
  );
  return toLeadResult(response.lead);
}

/** Friendly message for the lead-intake problem codes; undefined for anything else. */
export function leadErrorMessage(error: unknown): string | undefined {
  if (hasProblemCode(error, 'duplicate_contact'))
    return 'A contact with this email or mobile already exists and belongs to another rep. Ask a manager to reassign it to you.';
  if (hasProblemCode(error, 'invalid_owner'))
    return 'This lead couldn’t be assigned: the owner isn’t an active user. Pick another owner or check the lead routing settings.';
  return undefined;
}
