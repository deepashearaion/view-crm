import { paiseToRupees, rupeesToPaise, toIstDate } from '@/lib/format';

import { BILLING_PROFILE_DEFAULTS } from '../constants';
import type {
  BillingProfile,
  BillingProfileFormOutput,
  BillingProfileFormValues,
  BillingProfileWriteDto,
  Invoice,
  InvoiceCreateDto,
  InvoiceFormOutput,
  InvoiceFormValues,
  InvoiceLineFormValues,
  InvoiceLineInputDto,
  InvoicePatchDto,
} from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Rupee amount as a form string without trailing zeros: 1500 → "1500", 1500.5 → "1500.5". */
export function rupeesInput(paise: number): string {
  return String(paiseToRupees(paise));
}

/** A blank line using the billing profile's default SAC and GST rate. */
export function emptyLine(profile?: BillingProfile): InvoiceLineFormValues {
  return {
    description: '',
    quantity: '1',
    unitPrice: '',
    sac: profile?.defaultSac ?? '',
    gstRateBp: String(profile?.defaultGstRateBp ?? BILLING_PROFILE_DEFAULTS.defaultGstRateBp),
  };
}

/** Form values for a draft, or defaults for a new invoice from the billing profile. */
export function invoiceToFormValues(
  invoice?: Invoice,
  profile?: BillingProfile,
): InvoiceFormValues {
  if (invoice) {
    return {
      contactId: invoice.contactId ?? '',
      dealId: invoice.dealId ?? '',
      billToName: invoice.billToName,
      billToAddress: invoice.billToAddress,
      billToGstin: invoice.billToGstin,
      billToEmail: invoice.billToEmail,
      billToPhone: invoice.billToPhone,
      placeOfSupply: invoice.placeOfSupply,
      pricesIncludeGst: invoice.pricesIncludeGst,
      dueDate: invoice.dueDate ?? '',
      notes: invoice.notes,
      lines: invoice.lines.map((line) => ({
        description: line.description,
        quantity: String(line.quantity),
        unitPrice: rupeesInput(line.unitPricePaise),
        sac: line.sac,
        gstRateBp: String(line.gstRateBp),
      })),
    };
  }
  const terms = profile?.paymentTermsDays ?? BILLING_PROFILE_DEFAULTS.paymentTermsDays;
  return {
    contactId: '',
    dealId: '',
    billToName: '',
    billToAddress: '',
    billToGstin: '',
    billToEmail: '',
    billToPhone: '',
    placeOfSupply: '',
    pricesIncludeGst: profile?.pricesIncludeGst ?? false,
    dueDate: toIstDate(new Date(Date.now() + terms * DAY_MS)),
    notes: '',
    lines: [emptyLine(profile)],
  };
}

function lineToDto(line: InvoiceFormOutput['lines'][number]): InvoiceLineInputDto {
  return {
    description: line.description,
    quantity: Number(line.quantity),
    unit_price_paise: rupeesToPaise(Number(line.unitPrice)),
    sac: line.sac || undefined,
    gst_rate_bp: Number(line.gstRateBp),
  };
}

/** PATCH body: every editable field (empty strings clear text); `lines` replaces all lines. */
export function formValuesToPatchDto(values: InvoiceFormOutput): InvoicePatchDto {
  return {
    bill_to_name: values.billToName,
    bill_to_address: values.billToAddress,
    bill_to_gstin: values.billToGstin,
    bill_to_email: values.billToEmail,
    bill_to_phone: values.billToPhone,
    place_of_supply: values.placeOfSupply || undefined,
    prices_include_gst: values.pricesIncludeGst,
    // The API has no clear flag for due_date; an empty date keeps the saved one.
    due_date: values.dueDate || undefined,
    notes: values.notes,
    lines: values.lines.map(lineToDto),
  };
}

export function formValuesToCreateDto(values: InvoiceFormOutput): InvoiceCreateDto {
  return {
    ...formValuesToPatchDto(values),
    contact_id: values.contactId ? Number(values.contactId) : undefined,
    deal_id: values.dealId ? Number(values.dealId) : undefined,
  };
}

// ---- GST estimate ----

export interface LineEstimate {
  taxablePaise: number;
  taxPaise: number;
  totalPaise: number;
}

export interface InvoiceEstimate {
  lines: LineEstimate[];
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  roundOffPaise: number;
  totalPaise: number;
}

