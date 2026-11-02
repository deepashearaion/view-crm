import type { FilterFn } from '@tanstack/react-table';

function toKey(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : '';
}

/** Column filterFn for faceted filters: matches when the cell value is one of the selected values. */
export const facetFilterFn: FilterFn<unknown> = (row, columnId, filterValue: unknown) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return (filterValue as unknown[]).includes(toKey(row.getValue(columnId)));
};
