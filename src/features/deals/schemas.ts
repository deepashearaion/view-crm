import { z } from 'zod';

export const dealFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the deal a name.')
    .max(120, 'Keep it under 120 characters.'),
  value: z
    .string()
    .trim()
    .min(1, 'Enter the deal value.')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: 'Enter a positive amount.',
    }),
  stageId: z.string().min(1, 'Choose a stage.'),
  ownerId: z.string(),
  contactId: z.string(),
  companyId: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  expectedClose: z.date().optional(),
});

export const stageFormSchema = z.object({
  stages: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1, 'Stage name is required.'),
        kind: z.enum(['open', 'won', 'lost']),
        probability: z.string().refine((value) => /^\d+$/.test(value) && Number(value) <= 100, {
          message: '0–100',
        }),
        color: z.enum([
          'chart-1',
          'chart-2',
          'chart-3',
          'chart-4',
          'chart-5',
          'success',
          'destructive',
        ]),
      }),
    )
    .min(1, 'Keep at least one stage.')
    .refine((stages) => stages.some((stage) => stage.kind === 'open'), {
      message: 'Keep at least one open stage.',
    }),
});
