import { z } from 'zod';

import { LEAD_STATUSES, type ContactWriteDto } from '@/features/contacts';
import type { CompanyWriteDto } from '@/features/companies';

import { IMPORT_FIELDS } from '../constants';
import type { ColumnMapping, ImportTarget, MappedRow, ParsedFile, RowIssue } from '../types';

const normalise = (value: string) => value.toLowerCase().replace(/[\s_\-./]/g, '');

/** Maps file headers to fields by name, each column used at most once. */
export function autoMap(target: ImportTarget, headers: string[]): ColumnMapping {
  const used = new Set<number>();
  const mapping: ColumnMapping = {};
  for (const field of IMPORT_FIELDS[target]) {
    const index = headers.findIndex(
      (header, column) => !used.has(column) && field.aliases.includes(normalise(header)),
    );
    mapping[field.key] = index === -1 ? null : index;
    if (index !== -1) used.add(index);
  }
  return mapping;
}

export function mapRows(file: ParsedFile, mapping: ColumnMapping): MappedRow[] {
  return file.rows.map((cells) => {
    const row: MappedRow = {};
    for (const [key, column] of Object.entries(mapping)) {
      row[key] = column === null ? '' : (cells[column] ?? '').trim();
    }
    return row;
  });
}

/** Keeps the last 10 digits for Indian numbers written with +91 / 0 prefixes. */
function tenDigitMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return null;
}

const email = z.email();

function statusId(label: string): number | null {
  if (!label) return null;
  const key = normalise(label).replace(/s$/, '');
  const match = LEAD_STATUSES.find((status) => normalise(status.label).replace(/s$/, '') === key);
  return match?.id ?? null;
}

export type Prepared<T> = { ok: true; body: T } | { ok: false; message: string };

export function prepareContact(row: MappedRow): Prepared<ContactWriteDto> {
  let first = row.firstName ?? '';
  let last = row.lastName ?? '';
  if (!first && row.fullName) {
    const [head = '', ...rest] = row.fullName.split(/\s+/);
    first = head;
    last = last || rest.join(' ');
  }
  if (!first) return { ok: false, message: 'Missing name.' };
  const mobile = tenDigitMobile(row.mobile ?? '');
  if (!mobile)
    return { ok: false, message: `Mobile “${row.mobile ?? ''}” isn’t a 10-digit number.` };
  const alternate = row.alternateMobile ? tenDigitMobile(row.alternateMobile) : '';
  if (alternate === null)
    return { ok: false, message: 'Alternate mobile isn’t a 10-digit number.' };
  if (row.email && !email.safeParse(row.email).success) {
    return { ok: false, message: `Email “${row.email}” is invalid.` };
  }
  return {
    ok: true,
    body: {
      first_name: first,
      last_name: last,
      email: row.email ?? '',
      mobile: `+91 ${mobile}`,
      alternate_mobile: alternate ? `+91 ${alternate}` : '',
      lead_status_id: statusId(row.status ?? '') ?? 3,
      source: row.source ?? '',
      destination: row.destination ?? '',
      notes: row.notes ?? '',
    },
  };
}

export function prepareCompany(row: MappedRow): Prepared<CompanyWriteDto> {
  const name = row.name ?? '';
  if (!name) return { ok: false, message: 'Missing company name.' };
  if (row.email && !email.safeParse(row.email).success) {
    return { ok: false, message: `Email “${row.email}” is invalid.` };
  }
  const employees = row.employees ? Number.parseInt(row.employees.replace(/\D/g, ''), 10) : null;
  return {
    ok: true,
    body: {
      name,
      email: row.email ?? '',
      mobile: row.mobile ?? '',
      city: row.city ?? '',
      state: row.state ?? '',
      country: row.country || 'India',
      employees: employees === null || Number.isNaN(employees) ? null : employees,
      website: row.website ?? '',
      lead_source: row.leadSource ?? '',
      description: row.description ?? '',
    },
  };
}

/** Validates every row up front so the review step can show problems before importing. */
export function validateRows(target: ImportTarget, rows: MappedRow[]): RowIssue[] {
  const prepare = target === 'contacts' ? prepareContact : prepareCompany;
  return rows.flatMap((row, index) => {
    const result = prepare(row);
    return result.ok ? [] : [{ row: index + 1, message: result.message }];
  });
}
