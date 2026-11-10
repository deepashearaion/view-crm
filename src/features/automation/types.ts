import type { ASSIGNMENT_CRITERIA, LEAD_SOURCE_CHANNELS, SCORING_CRITERIA } from './constants';

export type LeadSourceChannel = (typeof LEAD_SOURCE_CHANNELS)[number]['value'];
export type ScoringCriterion = (typeof SCORING_CRITERIA)[number]['value'];
export type AssignmentCriterion = (typeof ASSIGNMENT_CRITERIA)[number]['value'];

// Lead settings

export interface LeadSettingsDto {
  hot_threshold: number;
  warm_threshold: number;
  default_owner_id: number | null;
  hot_followup_minutes: number;
  updated_at: string;
}

/** PATCH /api/v1/lead-settings body. Use `clear_default_owner: true` to unset the owner. */
export interface LeadSettingsPatchDto {
  hot_threshold?: number;
  warm_threshold?: number;
  default_owner_id?: number;
  clear_default_owner?: boolean;
  hot_followup_minutes?: number;
}

export interface LeadSettings {
  hotThreshold: number;
  warmThreshold: number;
  defaultOwnerId: string | null;
  hotFollowupMinutes: number;
  updatedAt: string;
}

// Lead sources

export interface LeadSourceDto {
  id: number;
  name: string;
  channel: LeadSourceChannel;
  public_key: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadSourceCreateDto {
  name: string;
  channel: LeadSourceChannel;
}

export interface LeadSourcePatchDto {
  name?: string;
  active?: boolean;
}

export interface LeadSource {
  id: string;
  name: string;
  channel: LeadSourceChannel;
  publicKey: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// WhatsApp accounts

export interface WhatsAppAccountDto {
  id: number;
  phone_number_id: string;
  display_phone: string;
  source_name: string;
  created_at: string;
}

export interface WhatsAppAccountCreateDto {
  phone_number_id: string;
  display_phone: string;
  source_name: string;
}

export interface WhatsAppAccount {
  id: string;
  phoneNumberId: string;
  displayPhone: string;
  sourceName: string;
  createdAt: string;
}

// Scoring rules

export interface ScoringRuleDto {
  id: number;
  name: string;
  criterion: ScoringCriterion;
  value: string;
  points: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScoringRuleCreateDto {
  name: string;
  criterion: ScoringCriterion;
  value?: string;
  points: number;
  active?: boolean;
}

export type ScoringRulePatchDto = Partial<ScoringRuleCreateDto>;

export interface ScoringRule {
  id: string;
  name: string;
  criterion: ScoringCriterion;
  value: string;
  points: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Assignment rules

export interface AssignmentRuleDto {
  id: number;
  name: string;
  position: number;
  criterion: AssignmentCriterion;
  value: string;
  active: boolean;
  user_ids: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRuleCreateDto {
  name: string;
  position: number;
  criterion: AssignmentCriterion;
  value?: string;
  active?: boolean;
  /** Several users → leads are handed out round-robin. */
  user_ids: number[];
}

export type AssignmentRulePatchDto = Partial<AssignmentRuleCreateDto>;

export interface AssignmentRule {
  id: string;
  name: string;
  position: number;
  criterion: AssignmentCriterion;
  value: string;
  active: boolean;
  userIds: string[];
  createdAt: string;
  updatedAt: string;
}
