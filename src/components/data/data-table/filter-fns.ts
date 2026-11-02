import type { Row } from '@tanstack/react-table';

function toKey(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : '';
}

/** Column filterFn for faceted filters: matches when the cell value is one of the selected values. */
export function facetFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown,
): boolean {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return (filterValue as unknown[]).includes(toKey(row.getValue(columnId)));
}
