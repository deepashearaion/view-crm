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
