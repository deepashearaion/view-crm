export const IMPORT_TARGETS = ['contacts', 'companies'] as const;
export type ImportTarget = (typeof IMPORT_TARGETS)[number];

export function isImportTarget(value: string | null): value is ImportTarget {
  return value === 'contacts' || value === 'companies';
}

export interface ImportField {
  key: string;
  label: string;
  required?: boolean;
  /** Header names that auto-map to this field (lower-case, spaces/underscores ignored). */
  aliases: string[];
}

export interface ParsedFile {
  name: string;
  headers: string[];
  rows: string[][];
}

/** field key → column index in the file (or null when not imported). */
export type ColumnMapping = Record<string, number | null>;

/** A mapped row: field key → raw text. */
export type MappedRow = Record<string, string>;

export interface RowIssue {
  /** 1-based row number in the file (excluding the header). */
  row: number;
  message: string;
}

export interface ImportResult {
  created: number;
  failed: RowIssue[];
}
