import type { CallDirection, CallDto, CallOutcome } from '@/features/extras';

const outcomes: CallOutcome[] = [
  'connected',
  'connected',
  'connected',
  'no_answer',
  'busy',
  'missed',
];

/** ~50 deterministic calls over the last 40 days. */
export function seedCalls(now: number = Date.now()): CallDto[] {
  return Array.from({ length: 50 }, (_, index) => {
    const outcome = outcomes[(index * 7) % outcomes.length] ?? 'connected';
    const direction: CallDirection = index % 3 === 0 ? 'inbound' : 'outbound';
    const contactId = index % 5 === 4 ? null : 1001 + (index % 24);
    const started = new Date(now - index * 0.8 * 86_400_000 - (index % 9) * 3_600_000);
    return {
      id: 600 + index,
      direction,
      outcome,
      phone: `+91 98${String(40000000 + (index % 24) * 731_117).slice(0, 8)}`,
      contact_id: contactId,
      owner_id: [1, 2, 3, 7][index % 4] ?? null,
      started_at: started.toISOString(),
      duration_seconds: outcome === 'connected' ? 45 + ((index * 53) % 540) : 0,
      recording_url: null,
    };
  });
}
