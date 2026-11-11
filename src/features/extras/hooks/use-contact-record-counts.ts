import { useMemo } from 'react';

import { callBelongsTo } from '../call-recordings/api/calls';
import { useCalls } from '../call-recordings/hooks/use-calls';
import { useFiles } from '../file-cabinet/hooks/use-files';
import type { ContactRef } from '../types';

/** How many files and calls a contact has, for tab labels. Undefined while loading. */
export function useContactRecordCounts(contact: ContactRef): {
  files: number | undefined;
  calls: number | undefined;
} {
  const { data: files } = useFiles();
  const { data: calls } = useCalls();
  return useMemo(
    () => ({
      files: files?.filter((file) => file.contactId === contact.id).length,
      calls: calls?.filter((call) => callBelongsTo(call, contact)).length,
    }),
    [files, calls, contact],
  );
}
