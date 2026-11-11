import type { ENROLLMENT_STATUSES, NURTURE_STEP_CHANNELS, NURTURE_TRIGGERS } from './constants';

export type NurtureTrigger = (typeof NURTURE_TRIGGERS)[number]['value'];
export type NurtureStepChannel = (typeof NURTURE_STEP_CHANNELS)[number]['value'];
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number]['value'];

export interface NurtureStepDto {
  /** Wait after the previous step (0–525600). */
  delay_minutes: number;
  channel: NurtureStepChannel;
  /** Email only. */
  subject: string;
  /** Supports {{first_name}}, {{last_name}} and {{full_name}}. */
  body: string;
  whatsapp_template: string;
  whatsapp_language: string;
  whatsapp_template_params: string[] | null;
}

export interface NurtureSequenceDto {
  id: number;
  name: string;
  trigger: NurtureTrigger;
  active: boolean;
  stop_on_reply: boolean;
  steps: NurtureStepDto[] | null;
  active_enrollments: number;
  created_at: string;
  updated_at: string;
}

export interface NurtureEnrollmentDto {
  id: number;
  sequence_id: number;
  sequence_name: string;
  contact_id: number;
  status: EnrollmentStatus;
  /** replied, hot, won, opted_out, customer, or "stopped by user". */
  stop_reason: string;
  next_step: number;
  next_run_at: string;
  attempts: number;
  last_error: string;
  enrolled_by_id: number | null;
  enrolled_at: string;
  finished_at: string | null;
}

/** A step as sent to the API; channel-specific fields may be left out. */
export interface NurtureStepWriteDto {
  delay_minutes: number;
  channel: NurtureStepChannel;
  subject?: string;
  body?: string;
  whatsapp_template?: string;
  whatsapp_language?: string;
  whatsapp_template_params?: string[];
}

/** POST /api/v1/nurture-sequences body. */
export interface NurtureSequenceCreateDto {
  name: string;
  trigger: NurtureTrigger;
  active?: boolean;
  stop_on_reply?: boolean;
  steps: NurtureStepWriteDto[];
}

/** PATCH /api/v1/nurture-sequences/{id} body; `steps` replaces the whole list. */
export type NurtureSequencePatchDto = Partial<NurtureSequenceCreateDto>;

export interface NurtureStep {
  delayMinutes: number;
  channel: NurtureStepChannel;
  subject: string;
  body: string;
  whatsappTemplate: string;
  whatsappLanguage: string;
  whatsappTemplateParams: string[];
}

export interface NurtureSequence {
  id: string;
  name: string;
  trigger: NurtureTrigger;
  active: boolean;
  stopOnReply: boolean;
  steps: NurtureStep[];
  activeEnrollments: number;
  createdAt: string;
  updatedAt: string;
}

export interface NurtureEnrollment {
  id: string;
  sequenceId: string;
  sequenceName: string;
  contactId: string;
  status: EnrollmentStatus;
  stopReason: string;
  /** Index of the next step to run. */
  nextStep: number;
  nextRunAt: string;
  attempts: number;
  lastError: string;
  enrolledById: string | null;
  enrolledAt: string;
  finishedAt: string | null;
}

/** GET /api/v1/nurture-enrollments filters (nurture.view `own` must pass contactId). */
export interface NurtureEnrollmentFilters {
  contactId?: string;
  sequenceId?: string;
  status?: EnrollmentStatus;
  limit?: number;
  offset?: number;
}
