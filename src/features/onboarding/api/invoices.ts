import { http, isHttpError } from '@/services';

import { INVOICE_PROBLEM_CODES } from '../constants';
import type {
  Invoice,
  InvoiceCreateDto,
  InvoiceDto,
  InvoiceFilters,
  InvoiceIncompleteErrors,
  InvoiceLine,
  InvoiceLineDto,
  InvoiceLineInputDto,
  InvoicePatchDto,
} from '../types';
import { compact } from './compact';

const INVOICES = '/api/v1/invoices';

const path = (id: string, suffix = '') => `${INVOICES}/${encodeURIComponent(id)}${suffix}`;
const idOrNull = (value: number | null) => (value === null ? null : String(value));

export function toInvoiceLine(dto: InvoiceLineDto): InvoiceLine {
  return {
    description: dto.description,
    quantity: dto.quantity,
    unitPricePaise: dto.unit_price_paise,
    sac: dto.sac,
    gstRateBp: dto.gst_rate_bp,
    taxablePaise: dto.taxable_paise,
    cgstPaise: dto.cgst_paise,
    sgstPaise: dto.sgst_paise,
    igstPaise: dto.igst_paise,
    totalPaise: dto.total_paise,
  };
}

/** Computed line → input DTO, for re-sending lines when editing a draft. */
export function toInvoiceLineInput(line: InvoiceLine): InvoiceLineInputDto {
  return {
    description: line.description,
    quantity: line.quantity,
    unit_price_paise: line.unitPricePaise,
    sac: line.sac,
    gst_rate_bp: line.gstRateBp,
  };
}

