import { paths } from '@/routes/paths';

import type { InvoiceFilters } from './types';

export const INVOICE_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const BILLING_PROFILE_DEFAULTS = {
  invoicePrefix: 'INV',
  defaultGstRateBp: 1800,
  paymentTermsDays: 7,
} as const;

/** 1–5 of A–Z and 0–9. */
export const INVOICE_PREFIX_PATTERN = /^[A-Z0-9]{1,5}$/;

/** GST slabs in basis points. */
export const GST_RATES_BP = [0, 500, 1200, 1800, 2800] as const;

/** Indian GST state codes for place_of_supply / state_code selects. */
export const GST_STATES = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' },
] as const;

const STATE_NAMES = new Map<string, string>(GST_STATES.map((state) => [state.code, state.name]));

/** '27' → 'Maharashtra'; unknown codes come back unchanged. */
export function gstStateName(code: string): string {
  return STATE_NAMES.get(code) ?? code;
}

/** Problem codes the invoice endpoints answer with. */
export const INVOICE_PROBLEM_CODES = {
  /** 422: issuing needs more data; see `invoiceIncompleteErrors`. */
  incomplete: 'invoice_incomplete',
  /** 409: the deal already has an invoice. */
  dealInvoiced: 'deal_invoiced',
  /** 409: only drafts can be edited, deleted or issued. */
  notDraft: 'not_draft',
  /** 409: only issued invoices can be sent or cancelled. */
  notIssued: 'not_issued',
} as const;

/** Labels for fields that a `422 invoice_incomplete` can name. */
export const INCOMPLETE_FIELD_LABELS: Record<string, string> = {
  legal_name: 'Legal name',
  gstin: 'GSTIN',
  state_code: 'State',
  address: 'Address',
  bill_to_name: 'Bill-to name',
  bill_to_email: 'Bill-to email',
  place_of_supply: 'Place of supply',
  lines: 'At least one line',
  sac: 'SAC code',
};

/** `lines[1].sac` → "Line 2: SAC code"; `gstin` → "GSTIN". */
export function incompleteFieldLabel(field: string): string {
  const line = /^lines\[(\d+)]\.(.+)$/.exec(field);
  if (line?.[1] && line[2]) {
    return `Line ${Number(line[1]) + 1}: ${INCOMPLETE_FIELD_LABELS[line[2]] ?? line[2]}`;
  }
  return INCOMPLETE_FIELD_LABELS[field] ?? field;
}

export const billingProfileKeys = {
  all: ['billing-profile'] as const,
};

export const invoiceKeys = {
  /** Invalidated by the deals feature after a deal is won. */
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: InvoiceFilters = {}) => [...invoiceKeys.lists(), filters] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
};

/** App URLs for this feature (all under /dashboard). */
export const invoicePaths = {
  list: paths.invoices,
  create: `${paths.invoices}/new`,
  settings: `${paths.invoices}/settings`,
  detail: (id: string) => `${paths.invoices}/${encodeURIComponent(id)}`,
  /** Opens a draft with the fields a `422 invoice_incomplete` named highlighted. */
  fix: (id: string, fields: string[]) =>
    `${paths.invoices}/${encodeURIComponent(id)}?fix=${encodeURIComponent(fields.join(','))}`,
  fixProfile: (fields: string[]) =>
    `${paths.invoices}/settings?fix=${encodeURIComponent(fields.join(','))}`,
  /** New invoice prefilled from a deal. */
  createForDeal: (dealId: string) => `${paths.invoices}/new?deal=${encodeURIComponent(dealId)}`,
};
