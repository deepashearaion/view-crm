export const CALL_DIRECTIONS = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
] as const;

export const CALL_OUTCOMES = [
  { value: 'connected', label: 'Connected', variant: 'ai' },
  { value: 'no_answer', label: 'No answer', variant: 'warm' },
  { value: 'busy', label: 'Busy', variant: 'decision' },
  { value: 'missed', label: 'Missed', variant: 'destructive' },
] as const;

export type CallDirection = (typeof CALL_DIRECTIONS)[number]['value'];
export type CallOutcome = (typeof CALL_OUTCOMES)[number]['value'];

export interface CallDto {
  id: number;
  direction: CallDirection;
  outcome: CallOutcome;
  phone: string;
  contact_id: number | null;
  owner_id: number | null;
  started_at: string;
  duration_seconds: number;
  recording_url: string | null;
  /** Missing on calls from the telephony feed. */
  notes?: string;
}

/** POST /api/calls body: a call logged by hand (e.g. from a contact). */
export interface CallLogRequest {
  direction: CallDirection;
  outcome: CallOutcome;
  phone: string;
  contact_id: number | null;
  started_at: string;
  duration_seconds: number;
  notes?: string;
}

export interface Call {
  id: string;
  direction: CallDirection;
  outcome: CallOutcome;
  phone: string;
  contactId: string | null;
  ownerId: string | null;
  startedAt: string;
  durationSeconds: number;
  recordingUrl: string | null;
  notes: string;
}