export function toInvoice(dto: InvoiceDto): Invoice {
  return {
    id: String(dto.id),
    status: dto.status,
    number: dto.number,
    financialYear: dto.financial_year,
    dealId: idOrNull(dto.deal_id),
    contactId: idOrNull(dto.contact_id),
    ownerId: idOrNull(dto.owner_id),
    billToName: dto.bill_to_name,
    billToAddress: dto.bill_to_address,
    billToGstin: dto.bill_to_gstin,
    billToEmail: dto.bill_to_email,
    billToPhone: dto.bill_to_phone,
    placeOfSupply: dto.place_of_supply,
    sellerName: dto.seller_name,
    sellerGstin: dto.seller_gstin,
    sellerStateCode: dto.seller_state_code,
    sellerAddress: dto.seller_address,
    pricesIncludeGst: dto.prices_include_gst,
    interState:
      Boolean(dto.place_of_supply) &&
      Boolean(dto.seller_state_code) &&
      dto.place_of_supply !== dto.seller_state_code,
    issueDate: dto.issue_date,
    dueDate: dto.due_date,
    notes: dto.notes,
    taxablePaise: dto.taxable_paise,
    cgstPaise: dto.cgst_paise,
    sgstPaise: dto.sgst_paise,
    igstPaise: dto.igst_paise,
    roundOffPaise: dto.round_off_paise,
    totalPaise: dto.total_paise,
    lines: (dto.lines ?? []).map(toInvoiceLine),
    issuedAt: dto.issued_at,
    sentAt: dto.sent_at,
    cancelledAt: dto.cancelled_at,
    cancelReason: dto.cancel_reason,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

type InvoiceResponse = { invoice: InvoiceDto };

/** GET /api/v1/invoices (offset paging). */
export async function fetchInvoices(
  filters: InvoiceFilters = {},
  signal?: AbortSignal,
): Promise<Invoice[]> {
  const response = await http.get<{ invoices: InvoiceDto[] | null }>(INVOICES, {
    query: {
      status: filters.status,
      contact_id: filters.contactId,
      deal_id: filters.dealId,
      limit: filters.limit,
      offset: filters.offset,
    },
    signal,
  });
  return (response.invoices ?? []).map(toInvoice);
}

const PAGE_SIZE = 200;
const MAX_INVOICES = 2000;

/** Every visible invoice matching `filters`, paged through client-side (tabs count locally). */
export async function fetchAllInvoices(
  filters: Omit<InvoiceFilters, 'limit' | 'offset'> = {},
  signal?: AbortSignal,
): Promise<Invoice[]> {
  const invoices: Invoice[] = [];
  for (let offset = 0; offset < MAX_INVOICES; offset += PAGE_SIZE) {
    const page = await fetchInvoices({ ...filters, limit: PAGE_SIZE, offset }, signal);
    invoices.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return invoices;
}

/** GET /api/v1/invoices/{id}. */
export async function fetchInvoice(id: string, signal?: AbortSignal): Promise<Invoice> {
  const response = await http.get<InvoiceResponse>(path(id), { signal });
  return toInvoice(response.invoice);
}

/** POST /api/v1/invoices → 201 draft. 409 deal_invoiced. */
export async function createInvoice(body: InvoiceCreateDto): Promise<Invoice> {
  const response = await http.post<InvoiceResponse>(INVOICES, compact(body));
  return toInvoice(response.invoice);
}

/** PATCH /api/v1/invoices/{id} (drafts only; 409 not_draft). `lines` replaces every line. */
export async function updateInvoice(id: string, body: InvoicePatchDto): Promise<Invoice> {
  const response = await http.patch<InvoiceResponse>(path(id), compact(body));
  return toInvoice(response.invoice);
}

/** DELETE /api/v1/invoices/{id} → 204 (drafts only). */
export async function deleteInvoice(id: string): Promise<void> {
  await http.delete(path(id));
}

/** POST /api/v1/invoices/{id}/issue: assigns the number and freezes it. 422 invoice_incomplete. */
export async function issueInvoice(id: string): Promise<Invoice> {
  const response = await http.post<InvoiceResponse>(path(id, '/issue'));
  return toInvoice(response.invoice);
}

/** POST /api/v1/invoices/{id}/send: emails the PDF to bill_to_email (422 on bill_to_email). */
export async function sendInvoice(id: string): Promise<Invoice> {
  const response = await http.post<InvoiceResponse>(path(id, '/send'));
  return toInvoice(response.invoice);
}

/** POST /api/v1/invoices/{id}/cancel (issued only; 409 not_issued). */
export async function cancelInvoice(id: string, reason: string): Promise<Invoice> {
  const response = await http.post<InvoiceResponse>(path(id, '/cancel'), { reason });
  return toInvoice(response.invoice);
}

/** GET /api/v1/invoices/{id}/pdf as a Blob (needs the bearer token, so no plain link). */
export function fetchInvoicePdf(id: string, signal?: AbortSignal): Promise<Blob> {
  return http.get<Blob>(path(id, '/pdf'), { signal });
}

const REVOKE_AFTER_MS = 60_000;

function revokeLater(url: string) {
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, REVOKE_AFTER_MS);
}

/** Saves the invoice PDF. `filename` defaults to the invoice number or id. */
export async function downloadInvoicePdf(id: string, filename?: string): Promise<void> {
  const url = URL.createObjectURL(await fetchInvoicePdf(id));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(filename ?? `invoice-${id}`).replace(/[\\/:*?"<>|]+/g, '-')}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  revokeLater(url);
}

/**
 * Opens the invoice PDF in a new tab. The tab is opened before the fetch so popup blockers
 * treat it as part of the click; if it is blocked anyway the PDF is downloaded instead.
 */
export async function openInvoicePdf(id: string): Promise<void> {
  const tab = window.open('', '_blank');
  try {
    const url = URL.createObjectURL(await fetchInvoicePdf(id));
    if (tab) tab.location.href = url;
    else window.open(url, '_blank', 'noopener');
    revokeLater(url);
  } catch (error) {
    tab?.close();
    throw error;
  }
}

/**
 * Splits a `422 invoice_incomplete` problem's `errors` into billing-profile fields (keys
 * starting with `billing_profile.`, prefix removed) and invoice fields. Undefined for any
 * other error.
 */
export function invoiceIncompleteErrors(error: unknown): InvoiceIncompleteErrors | undefined {
  if (!isHttpError(error) || error.code !== INVOICE_PROBLEM_CODES.incomplete) return undefined;
  const result: InvoiceIncompleteErrors = { billingProfile: [], invoice: [] };
  for (const [key, reason] of Object.entries(error.problem?.errors ?? {})) {
    if (key.startsWith('billing_profile.')) {
      result.billingProfile.push({ field: key.slice('billing_profile.'.length), reason });
    } else {
      result.invoice.push({ field: key, reason });
    }
  }
  return result;
}
