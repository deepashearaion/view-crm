import { getAuthToken } from '@/services/auth-token';

import { db } from '../db';
import { mock, mockError } from '../router';
import { dayKey } from '../seed/attendance';

/** Reads user_id from the (unsigned mock or real) JWT payload. */
function currentUserId(): number {
  const payload = getAuthToken()?.split('.')[1];
  try {
    const decoded: unknown = payload ? JSON.parse(atob(payload)) : null;
    if (typeof decoded === 'object' && decoded !== null && 'user_id' in decoded) {
      return Number(decoded.user_id);
    }
  } catch {
    // fall through
  }
  mockError(401, 'Not signed in');
}

mock('GET', '/api/attendance', ({ query }) => {
  const from = typeof query.from === 'string' ? query.from : '0000-00-00';
  const to = typeof query.to === 'string' ? query.to : '9999-99-99';
  return { records: db.attendance.filter((record) => record.date >= from && record.date <= to) };
});

mock('POST', '/api/attendance/check-in', ({ body }) => {
  const userId = currentUserId();
  const today = dayKey(new Date());
  if (db.attendance.some((record) => record.user_id === userId && record.date === today)) {
    mockError(409, 'You have already checked in today.');
  }
  const location = (body as { location?: string } | null)?.location ?? 'Office';
  const record = {
    id: db.attendance.length + 1,
    user_id: userId,
    date: today,
    status: 'present' as const,
    check_in: new Date().toISOString(),
    check_out: null,
    check_in_location: location,
    break_minutes: 0,
  };
  db.attendance.push(record);
  return { record };
});

mock('POST', '/api/attendance/check-out', () => {
  const userId = currentUserId();
  const today = dayKey(new Date());
  const record = db.attendance.find((item) => item.user_id === userId && item.date === today);
  if (!record?.check_in) mockError(409, 'Check in first.');
  if (record.check_out) mockError(409, 'You have already checked out today.');
  record.check_out = new Date().toISOString();
  return { record };
});
