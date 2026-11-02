import { http } from '@/services';

import type { Contact, ContactDto, ContactWriteDto } from '../types';

export function toContact(dto: ContactDto): Contact {
  const firstName = dto.first_name || '';
  const lastName = dto.last_name || '';
  return {
    id: String(dto.id),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || 'Unnamed contact',
    email: dto.email || '',
    mobile: dto.mobile || '',
    alternateMobile: dto.alternate_mobile || '',
    companyId: dto.company_id,
    leadStatusId: dto.lead_status_id,
    leadOwnerId: dto.lead_owner_id === null ? null : String(dto.lead_owner_id),
    destination: dto.destination || '',
    source: dto.source || '',
    notes: dto.notes || '',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at || dto.created_at,
    trip: dto.trip,
  };
}

export async function fetchContacts(signal?: AbortSignal): Promise<Contact[]> {
  const response = await http.get<{ contacts: ContactDto[] | null }>('/api/contacts', { signal });
  return (response.contacts ?? []).map(toContact);
}

export async function fetchContact(id: string, signal?: AbortSignal): Promise<Contact> {
  const response = await http.get<{ contact: ContactDto }>(
    `/api/contacts/${encodeURIComponent(id)}`,
    { signal },
  );
  return toContact(response.contact);
}

export async function createContact(body: ContactWriteDto): Promise<Contact> {
  const response = await http.post<{ contact: ContactDto }>('/api/contacts', body);
  return toContact(response.contact);
}

export async function updateContact(id: string, body: ContactWriteDto): Promise<Contact> {
  const response = await http.patch<{ contact: ContactDto }>(
    `/api/contacts/${encodeURIComponent(id)}`,
    body,
  );
  return toContact(response.contact);
}

export async function deleteContact(id: string): Promise<void> {
  await http.delete(`/api/contacts/${encodeURIComponent(id)}`);
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