const toNumber = (value: string) => {
  const number = Number(value.trim());
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

/**
 * Client-side estimate of an invoice's GST. The server computes the real figures (its
 * rounding may differ by a paisa or two), so the UI labels this as an estimate.
 */
export function estimateInvoice(
  lines: readonly InvoiceLineFormValues[],
  { pricesIncludeGst, interState }: { pricesIncludeGst: boolean; interState: boolean },
): InvoiceEstimate {
  const result: InvoiceEstimate = {
    lines: [],
    taxablePaise: 0,
    cgstPaise: 0,
    sgstPaise: 0,
    igstPaise: 0,
    roundOffPaise: 0,
    totalPaise: 0,
  };
  for (const line of lines) {
    const amount = Math.round(toNumber(line.quantity) * rupeesToPaise(toNumber(line.unitPrice)));
    const rate = toNumber(line.gstRateBp);
    const taxable = pricesIncludeGst ? Math.round((amount * 10000) / (10000 + rate)) : amount;
    const tax = pricesIncludeGst ? amount - taxable : Math.round((taxable * rate) / 10000);
    result.lines.push({ taxablePaise: taxable, taxPaise: tax, totalPaise: taxable + tax });
    result.taxablePaise += taxable;
    if (interState) {
      result.igstPaise += tax;
    } else {
      const half = Math.floor(tax / 2);
      result.cgstPaise += half;
      result.sgstPaise += tax - half;
    }
  }
  const exact = result.taxablePaise + result.cgstPaise + result.sgstPaise + result.igstPaise;
  result.totalPaise = Math.round(exact / 100) * 100;
  result.roundOffPaise = result.totalPaise - exact;
  return result;
}

// ---- Billing profile ----

export function billingProfileToFormValues(profile?: BillingProfile): BillingProfileFormValues {
  return {
    legalName: profile?.legalName ?? '',
    gstin: profile?.gstin ?? '',
    stateCode: profile?.stateCode ?? '',
    address: profile?.address ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    invoicePrefix: profile?.invoicePrefix || BILLING_PROFILE_DEFAULTS.invoicePrefix,
    defaultSac: profile?.defaultSac ?? '',
    defaultGstRateBp: String(
      profile?.defaultGstRateBp ?? BILLING_PROFILE_DEFAULTS.defaultGstRateBp,
    ),
    pricesIncludeGst: profile?.pricesIncludeGst ?? false,
    paymentTermsDays: String(
      profile?.paymentTermsDays ?? BILLING_PROFILE_DEFAULTS.paymentTermsDays,
    ),
    bankDetails: profile?.bankDetails ?? '',
    terms: profile?.terms ?? '',
  };
}

export function billingProfileFormToDto(values: BillingProfileFormOutput): BillingProfileWriteDto {
  return {
    legal_name: values.legalName,
    gstin: values.gstin,
    state_code: values.stateCode || undefined,
    address: values.address,
    email: values.email,
    phone: values.phone,
    invoice_prefix: values.invoicePrefix,
    default_sac: values.defaultSac,
    default_gst_rate_bp: Number(values.defaultGstRateBp),
    prices_include_gst: values.pricesIncludeGst,
    payment_terms_days: Number(values.paymentTermsDays),
    bank_details: values.bankDetails,
    terms: values.terms,
  };
}

/** API field → billing profile form field. */
export const BILLING_PROFILE_FIELD_MAP: Record<string, keyof BillingProfileFormValues> = {
  legal_name: 'legalName',
  gstin: 'gstin',
  state_code: 'stateCode',
  address: 'address',
  email: 'email',
  phone: 'phone',
  invoice_prefix: 'invoicePrefix',
  default_sac: 'defaultSac',
  default_gst_rate_bp: 'defaultGstRateBp',
  prices_include_gst: 'pricesIncludeGst',
  payment_terms_days: 'paymentTermsDays',
  bank_details: 'bankDetails',
  terms: 'terms',
};

const INVOICE_FIELD_MAP: Record<string, string> = {
  contact_id: 'contactId',
  deal_id: 'dealId',
  bill_to_name: 'billToName',
  bill_to_address: 'billToAddress',
  bill_to_gstin: 'billToGstin',
  bill_to_email: 'billToEmail',
  bill_to_phone: 'billToPhone',
  place_of_supply: 'placeOfSupply',
  prices_include_gst: 'pricesIncludeGst',
  due_date: 'dueDate',
  notes: 'notes',
  lines: 'lines',
};

const LINE_FIELD_MAP: Record<string, string> = {
  description: 'description',
  quantity: 'quantity',
  unit_price_paise: 'unitPrice',
  sac: 'sac',
  gst_rate_bp: 'gstRateBp',
};

/** `bill_to_name` → `billToName`, `lines[0].sac` → `lines.0.sac`; undefined if unknown. */
export function invoiceFormField(apiField: string): string | undefined {
  const line = /^lines\[(\d+)]\.(.+)$/.exec(apiField);
  if (line?.[1] && line[2]) {
    const field = LINE_FIELD_MAP[line[2]];
    return field ? `lines.${line[1]}.${field}` : undefined;
  }
  return INVOICE_FIELD_MAP[apiField];
}
