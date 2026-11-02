import { http } from '@/services';

import type { Call, CallDto } from '../types';

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
  };
}

export async function fetchCalls(signal?: AbortSignal): Promise<Call[]> {
  const response = await http.get<{ calls: CallDto[] }>('/api/calls', { signal });
  return response.calls.map(toCall);
}

/** 125 → "2m 05s". */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${String(seconds)}s`;
  return `${String(Math.floor(seconds / 60))}m ${String(seconds % 60).padStart(2, '0')}s`;
}
