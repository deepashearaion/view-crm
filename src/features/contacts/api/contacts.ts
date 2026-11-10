import { http } from '@/services';

import { CONTACTS_MAX_ROWS, CONTACTS_PAGE_SIZE, TIMELINE_PAGE_SIZE } from '../constants';
import type {
  Activity,
  ActivityDto,
  ActivityRequest,
  Contact,
  ContactDto,
  ContactWriteDto,
  LifecycleStage,
} from '../types';

const v1 = (id: string) => `/api/v1/contacts/${encodeURIComponent(id)}`;
const legacy = (id: string) => `/api/contacts/${encodeURIComponent(id)}`;

/** Maps a v1 or legacy contact. v1-only fields fall back to defaults when missing. */
export function toContact(dto: ContactDto): Contact {
  const firstName = dto.first_name || '';
  const lastName = dto.last_name || '';
  const score = dto.score ?? null;
  return {
    id: String(dto.id),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || 'Unnamed contact',
    email: dto.email || '',
    mobile: dto.mobile || '',
    alternateMobile: dto.alternate_mobile || '',
    companyId: dto.company_id ?? null,
    leadStatusId: dto.lead_status_id ?? null,
    leadOwnerId: dto.lead_owner_id === null ? null : String(dto.lead_owner_id),
    destination: dto.destination || '',
    source: dto.source || '',
    notes: dto.notes || '',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at || dto.created_at,
    trip: dto.trip,
    lifecycleStage: dto.lifecycle_stage ?? 'lead',
    score: score?.score ?? null,
    temperature: score?.temperature ?? null,
    scoreReasons: score?.reasons ?? [],
    scoredAt: score?.scored_at ?? null,
    optedOutAt: dto.marketing_opt_out_at ?? null,
  };
}

/** True when the DTO came from /api/v1 (legacy responses lack the lifecycle fields). */
function hasV1Fields(dto: ContactDto): boolean {
  return dto.lifecycle_stage !== undefined;
}

/**
 * GET /api/v1/contacts pages newest first with `before_id`. The contacts page filters on the
 * client, so this follows the cursor until a short page (capped at CONTACTS_MAX_ROWS).
 */
export async function fetchContacts(signal?: AbortSignal): Promise<Contact[]> {
  const all: ContactDto[] = [];
  let beforeId: number | undefined;
  while (all.length < CONTACTS_MAX_ROWS) {
    const response = await http.get<{ contacts: ContactDto[] | null }>('/api/v1/contacts', {
      query: { limit: CONTACTS_PAGE_SIZE, before_id: beforeId },
      signal,
    });
    const page = response.contacts ?? [];
    all.push(...page);
    const last = page.at(-1);
    if (page.length < CONTACTS_PAGE_SIZE || !last) break;
    beforeId = last.id;
  }
  return all.slice(0, CONTACTS_MAX_ROWS).map(toContact);
}

export async function fetchContact(id: string, signal?: AbortSignal): Promise<Contact> {
  const response = await http.get<{ contact: ContactDto }>(v1(id), { signal });
  return toContact(response.contact);
}

/** Legacy POST /api/contacts. Used by bulk import; the contact form goes through createLead. */
export async function createContact(body: ContactWriteDto): Promise<Contact> {
  const response = await http.post<{ contact: ContactDto }>('/api/contacts', body);
  return toContact(response.contact);
}

/** Legacy PATCH /api/contacts/{id}; the response lacks the v1 fields. */
export async function patchContact(id: string, body: ContactWriteDto): Promise<ContactDto> {
  const response = await http.patch<{ contact: ContactDto }>(legacy(id), body);
  return response.contact;
}

/** Patches basic fields, then reloads from /api/v1 when the response lacks lifecycle/score. */
export async function updateContact(id: string, body: ContactWriteDto): Promise<Contact> {
  const dto = await patchContact(id, body);
  return hasV1Fields(dto) ? toContact(dto) : fetchContact(id);
}

export async function deleteContact(id: string): Promise<void> {
  await http.delete(legacy(id));
}

export async function setLifecycleStage(id: string, stage: LifecycleStage): Promise<Contact> {
  const response = await http.put<{ contact: ContactDto }>(`${v1(id)}/lifecycle-stage`, {
    lifecycle_stage: stage,
  });
  return toContact(response.contact);
}

export function toActivity(dto: ActivityDto): Activity {
  return {
    id: String(dto.id),
    contactId: String(dto.contact_id),
    kind: dto.kind,
    channel: dto.channel ?? null,
    direction: dto.direction ?? null,
    summary: dto.summary || '',
    body: dto.body || '',
    metadata: dto.metadata ?? {},
    actorUserId: dto.actor_user_id === null ? null : String(dto.actor_user_id),
    occurredAt: dto.occurred_at,
  };
}

/** One page of a contact's timeline, newest first. */
export async function fetchTimeline(
  id: string,
  beforeId: string | undefined,
  signal?: AbortSignal,
): Promise<Activity[]> {
  const response = await http.get<{ activities: ActivityDto[] | null }>(`${v1(id)}/timeline`, {
    query: { limit: TIMELINE_PAGE_SIZE, before_id: beforeId },
    signal,
  });
  return (response.activities ?? []).map(toActivity);
}

export async function logActivity(id: string, body: ActivityRequest): Promise<Activity> {
  const response = await http.post<{ activity: ActivityDto }>(`${v1(id)}/activities`, body);
  return toActivity(response.activity);
}

export interface BatchResult {
  succeeded: string[];
  failed: string[];
}

/** Runs a per-contact request for many ids in parallel and reports partial failures. */
export async function batch(
  ids: string[],
  run: (id: string) => Promise<unknown>,
): Promise<BatchResult> {
  const results = await Promise.allSettled(ids.map(run));
  return results.reduce<BatchResult>(
    (acc, result, index) => {
      const id = ids[index];
      if (id !== undefined) (result.status === 'fulfilled' ? acc.succeeded : acc.failed).push(id);
      return acc;
    },
    { succeeded: [], failed: [] },
  );
}
