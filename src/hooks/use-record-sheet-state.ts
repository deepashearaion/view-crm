import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/** Open/close state for a record side sheet (view / edit / create). */
export type RecordSheetState =
  { mode: 'closed' } | { mode: 'create' } | { mode: 'view' | 'edit'; id: string };

interface Options {
  /** Search param holding the open record id, e.g. `contact` → ?contact=123. */
  param: string;
  /** Route that renders this page in create mode, e.g. /dashboard/contacts/new. */
  createOnMount: boolean;
  /** The list route to return to when leaving create mode. */
  listPath: string;
}

/**
 * Keeps sheet state in the URL so records are deep-linkable:
 * `?{param}=id` (view), `?{param}=id&mode=edit` (edit), `{listPath}/new` (create).
 */
export function useRecordSheetState({
  param,
  createOnMount,
  listPath,
}: Options): [RecordSheetState, (next: RecordSheetState) => void] {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get(param);

  const state: RecordSheetState = createOnMount
    ? { mode: 'create' }
    : id
      ? { mode: searchParams.get('mode') === 'edit' ? 'edit' : 'view', id }
      : { mode: 'closed' };

  const isOpen = state.mode !== 'closed';

  const setState = useCallback(
    (next: RecordSheetState) => {
      if (createOnMount && next.mode !== 'create') {
        void navigate(
          next.mode === 'closed' ? listPath : `${listPath}?${param}=${encodeURIComponent(next.id)}`,
          { replace: true },
        );
        return;
      }
      setSearchParams(
        (params) => {
          params.delete(param);
          params.delete('mode');
          if (next.mode === 'view' || next.mode === 'edit') params.set(param, next.id);
          if (next.mode === 'edit') params.set('mode', 'edit');
          return params;
        },
        // Opening adds a history entry (Back closes the sheet); switching modes replaces it.
        { replace: next.mode !== 'closed' && isOpen },
      );
    },
    [createOnMount, isOpen, listPath, navigate, param, setSearchParams],
  );

  return [state, setState];
}
