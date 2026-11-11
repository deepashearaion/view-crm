import type { CallDirection, CallDto, CallOutcome } from '@/features/extras';

import { currentUserId, db, newId, reserveIds } from '../db';
import { loadValue, saveValue } from '../persist';
import { mock, mockError } from '../router';

const STORAGE_KEY = 'calls';
const DIRECTIONS: CallDirection[] = ['inbound', 'outbound'];
const OUTCOMES: CallOutcome[] = ['connected', 'no_answer', 'busy', 'missed'];

const ready: Promise<void> = (async () => {
  const saved = await loadValue<CallDto[]>(STORAGE_KEY);
  if (!saved) return;
  db.calls = saved;
  reserveIds(saved.map((call) => call.id));
})();

const persist = () => saveValue(STORAGE_KEY, db.calls);

function record(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null) mockError(422, 'Expected a JSON body');
  return body as Record<string, unknown>;
}

function contactIdFrom(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    mockError(422, 'contact_id must be a contact id');
  }
  return value;
}

mock('GET', '/api/calls', async () => {
  await ready;
  return { calls: db.calls };
});

/** Logs a call by hand. */
mock('POST', '/api/calls', async ({ body }) => {
  await ready;
  const input = record(body);
  const {
    direction,
    outcome,
    phone,
    started_at: startedAt,
    duration_seconds: duration,
    notes,
  } = input;
  if (!DIRECTIONS.includes(direction as CallDirection)) mockError(422, 'Unknown direction');
  if (!OUTCOMES.includes(outcome as CallOutcome)) mockError(422, 'Unknown outcome');
  if (typeof phone !== 'string') mockError(422, 'phone is required');
  if (typeof startedAt !== 'string' || Number.isNaN(Date.parse(startedAt))) {
    mockError(422, 'started_at must be a date and time');
  }
  if (typeof duration !== 'number' || duration < 0) mockError(422, 'duration_seconds is invalid');

  const call: CallDto = {
    id: newId(),
    direction: direction as CallDirection,
    outcome: outcome as CallOutcome,
    phone,
    contact_id: contactIdFrom(input.contact_id),
    owner_id: currentUserId(),
    started_at: new Date(startedAt).toISOString(),
    duration_seconds: Math.round(duration),
    recording_url: null,
    notes: typeof notes === 'string' ? notes : '',
  };
  db.calls.unshift(call);
  await persist();
  return { call };
});

/** Body: { contact_id: number | null } to link or unlink a contact. */
mock('PATCH', '/api/calls/:id', async ({ params, body }) => {
  await ready;
  const call = db.calls.find((item) => String(item.id) === params.id);
  if (!call) mockError(404, 'Call not found');
  const input = record(body);
  if (!('contact_id' in input)) mockError(422, 'contact_id is required');
  call.contact_id = contactIdFrom(input.contact_id);
  await persist();
  return { call };
});
