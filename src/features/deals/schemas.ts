import { z } from 'zod';

import { BILLING_PERIODS, BILLING_TYPES, STAGE_KINDS, STAGE_REQUIRED_FIELDS } from './constants';

export const dealFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Give the deal a name.')
      .max(120, 'Keep it under 120 characters.'),
    description: z.string().trim().max(2000, 'Keep it under 2,000 characters.'),
    /** Rupees as typed; empty means "not set". */
    amount: z
      .string()
      .trim()
      .refine((value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
        message: 'Enter a positive amount.',
      }),
    billingType: z.enum(BILLING_TYPES),
    billingPeriod: z.union([z.enum(BILLING_PERIODS), z.literal('')]),
    /** Only sent when creating; existing deals move with POST /deals/{id}/stage. */
    stageId: z.string(),
    ownerId: z.string(),
    contactId: z.string(),
    expectedClose: z.date().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.billingType === 'recurring' && values.billingPeriod === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['billingPeriod'],
        message: 'Choose how often it bills.',
      });
    }
  });

const stageRowSchema = z.object({
  /** Server id; empty for stages added in this dialog. */
  stageId: z.string(),
  name: z.string().trim().min(1, 'Stage name is required.').max(60, 'Keep it short.'),
  kind: z.enum(STAGE_KINDS),
  probability: z.string().refine((value) => /^\d+$/.test(value) && Number(value) <= 100, {
    message: '0–100',
  }),
  guidance: z.string().trim().max(1000, 'Keep it under 1,000 characters.'),
  requiredFields: z.array(z.enum(STAGE_REQUIRED_FIELDS)),
});

export const stageFormSchema = z.object({
  stages: z
    .array(stageRowSchema)
    .refine((stages) => STAGE_KINDS.every((kind) => stages.some((stage) => stage.kind === kind)), {
      message: 'Keep at least one open, one won and one lost stage.',
    })
    .refine(
      (stages) =>
        new Set(stages.map((stage) => stage.name.trim().toLowerCase())).size === stages.length,
      { message: 'Each stage needs a different name.' },
    ),
});

export const lostReasonSchema = z.object({
  lostReason: z
    .string()
    .trim()
    .min(1, 'Say why the deal was lost.')
    .max(500, 'Keep it under 500 characters.'),
});
