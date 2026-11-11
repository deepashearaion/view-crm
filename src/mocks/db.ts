import { readTokenClaims } from '@/features/auth';
import type { StoredFileDto } from '@/features/extras';

import { seedAttendance } from './seed/attendance';
import { seedCalls } from './seed/calls';
import { seedCompanies, seedCustomFields } from './seed/companies';
import { seedProducts } from './seed/products';

/** In-memory data store backing the mock API. Resets on page reload. */
export const db = {
  companies: seedCompanies(),
  companyFields: [...seedCustomFields],
  products: seedProducts(),
  attendance: seedAttendance(),
  calls: seedCalls(),
  files: [] as StoredFileDto[],
};

let nextId = 5000;
/** Monotonic ids for records created through the mock API. */
export const newId = (): number => ++nextId;

/** The signed-in user's id from the token, as the mock's owner/uploader. */
export function currentUserId(): number | null {
  const id = Number(readTokenClaims().user_id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** After loading persisted records, keep new ids above theirs so they never collide. */
export function reserveIds(ids: Iterable<number>): void {
  for (const id of ids) if (id > nextId) nextId = id;
}
