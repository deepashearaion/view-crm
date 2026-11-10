import { hasProblemCode } from '@/services';

import type { NurtureEnrollmentFilters, NurtureTrigger } from './types';

export const NURTURE_TRIGGERS = [
  { value: 'manual', label: 'Manual enrollment' },
  { value: 'new_lead', label: 'New lead' },
  { value: 'deal_lost', label: 'Deal lost' },
  { value: 'deal_won', label: 'Deal won' },
] as const;

/** What enrolls contacts, shown under the trigger picker. */
export const TRIGGER_DESCRIPTIONS: Record<NurtureTrigger, string> = {
  manual: 'Contacts are enrolled by hand.',
  new_lead: 'Every new lead is enrolled automatically.',
  deal_lost: 'Contacts are enrolled automatically when their deal is lost.',
  deal_won: 'Contacts are enrolled automatically when their deal is won.',
};

export function triggerLabel(trigger: NurtureTrigger): string {
  return NURTURE_TRIGGERS.find((item) => item.value === trigger)?.label ?? trigger;
}

export const NURTURE_STEP_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const;

export const ENROLLMENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'stopped', label: 'Stopped' },
] as const;

/** Known `stop_reason` values. Anything else (e.g. "stopped by user") is shown as is. */
export const STOP_REASON_LABELS: Record<string, string> = {
  replied: 'Contact replied',
  hot: 'Lead became hot',
  won: 'Deal won',
  opted_out: 'Unsubscribed',
  customer: 'Became a customer',
  'stopped by user': 'Stopped by a user',
};

export function stopReasonLabel(reason: string): string {
  return STOP_REASON_LABELS[reason] ?? reason;
}

export const NURTURE_LIMITS = {
  maxSteps: 20,
  minDelayMinutes: 0,
  /** One year. */
  maxDelayMinutes: 525_600,
} as const;

/** Placeholders a step body may contain. */
export const NURTURE_PLACEHOLDERS = ['{{first_name}}', '{{last_name}}', '{{full_name}}'] as const;

/** Problem codes the nurture endpoints answer with. */
export const NURTURE_PROBLEM_CODES = {
  /** 409: another sequence already has this name. */
  nameTaken: 'name_taken',
  /** 409: only one active sequence per automatic trigger. */
  triggerTaken: 'trigger_taken',
  /** 409: the contact is already enrolled in this sequence. */
  alreadyEnrolled: 'already_enrolled',
  /** 400: the unsubscribe token is bad or expired. */
  invalidToken: 'invalid_token',
} as const;

export type NurtureProblemCode = (typeof NURTURE_PROBLEM_CODES)[keyof typeof NURTURE_PROBLEM_CODES];

/** The nurture-specific problem code carried by `error`, if any. */
export function nurtureProblemCode(error: unknown): NurtureProblemCode | undefined {
  return Object.values(NURTURE_PROBLEM_CODES).find((code) => hasProblemCode(error, code));
}

export const nurtureKeys = {
  all: ['nurture'] as const,
  sequences: () => [...nurtureKeys.all, 'sequences'] as const,
  sequenceList: () => [...nurtureKeys.sequences(), 'list'] as const,
  sequenceDetail: (id: string) => [...nurtureKeys.sequences(), 'detail', id] as const,
  enrollments: () => [...nurtureKeys.all, 'enrollments'] as const,
  enrollmentList: (filters: NurtureEnrollmentFilters = {}) =>
    [...nurtureKeys.enrollments(), 'list', filters] as const,
};
