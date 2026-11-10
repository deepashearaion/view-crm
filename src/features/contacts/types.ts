import type { z } from 'zod';

import type { LEAD_STATUSES } from './constants';
import type { activityFormSchema, contactFormSchema, contactTripSchema } from './schemas';

export type LeadStatusId = (typeof LEAD_STATUSES)[number]['id'];

export type LifecycleStage = 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'lost';
export type Temperature = 'cold' | 'warm' | 'hot';

/** Trip details captured by the travel desk. Not persisted by the backend yet. */
export type ContactTripDetails = z.infer<typeof contactTripSchema>;

export interface ContactScoreDto {
  score: number;
  temperature: Temperature;
  reasons: string[] | null;
  method: string;
  scored_at: string;
}

/**
 * Contact as returned by the REST API (snake_case). The v1-only fields are optional because the
 * legacy `/api/contacts` create/patch responses don't include them.
 */
export interface ContactDto {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  alternate_mobile: string;
  company_id: number | null;
  lead_status_id: number | null;
  lead_owner_id: number | null;
  destination: string;
  source: string;
  notes: string;
  lifecycle_stage?: LifecycleStage;
  score?: ContactScoreDto | null;
  marketing_opt_out_at?: string | null;
  created_at: string;
  updated_at: string;
  /** Only stored by the mock API until the backend adds trip columns. */
  trip?: ContactTripDetails;
}

/** Writable fields for legacy POST/PATCH /api/contacts (no v1-only fields). */
export type ContactWriteDto = Partial<
  Pick<
    ContactDto,
    | 'first_name'
    | 'last_name'
    | 'email'
    | 'mobile'
    | 'alternate_mobile'
    | 'company_id'
    | 'lead_status_id'
    | 'lead_owner_id'
    | 'destination'
    | 'source'
    | 'notes'
    | 'trip'
  >
>;

/** Contact as used in the UI (camelCase, derived fields). */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobile: string;
  alternateMobile: string;
  companyId: number | null;
  leadStatusId: number | null;
  leadOwnerId: string | null;
  destination: string;
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  trip?: ContactTripDetails;
  /** Defaults to `lead` when the response didn't carry it (legacy routes). */
  lifecycleStage: LifecycleStage;
  /** Rules-based lead score, null when not scored yet. */
  score: number | null;
  temperature: Temperature | null;
  scoreReasons: string[];
  scoredAt: string | null;
  /** When the contact opted out of marketing messages. */
  optedOutAt: string | null;
}

export type ContactFormValues = z.input<typeof contactFormSchema>;
export type ContactFormOutput = z.output<typeof contactFormSchema>;

// ---- Leads (/api/v1/leads) ----

export type LeadChannel = 'manual' | 'phone' | 'email' | 'web_form' | 'api';

/** Body for POST /api/v1/leads. Leave out fields that weren't filled in. */
export interface LeadRequest {
  first_name: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  destination?: string;
  source?: string;
  notes?: string;
  message?: string;
  channel?: LeadChannel;
}

export interface LeadResultDto {
  contact_id: number;
  created: boolean;
  score: number;
  temperature: Temperature;
  reasons: string[] | null;
  owner_id: number | null;
}

export interface LeadResult {
  contactId: string;
  created: boolean;
  score: number;
  temperature: Temperature;
  reasons: string[];
  ownerId: string | null;
}

// ---- Timeline (/api/v1/contacts/{id}/timeline) ----

export type ActivityKind =
  | 'captured'
  | 'duplicate_captured'
  | 'message'
  | 'note'
  | 'call'
  | 'email'
  | 'score_changed'
  | 'owner_assigned'
  | 'lifecycle_changed'
  | 'task_created'
  | 'task_completed'
  | 'deal_created'
  | 'deal_stage_changed'
  | 'deal_won'
  | 'deal_lost'
  | 'nurture_enrolled'
  | 'nurture_stopped'
  | 'opted_out'
  | 'invoice_issued'
  | 'invoice_sent'
  | 'invoice_cancelled';

export type ActivityChannel =
  'web_form' | 'whatsapp' | 'email' | 'phone' | 'manual' | 'api' | 'system';
export type ActivityDirection = 'inbound' | 'outbound';

export interface ActivityDto {
  id: number;
  contact_id: number;
  kind: ActivityKind;
  channel: ActivityChannel | null;
  direction: ActivityDirection | null;
  summary: string;
  body: string;
  metadata: Record<string, unknown> | null;
  actor_user_id: number | null;
  occurred_at: string;
}

export interface Activity {
  id: string;
  contactId: string;
  kind: ActivityKind;
  channel: ActivityChannel | null;
  direction: ActivityDirection | null;
  summary: string;
  body: string;
  metadata: Record<string, unknown>;
  actorUserId: string | null;
  occurredAt: string;
}

/** Body for POST /api/v1/contacts/{id}/activities. */
export interface ActivityRequest {
  kind: 'note' | 'call' | 'email';
  direction?: ActivityDirection;
  summary?: string;
  body: string;
  occurred_at?: string;
}

export type ActivityFormValues = z.input<typeof activityFormSchema>;
export type ActivityFormOutput = z.output<typeof activityFormSchema>;
