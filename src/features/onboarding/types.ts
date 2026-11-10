import type { z } from 'zod';

import type { INVOICE_STATUSES } from './constants';
import type { billingProfileFormSchema, invoiceFormSchema, invoiceLineSchema } from './schemas';

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]['value'];

export interface BillingProfileDto {
  legal_name: string;
  gstin: string;
  /** Two-digit GST state code, e.g. '27'. */
  state_code: string;
  address: string;
  email: string;
  phone: string;
  /** 1–5 of A–Z and 0–9; defaults to 'INV'. */
  invoice_prefix: string;
  default_sac: string;
  /** Basis points; 1800 by default. */
  default_gst_rate_bp: number;
  prices_include_gst: boolean;
  /** 7 by default. */
  payment_terms_days: number;
  bank_details: string;
  terms: string;
  updated_at: string;
}

/** PUT /api/v1/billing-profile body: any of the profile fields. */
export type BillingProfileWriteDto = Partial<Omit<BillingProfileDto, 'updated_at'>>;

export interface BillingProfile {
  legalName: string;
  gstin: string;
  stateCode: string;
  address: string;
  email: string;
  phone: string;
  invoicePrefix: string;
  defaultSac: string;
  defaultGstRateBp: number;
  pricesIncludeGst: boolean;
  paymentTermsDays: number;
  bankDetails: string;
  terms: string;
  updatedAt: string;
}

/** An invoice line as sent to the API. Missing sac / gst_rate_bp fall back to the profile defaults. */
export interface InvoiceLineInputDto {
  description: string;
  quantity: number;
  unit_price_paise: number;
  sac?: string;
  gst_rate_bp?: number;
}

/** An invoice line as returned, with the computed amounts. */
export interface InvoiceLineDto extends Required<InvoiceLineInputDto> {
  taxable_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  total_paise: number;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPricePaise: number;
  sac: string;
  gstRateBp: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

export interface InvoiceDto {
  id: number;
  status: InvoiceStatus;
  /** e.g. INV/26-27/0001; null until issued. */
  number: string | null;
  financial_year: string | null;
  deal_id: number | null;
  contact_id: number | null;
  owner_id: number | null;
  bill_to_name: string;
  bill_to_address: string;
  bill_to_gstin: string;
  bill_to_email: string;
  bill_to_phone: string;
  /** State code; same state as seller → CGST+SGST, else IGST. */
  place_of_supply: string;
  seller_name: string;
  seller_gstin: string;
  seller_state_code: string;
  seller_address: string;
  prices_include_gst: boolean;
  issue_date: string | null;
  due_date: string | null;
  notes: string;
  taxable_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  round_off_paise: number;
  total_paise: number;
  lines: InvoiceLineDto[] | null;
  issued_at: string | null;
  sent_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string;
  created_at: string;
  updated_at: string;
}

/** POST /api/v1/invoices body (creates a draft). */
export interface InvoiceCreateDto {
  deal_id?: number;
  contact_id?: number;
  bill_to_name?: string;
  bill_to_address?: string;
  bill_to_gstin?: string;
  bill_to_email?: string;
  bill_to_phone?: string;
  place_of_supply?: string;
  prices_include_gst?: boolean;
  /** YYYY-MM-DD. */
  due_date?: string;
  notes?: string;
  lines?: InvoiceLineInputDto[];
}

/** PATCH /api/v1/invoices/{id} body (drafts only); `lines` replaces every line. */
export type InvoicePatchDto = Omit<InvoiceCreateDto, 'deal_id' | 'contact_id'>;

export interface Invoice {
  id: string;
  status: InvoiceStatus;
  number: string | null;
  financialYear: string | null;
  dealId: string | null;
  contactId: string | null;
  ownerId: string | null;
  billToName: string;
  billToAddress: string;
  billToGstin: string;
  billToEmail: string;
  billToPhone: string;
  placeOfSupply: string;
  sellerName: string;
  sellerGstin: string;
  sellerStateCode: string;
  sellerAddress: string;
  pricesIncludeGst: boolean;
  /** True when place of supply differs from the seller's state (IGST instead of CGST+SGST). */
  interState: boolean;
  issueDate: string | null;
  dueDate: string | null;
  notes: string;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  roundOffPaise: number;
  totalPaise: number;
  lines: InvoiceLine[];
  issuedAt: string | null;
  sentAt: string | null;
  cancelledAt: string | null;
  cancelReason: string;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/v1/invoices filters (offset paging). */
export interface InvoiceFilters {
  status?: InvoiceStatus;
  contactId?: string;
  dealId?: string;
  limit?: number;
  offset?: number;
}

/** One missing field from a `422 invoice_incomplete` problem. */
export interface IncompleteField {
  /** Field name without the `billing_profile.` prefix, e.g. `gstin` or `lines[0].sac`. */
  field: string;
  /** `required`, `invalid`, … */
  reason: string;
}

export interface InvoiceIncompleteErrors {
  billingProfile: IncompleteField[];
  invoice: IncompleteField[];
}

export type InvoiceFormValues = z.input<typeof invoiceFormSchema>;
export type InvoiceFormOutput = z.output<typeof invoiceFormSchema>;
export type InvoiceLineFormValues = z.input<typeof invoiceLineSchema>;
export type BillingProfileFormValues = z.input<typeof billingProfileFormSchema>;
export type BillingProfileFormOutput = z.output<typeof billingProfileFormSchema>;
