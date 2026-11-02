import type { SelectOption } from './form-select';

/** Builds SelectOptions from a readonly string list. */
export const optionsFrom = (values: readonly string[]): SelectOption[] =>
  values.map((value) => ({ value, label: value }));
