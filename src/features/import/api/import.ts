import { createCompany } from '@/features/companies';
import { createContact } from '@/features/contacts';
import { errorMessage } from '@/services';

import type { ImportResult, ImportTarget, MappedRow, RowIssue } from '../types';

import { prepareCompany, prepareContact } from './mapping';

const CONCURRENCY = 4;

/**
 * Creates records one by one through the regular create endpoints (there is no bulk endpoint
 * yet), a few at a time. Invalid rows are skipped and reported, never sent.
 */
export async function importRows(
  target: ImportTarget,
  rows: MappedRow[],
  onProgress?: (done: number) => void,
): Promise<ImportResult> {
  const failed: RowIssue[] = [];
  let created = 0;
  let done = 0;
  let cursor = 0;

  const send = async (row: MappedRow): Promise<void> => {
    if (target === 'contacts') {
      const prepared = prepareContact(row);
      if (!prepared.ok) throw new Error(prepared.message);
      await createContact(prepared.body);
    } else {
      const prepared = prepareCompany(row);
      if (!prepared.ok) throw new Error(prepared.message);
      await createCompany(prepared.body);
    }
  };

  const worker = async () => {
    while (cursor < rows.length) {
      const index = cursor++;
      const row = rows[index];
      if (!row) continue;
      try {
        await send(row);
        created++;
      } catch (error) {
        failed.push({ row: index + 1, message: errorMessage(error) });
      }
      onProgress?.(++done);
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, rows.length) }, worker));
  failed.sort((a, b) => a.row - b.row);
  return { created, failed };
}
