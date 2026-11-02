import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { AlertTriangle, SearchX } from 'lucide-react';
import { useMemo, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';

import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { cn } from '@/lib/utils';

import { DataTablePagination } from './pagination';
import { DataTableViewOptions } from './view-options';

interface TablePrefs {
  visibility: VisibilityState;
  pageSize: number;
}

function isTablePrefs(value: unknown): value is TablePrefs {
  return (
    typeof value === 'object' &&
    value !== null &&
    'visibility' in value &&
    typeof value.visibility === 'object' &&
    'pageSize' in value &&
    typeof value.pageSize === 'number'
  );
}

const INTERACTIVE = 'button, a, input, select, textarea, [role="checkbox"], [role="menuitem"]';

export interface DataTableProps<TData> {
  /** Column definitions. Give hideable columns `meta.label`. */
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  /** Persists column visibility and page size under this key. */
  storageKey: string;
  defaultHidden?: string[];
  initialSorting?: SortingState;
  /** Free-text search across all filterable columns (controlled by the page). */
  globalFilter?: string;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Rendered left of the column menu; receives the table for faceted filters. */
  toolbar?: (table: TanstackTable<TData>) => ReactNode;
  /** Enables row checkboxes; shown when at least one row is selected. */
  bulkActions?: (rows: TData[], clearSelection: () => void) => ReactNode;
  onRowClick?: (row: TData) => void;
  emptyState?: ReactNode;
  pageSizeOptions?: readonly number[];
  /** Accessible name for the table. */
  label: string;
}

function selectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: '__select',
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-10' },
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows on this page"
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(value === true);
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(value === true);
        }}
      />
    ),
  };
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  storageKey,
  defaultHidden = [],
  initialSorting = [],
  globalFilter,
  isLoading = false,
  error,
  onRetry,
  toolbar,
  bulkActions,
  onRowClick,
  emptyState,
  pageSizeOptions = [10, 25, 50, 100],
  label,
}: DataTableProps<TData>) {
  const defaultPrefs = useMemo<TablePrefs>(
    () => ({
      visibility: Object.fromEntries(defaultHidden.map((id) => [id, false])),
      pageSize: pageSizeOptions[0] ?? 10,
    }),
    [defaultHidden, pageSizeOptions],
  );
  const [prefs, setPrefs] = usePersistedState(`table:${storageKey}`, defaultPrefs, isTablePrefs);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pageIndex, setPageIndex] = useState(0);

  const allColumns = useMemo(
    () => (bulkActions ? [selectionColumn<TData>(), ...columns] : columns),
    [bulkActions, columns],
  );

  // TanStack Table returns non-memoizable functions by design; the React Compiler lint rule
  // flags this hook, but the table instance is only used during render here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility: prefs.visibility,
      pagination: { pageIndex, pageSize: prefs.pageSize },
    },
    enableRowSelection: Boolean(bulkActions),
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      setPageIndex(0);
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: (updater) => {
      setPrefs((current) => ({
        ...current,
        visibility: typeof updater === 'function' ? updater(current.visibility) : updater,
      }));
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater({ pageIndex, pageSize: prefs.pageSize }) : updater;
      setPageIndex(next.pageIndex);
      if (next.pageSize !== prefs.pageSize) {
        setPrefs((current) => ({ ...current, pageSize: next.pageSize }));
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Keep the current page in range when filtering/searching shrinks the result set.
  const pageCount = table.getPageCount();
  if (pageIndex > 0 && pageIndex >= pageCount) setPageIndex(Math.max(0, pageCount - 1));

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>, row: Row<TData>) => {
    if (!onRowClick) return;
    if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
    onRowClick(row.original);
  };

  const handleRowKey = (event: KeyboardEvent<HTMLTableRowElement>, row: Row<TData>) => {
    if (onRowClick && event.target === event.currentTarget && event.key === 'Enter') {
      onRowClick(row.original);
    }
  };

  const isFiltered = Boolean(globalFilter) || columnFilters.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {toolbar?.(table)}
          {columnFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                table.resetColumnFilters();
              }}
            >
              Reset filters
            </Button>
          )}
        </div>
        <DataTableViewOptions
          table={table}
          onReset={() => {
            setPrefs((current) => ({ ...current, visibility: defaultPrefs.visibility }));
          }}
        />
      </div>

      {bulkActions && selectedRows.length > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="flex animate-in flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm fade-in-0 slide-in-from-top-1"
        >
          <span className="font-medium">{selectedRows.length} selected</span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {bulkActions(selectedRows, () => {
              table.resetRowSelection();
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetRowSelection();
            }}
          >
            Clear selection
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table aria-label={label} aria-busy={isLoading}>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn('h-10 text-xs', header.column.columnDef.meta?.className)}
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  {Array.from({ length: visibleColumnCount }, (__, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={visibleColumnCount} className="p-6">
                  <EmptyState
                    icon={AlertTriangle}
                    title="Couldn’t load data"
                    description={error instanceof Error ? error.message : 'Please try again.'}
                    className="border-none"
                    actions={
                      onRetry && (
                        <Button variant="outline" onClick={onRetry}>
                          Try again
                        </Button>
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={visibleColumnCount} className="p-6">
                  {isFiltered || !emptyState ? (
                    <EmptyState
                      icon={SearchX}
                      title="No matching results"
                      description="Try a different search or clear the filters."
                      className="border-none"
                    />
                  ) : (
                    emptyState
                  )}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn(
                    onRowClick &&
                      'cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                  )}
                  onClick={(event) => {
                    handleRowClick(event, row);
                  }}
                  onKeyDown={(event) => {
                    handleRowKey(event, row);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  );
}
