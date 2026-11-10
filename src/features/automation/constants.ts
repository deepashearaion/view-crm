import { API_URL, hasProblemCode } from '@/services';

import type { AssignmentCriterion, ScoringCriterion } from './types';

export const LEAD_SETTINGS_DEFAULTS = {
  hotThreshold: 70,
  warmThreshold: 40,
  hotFollowupMinutes: 15,
} as const;

export const LEAD_SOURCE_CHANNELS = [
  { value: 'web_form', label: 'Web form' },
  { value: 'api', label: 'API' },
] as const;

export const SCORING_CRITERIA = [
  { value: 'has_email', label: 'Has an email' },
  { value: 'has_mobile', label: 'Has a mobile number' },
  { value: 'has_company', label: 'Has a company' },
  { value: 'source_equals', label: 'Source is' },
  { value: 'destination_equals', label: 'Destination is' },
  { value: 'channel_used', label: 'Came in through channel' },
  { value: 'text_contains', label: 'Message contains' },
  { value: 'inbound_messages_at_least', label: 'Inbound messages at least' },
] as const;

export const ASSIGNMENT_CRITERIA = [
  { value: 'any', label: 'Any lead' },
  { value: 'source_equals', label: 'Source is' },
  { value: 'channel_equals', label: 'Channel is' },
  { value: 'destination_equals', label: 'Destination is' },
  { value: 'temperature_equals', label: 'Temperature is' },
] as const;

export const SCORING_CRITERION_LABELS = Object.fromEntries(
  SCORING_CRITERIA.map((item) => [item.value, item.label]),
) as Record<ScoringCriterion, string>;

export const ASSIGNMENT_CRITERION_LABELS = Object.fromEntries(
  ASSIGNMENT_CRITERIA.map((item) => [item.value, item.label]),
) as Record<AssignmentCriterion, string>;

/** Every criterion needs a `value` except the has_* ones and `any`. */
export function criterionNeedsValue(criterion: ScoringCriterion | AssignmentCriterion): boolean {
  return criterion !== 'any' && !criterion.startsWith('has_');
}

/** Contact channels, for channel_used / channel_equals values. */
export const CONTACT_CHANNEL_OPTIONS = [
  { value: 'web_form', label: 'Web form' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'manual', label: 'Manual' },
  { value: 'api', label: 'API' },
] as const;

export const TEMPERATURE_OPTIONS = [
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
] as const;

/** Fixed value choices for criteria whose value is an enum; other criteria take free text. */
export const CRITERION_VALUE_OPTIONS: Partial<
  Record<ScoringCriterion | AssignmentCriterion, readonly { value: string; label: string }[]>
> = {
  channel_used: CONTACT_CHANNEL_OPTIONS,
  channel_equals: CONTACT_CHANNEL_OPTIONS,
  temperature_equals: TEMPERATURE_OPTIONS,
};

/** Public (no auth) web-form endpoint for a lead source; the form posts here. */
export function formIntakeUrl(publicKey: string): string {
  return `${API_URL}/api/v1/intake/forms/${encodeURIComponent(publicKey)}`;
}

/** Display label of a rule value: the option label for enum criteria, else the raw value. */
export function criterionValueLabel(
  criterion: ScoringCriterion | AssignmentCriterion,
  value: string,
): string {
  const option = CRITERION_VALUE_OPTIONS[criterion]?.find((item) => item.value === value);
  return option?.label ?? value;
}

/** Fields the public intake endpoint accepts (`website` is a honeypot: leave it empty). */
export const INTAKE_FORM_FIELDS = [
  'first_name',
  'last_name',
  'name',
  'email',
  'mobile',
  'phone',
  'destination',
  'message',
] as const;

export type IntakeFormField = (typeof INTAKE_FORM_FIELDS)[number];

/** How each intake field renders in the generated HTML snippet; `false` = left out by default. */
const INTAKE_SNIPPET_INPUTS: Record<
  IntakeFormField,
  { label: string; type: 'text' | 'email' | 'tel' | 'textarea'; required?: boolean } | false
> = {
  first_name: false,
  last_name: false,
  name: { label: 'Your name', type: 'text', required: true },
  email: { label: 'Email', type: 'email' },
  mobile: { label: 'Mobile number', type: 'tel' },
  phone: false,
  destination: { label: 'Where would you like to go?', type: 'text' },
  message: { label: 'Message', type: 'textarea' },
};

/** Fields the snippet leaves out but the endpoint still accepts. */
export const INTAKE_OPTIONAL_FIELDS = INTAKE_FORM_FIELDS.filter(
  (field) => !INTAKE_SNIPPET_INPUTS[field],
);

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Ready-to-paste HTML form posting to a web-form source, with the `website` honeypot. */
export function intakeFormSnippet(publicKey: string): string {
  const inputs = INTAKE_FORM_FIELDS.flatMap((field) => {
    const input = INTAKE_SNIPPET_INPUTS[field];
    if (!input) return [];
    const required = input.required ? ' required' : '';
    const control =
      input.type === 'textarea'
        ? `<textarea name="${field}" rows="4"${required}></textarea>`
        : `<input type="${input.type}" name="${field}"${required}>`;
    return [`  <label>${input.label}<br>${control}</label>`];
  });
  return [
    `<form action="${escapeAttribute(formIntakeUrl(publicKey))}" method="POST">`,
    ...inputs,
    '  <!-- Spam trap: keep this field hidden and empty. -->',
    '  <input type="text" name="website" tabindex="-1" autocomplete="off" style="display:none">',
    '  <button type="submit">Send enquiry</button>',
    '</form>',
  ].join('\n');
}

export const AUTOMATION_PROBLEM_CODES = {
  /** 409: a source or rule with this name exists. */
  nameTaken: 'name_taken',
  /** 409: this WhatsApp phone number id is already connected. */
  phoneNumberTaken: 'phone_number_taken',
} as const;

export type AutomationProblemCode =
  (typeof AUTOMATION_PROBLEM_CODES)[keyof typeof AUTOMATION_PROBLEM_CODES];

export function automationProblemCode(error: unknown): AutomationProblemCode | undefined {
  return Object.values(AUTOMATION_PROBLEM_CODES).find((code) => hasProblemCode(error, code));
}

export const automationKeys = {
  all: ['automation'] as const,
  leadSettings: () => [...automationKeys.all, 'lead-settings'] as const,
  leadSources: () => [...automationKeys.all, 'lead-sources'] as const,
  whatsappAccounts: () => [...automationKeys.all, 'whatsapp-accounts'] as const,
  scoringRules: () => [...automationKeys.all, 'scoring-rules'] as const,
  assignmentRules: () => [...automationKeys.all, 'assignment-rules'] as const,
};
