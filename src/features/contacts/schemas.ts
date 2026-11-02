import { z } from 'zod';

import {
  ADVANCE_STATUSES,
  ARRANGEMENT_OPTIONS,
  CONTACT_TYPES,
  CONTACTED_OPTIONS,
  INVOICE_SHARED_OPTIONS,
  POST_TRIP_OPTIONS,
  QUOTE_SHARED_OPTIONS,
  TICKET_OPTIONS,
  TRIP_ISSUE_OPTIONS,
  YES_NO,
} from './constants';

const optionalText = z.string().trim().optional();
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal('')]).optional();
const optionalAmount = z
  .string()
  .trim()
  .refine((value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
    message: 'Enter a positive amount.',
  })
  .optional();

const tenDigits = (label: string) =>
  z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((digits) => digits.length === 10, {
      message: `${label} must be exactly 10 digits.`,
    });

/** Travel-desk details (stored by the mock API only until the backend adds columns). */
export const contactTripSchema = z.object({
  type: optionalEnum(CONTACT_TYPES),
  contacted: optionalEnum(CONTACTED_OPTIONS),
  whatsappOptIn: optionalEnum(YES_NO),
  state: optionalText,
  address: optionalText,
  spokenLanguage: optionalText,
  travelDate: optionalText,
  travellers: optionalText,
  children: optionalText,
  totalAmount: optionalAmount,
  advanceAmount: optionalAmount,
  advanceStatus: optionalEnum(ADVANCE_STATUSES),
  invoiceShared: optionalEnum(INVOICE_SHARED_OPTIONS),
  quoteRequired: optionalEnum(YES_NO),
  quoteShared: optionalEnum(QUOTE_SHARED_OPTIONS),
  ticketsBooked: optionalEnum(TICKET_OPTIONS),
  arrangementsMade: optionalEnum(ARRANGEMENT_OPTIONS),
  postTrip: optionalEnum(POST_TRIP_OPTIONS),
  tripIssues: optionalEnum(TRIP_ISSUE_OPTIONS),
});

export const contactFormSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim(),
    email: z.union([z.literal(''), z.email('Please enter a valid email address.')]),
    countryCode: z.string().min(1),
    mobile: tenDigits('Mobile number'),
    alternateMobile: z
      .string()
      .trim()
      .transform((value) => value.replace(/\D/g, ''))
      .refine((digits) => digits === '' || digits.length === 10, {
        message: 'Alternate mobile must be exactly 10 digits.',
      }),
    companyId: z
      .string()
      .trim()
      .refine((value) => value === '' || /^\d+$/.test(value), {
        message: 'Company ID must be a number.',
      }),
    leadStatusId: z.string().min(1, 'Choose a lead status.'),
    leadOwnerId: z.string(),
    destination: z.string().trim(),
    source: z.string().trim(),
    notes: z.string().trim().max(2000, 'Notes can be at most 2000 characters.'),
    trip: contactTripSchema,
  })
  .refine(
    (values) =>
      !values.trip.advanceAmount ||
      !values.trip.totalAmount ||
      Number(values.trip.advanceAmount) <= Number(values.trip.totalAmount),
    { message: 'Advance cannot exceed the total amount.', path: ['trip', 'advanceAmount'] },
  );
