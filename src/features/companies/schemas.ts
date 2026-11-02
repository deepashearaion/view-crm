import { z } from 'zod';

import { COMPANY_STATUSES, CUSTOM_FIELD_TYPES } from './constants';

const statusValues = COMPANY_STATUSES.map((status) => status.value) as [
  (typeof COMPANY_STATUSES)[number]['value'],
  ...(typeof COMPANY_STATUSES)[number]['value'][],
];

const optionalUrl = z.union([z.literal(''), z.url('Enter a full URL, e.g. https://…')]);

const optionalCount = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d+$/.test(value), { message: 'Enter a whole number.' });

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, 'Company name is required.'),
  email: z.union([z.literal(''), z.email('Please enter a valid email address.')]),
  mobile: z
    .string()
    .trim()
    .refine((value) => value === '' || value.replace(/\D/g, '').length >= 7, {
      message: 'Enter a valid phone number.',
    }),
  status: z.enum(statusValues),
  ownerId: z.string(),
  employees: optionalCount,
  annualRevenue: optionalCount,
  city: z.string().trim(),
  state: z.string().trim(),
  country: z.string().trim(),
  zipcode: z.string().trim(),
  address: z.string().trim(),
  description: z.string().trim().max(2000, 'Description can be at most 2000 characters.'),
  leadSource: z.string(),
  website: optionalUrl,
  linkedin: optionalUrl,
  instagram: optionalUrl,
  facebook: optionalUrl,
  twitter: optionalUrl,
  emailOptOut: z.boolean(),
  smsOptOut: z.boolean(),
  customFields: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

export const customFieldSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Field name is required.')
    .max(40, 'Keep it under 40 characters.'),
  type: z.enum(CUSTOM_FIELD_TYPES.map((type) => type.value) as ['text', 'number', 'checkbox']),
});
