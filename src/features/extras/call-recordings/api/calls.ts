import { http } from '@/services';

import type { Call, CallDto, CallLogRequest } from '../types';

export function toCall(dto: CallDto): Call {
  return {
    id: String(dto.id),
    direction: dto.direction,
    outcome: dto.outcome,
    phone: dto.phone,
    contactId: dto.contact_id === null ? null : String(dto.contact_id),
    ownerId: dto.owner_id === null ? null : String(dto.owner_id),
    startedAt: dto.started_at,
    durationSeconds: dto.duration_seconds,
    recordingUrl: dto.recording_url,
    notes: dto.notes ?? '',
  };
}

export async function fetchCalls(signal?: AbortSignal): Promise<Call[]> {
  const response = await http.get<{ calls: CallDto[] }>('/api/calls', { signal });
  return response.calls.map(toCall);
}

/** Logs a call by hand, e.g. from a contact's Calls tab. */
export async function logCall(body: CallLogRequest): Promise<Call> {
  const response = await http.post<{ call: CallDto }>('/api/calls', body);
  return toCall(response.call);
}

/** Links a call to a contact, or unlinks it with null. */
export async function setCallContact(id: string, contactId: string | null): Promise<Call> {
  const response = await http.patch<{ call: CallDto }>(`/api/calls/${encodeURIComponent(id)}`, {
    contact_id: contactId === null ? null : Number(contactId),
  });
  return toCall(response.call);
}

/** 125 → "2m 05s". */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${String(seconds)}s`;
  return `${String(Math.floor(seconds / 60))}m ${String(seconds % 60).padStart(2, '0')}s`;
}

/**
 * Comparable form of a phone number: its last 10 digits, so "+91 98400 12345",
 * "098400 12345" and "9840012345" all match. Empty when there are too few digits.
 */
export function phoneKey(phone: string | null | undefined): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits.length >= 7 ? digits.slice(-10) : '';
}

/** What the matcher needs to know about a contact. */
export interface CallContact {
  id: string;
  mobile: string;
  alternateMobile: string;
}

/**
 * The contact a call belongs to: its explicit link, otherwise the contact whose mobile or
 * alternate mobile matches the call's number.
 */
export function createCallContactResolver<T extends CallContact>(contacts: readonly T[]) {
  const byId = new Map(contacts.map((contact) => [contact.id, contact]));
  const byPhone = new Map<string, T>();
  for (const contact of contacts) {
    for (const phone of [contact.mobile, contact.alternateMobile]) {
      const key = phoneKey(phone);
      if (key && !byPhone.has(key)) byPhone.set(key, contact);
    }
  }
  return (
    call: Pick<Call, 'contactId' | 'phone'>,
  ): { contact: T; matchedBy: 'link' | 'phone' } | undefined => {
    if (call.contactId) {
      const linked = byId.get(call.contactId);
      return linked ? { contact: linked, matchedBy: 'link' } : undefined;
    }
    const matched = byPhone.get(phoneKey(call.phone));
    return matched ? { contact: matched, matchedBy: 'phone' } : undefined;
  };
}

/** True when the call is linked to the contact, or (unlinked) rang one of its numbers. */
export function callBelongsTo(
  call: Pick<Call, 'contactId' | 'phone'>,
  contact: CallContact,
): boolean {
  if (call.contactId) return call.contactId === contact.id;
  const key = phoneKey(call.phone);
  return (
    key !== '' && (key === phoneKey(contact.mobile) || key === phoneKey(contact.alternateMobile))
  );
}
