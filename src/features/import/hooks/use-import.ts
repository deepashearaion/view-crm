import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { companyKeys } from '@/features/companies';
import { contactKeys } from '@/features/contacts';

import { importRows } from '../api/import';
import type { ImportTarget, MappedRow } from '../types';

export function useImport() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const mutation = useMutation({
    mutationFn: ({ target, rows }: { target: ImportTarget; rows: MappedRow[] }) => {
      setProgress(0);
      return importRows(target, rows, setProgress);
    },
    onSettled: (_result, _error, { target }) =>
      queryClient.invalidateQueries({
        queryKey: target === 'contacts' ? contactKeys.all : companyKeys.all,
      }),
  });
  return { ...mutation, progress };
}
