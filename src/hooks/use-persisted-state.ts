import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

function read<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate) return validate(parsed) ? parsed : fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * useState persisted to localStorage under `key` (UI preferences only, e.g. column
 * visibility). Pass `validate` when stale stored shapes must be rejected.
 */
export function usePersistedState<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => read(key, fallback, validate));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or unavailable; preference simply isn't persisted.
    }
  }, [key, state]);

  const set = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    setState(value);
  }, []);

  return [state, set];
}
