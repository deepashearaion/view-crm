import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // Type parameters must match the library's declaration to merge.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Human-readable name used by column visibility and headers. */
    label?: string;
    /** Extra classes for header and body cells (e.g. width, alignment). */
    className?: string;
  }
}
