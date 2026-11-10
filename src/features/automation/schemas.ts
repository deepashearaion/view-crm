import { z } from 'zod';

import { USER_ROLES } from '@/features/auth';

import { ASSIGNMENT_CRITERIA, SCORING_CRITERIA, criterionNeedsValue } from './constants';

const name = (label = 'Name') =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(120, `${label} can be at most 120 characters.`);

/**
 * Whole number typed into an input. Stays a string (the shared form fields need input and
 * output types to match); convert with Number() when building the request.
 */
const wholeNumber = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => /^-?\d+$/.test(value), { message: `${label} must be a whole number.` })
    .refine((value) => Number(value) >= min && Number(value) <= max, {
      message: `${label} must be between ${String(min)} and ${String(max)}.`,
    });

// Lead settings

export const leadSettingsSchema = z
  .object({
    hotThreshold: wholeNumber('Hot threshold', 0, 100),
    warmThreshold: wholeNumber('Warm threshold', 0, 100),
    hotFollowupMinutes: wholeNumber('Follow-up time', 1, 10_080),
    /** '' = no default owner. */
    defaultOwnerId: z.string(),
  })
  .refine((values) => Number(values.warmThreshold) < Number(values.hotThreshold), {
    message: 'Warm threshold must be lower than the hot threshold.',
    path: ['warmThreshold'],
  });

export type LeadSettingsFormValues = z.input<typeof leadSettingsSchema>;
export type LeadSettingsFormOutput = z.output<typeof leadSettingsSchema>;

// Rule value (shared by scoring and assignment rules)

function checkValue(
  values: { criterion: Parameters<typeof criterionNeedsValue>[0]; value: string },
  ctx: z.RefinementCtx,
) {
  if (!criterionNeedsValue(values.criterion)) return;
  if (!values.value) {
    ctx.addIssue({ code: 'custom', message: 'Value is required.', path: ['value'] });
  } else if (values.criterion === 'inbound_messages_at_least' && !/^\d+$/.test(values.value)) {
    ctx.addIssue({ code: 'custom', message: 'Enter a whole number.', path: ['value'] });
  }
}

// Scoring rules

export const scoringRuleSchema = z
  .object({
    name: name(),
    criterion: z.enum(SCORING_CRITERIA.map((item) => item.value)),
    value: z.string().trim().max(200, 'Value can be at most 200 characters.'),
    points: wholeNumber('Points', -100, 100).refine((value) => Number(value) !== 0, {
      message: 'Points can’t be 0.',
    }),
    active: z.boolean(),
  })
  .superRefine(checkValue);

export type ScoringRuleFormValues = z.input<typeof scoringRuleSchema>;
export type ScoringRuleFormOutput = z.output<typeof scoringRuleSchema>;

// Assignment rules

export const assignmentRuleSchema = z
  .object({
    name: name(),
    criterion: z.enum(ASSIGNMENT_CRITERIA.map((item) => item.value)),
    value: z.string().trim().max(200, 'Value can be at most 200 characters.'),
    active: z.boolean(),
    userIds: z.array(z.string()).min(1, 'Pick at least one user.'),
  })
  .superRefine(checkValue);

export type AssignmentRuleFormValues = z.input<typeof assignmentRuleSchema>;
export type AssignmentRuleFormOutput = z.output<typeof assignmentRuleSchema>;

// Lead sources

export const leadSourceSchema = z.object({
  name: name(),
  channel: z.enum(['web_form', 'api']),
});

export type LeadSourceFormValues = z.infer<typeof leadSourceSchema>;

// WhatsApp accounts

export const whatsAppAccountSchema = z.object({
  phoneNumberId: z
    .string()
    .trim()
    .min(1, 'Phone number ID is required.')
    .regex(/^\d+$/, 'Use the numeric phone number ID from Meta.'),
  displayPhone: z
    .string()
    .trim()
    .min(1, 'Display number is required.')
    .max(32, 'Display number can be at most 32 characters.'),
  sourceName: name('Source name'),
});

export type WhatsAppAccountFormValues = z.infer<typeof whatsAppAccountSchema>;

// Team

export const inviteUserSchema = z.object({
  name: name(),
  email: z.string().trim().min(1, 'Email is required.').pipe(z.email('Enter a valid email.')),
  role: z.enum(USER_ROLES),
});

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>;
