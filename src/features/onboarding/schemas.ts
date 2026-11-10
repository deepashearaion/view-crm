import { z } from 'zod';

import { INVOICE_PREFIX_PATTERN } from './constants';

/** 15-character GSTIN: state code, PAN, entity number, 'Z', checksum. */
export const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const emailSchema = z.email();

const optionalGstin = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => value === '' || GSTIN_PATTERN.test(value), {
    message: 'Enter a valid 15-character GSTIN, e.g. 27ABCDE1234F1Z5.',
  });

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === '' || emailSchema.safeParse(value).success, {
    message: 'Enter a valid email address.',
  });

const optionalSac = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{4,8}$/.test(value), {
    message: 'SAC is 4–8 digits, e.g. 998555.',
  });

export const invoiceLineSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Description is required.')
    .max(500, 'Keep it under 500 characters.'),
  quantity: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value) && Number(value) > 0, {
      message: 'Enter a whole number above 0.',
    }),
  unitPrice: z
    .string()
    .trim()
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
      message: 'Enter a price in rupees, e.g. 1500 or 1500.50.',
    }),
  sac: optionalSac,
  gstRateBp: z.string().min(1, 'Pick a GST rate.'),
});

export const invoiceFormSchema = z.object({
  contactId: z.string(),
  dealId: z.string(),
  billToName: z.string().trim().max(200, 'Keep it under 200 characters.'),
  billToAddress: z.string().trim().max(1000, 'Keep it under 1000 characters.'),
  billToGstin: optionalGstin,
  billToEmail: optionalEmail,
  billToPhone: z.string().trim().max(30, 'Keep it under 30 characters.'),
  placeOfSupply: z.string(),
  pricesIncludeGst: z.boolean(),
  /** YYYY-MM-DD or empty. */
  dueDate: z.string(),
  notes: z.string().trim().max(2000, 'Keep it under 2000 characters.'),
  lines: z.array(invoiceLineSchema).max(100, 'An invoice can have at most 100 lines.'),
});

export const billingProfileFormSchema = z
  .object({
    legalName: z.string().trim().max(200, 'Keep it under 200 characters.'),
    gstin: optionalGstin,
    stateCode: z.string(),
    address: z.string().trim().max(1000, 'Keep it under 1000 characters.'),
    email: optionalEmail,
    phone: z.string().trim().max(30, 'Keep it under 30 characters.'),
    invoicePrefix: z
      .string()
      .trim()
      .toUpperCase()
      .refine((value) => INVOICE_PREFIX_PATTERN.test(value), {
        message: 'Use 1–5 letters or digits, e.g. INV.',
      }),
    defaultSac: optionalSac,
    defaultGstRateBp: z.string(),
    pricesIncludeGst: z.boolean(),
    paymentTermsDays: z
      .string()
      .trim()
      .refine((value) => /^\d+$/.test(value) && Number(value) <= 365, {
        message: 'Enter a number of days between 0 and 365.',
      }),
    bankDetails: z.string().trim().max(1000, 'Keep it under 1000 characters.'),
    terms: z.string().trim().max(2000, 'Keep it under 2000 characters.'),
  })
  .refine(
    (values) => !values.gstin || !values.stateCode || values.gstin.startsWith(values.stateCode),
    {
      message: 'The GSTIN’s first two digits must match the state code.',
      path: ['gstin'],
    },
  );

export const cancelInvoiceSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Give a short reason, e.g. “Raised in error”.')
    .max(500, 'Keep it under 500 characters.'),
});
