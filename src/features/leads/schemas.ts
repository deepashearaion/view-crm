import { z } from 'zod';

const PHONE = /^\+?[\d\s()-]{7,20}$/;

/** Capture-lead dialog. POST /api/v1/leads needs first_name plus an email or a mobile. */
export const captureLeadSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim(),
    email: z.union([z.literal(''), z.email('Please enter a valid email address.')]),
    mobile: z
      .string()
      .trim()
      .refine((value) => value === '' || PHONE.test(value), {
        message: 'Enter a valid mobile number.',
      }),
    destination: z.string().trim(),
    source: z.string().trim(),
    channel: z.enum(['manual', 'phone', 'email', 'web_form', 'api']),
    message: z.string().trim().max(4000, 'Message can be at most 4000 characters.'),
    notes: z.string().trim().max(2000, 'Notes can be at most 2000 characters.'),
  })
  .refine((values) => values.email !== '' || values.mobile !== '', {
    message: 'Enter an email or a mobile number.',
    path: ['mobile'],
  });

export type CaptureLeadValues = z.input<typeof captureLeadSchema>;
export type CaptureLeadOutput = z.output<typeof captureLeadSchema>;
