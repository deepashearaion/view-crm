import { http } from '@/services';

import type {
  AssignmentRule,
  AssignmentRuleCreateDto,
  AssignmentRuleDto,
  AssignmentRulePatchDto,
  LeadSettings,
  LeadSettingsDto,
  LeadSettingsPatchDto,
  LeadSource,
  LeadSourceCreateDto,
  LeadSourceDto,
  LeadSourcePatchDto,
  ScoringRule,
  ScoringRuleCreateDto,
  ScoringRuleDto,
  ScoringRulePatchDto,
  WhatsAppAccount,
  WhatsAppAccountCreateDto,
  WhatsAppAccountDto,
} from '../types';

const LEAD_SETTINGS = '/api/v1/lead-settings';
const LEAD_SOURCES = '/api/v1/lead-sources';
const WHATSAPP_ACCOUNTS = '/api/v1/whatsapp-accounts';
const SCORING_RULES = '/api/v1/scoring-rules';
const ASSIGNMENT_RULES = '/api/v1/assignment-rules';

const path = (base: string, id: string, suffix = '') =>
  `${base}/${encodeURIComponent(id)}${suffix}`;

/** Drops undefined/null values: /api/v1 rejects unknown fields and ignores null. */
function compact<T extends object>(body: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null),
  ) as Partial<T>;
}

// Mappers

export function toLeadSettings(dto: LeadSettingsDto): LeadSettings {
  return {
    hotThreshold: dto.hot_threshold,
    warmThreshold: dto.warm_threshold,
    defaultOwnerId: dto.default_owner_id === null ? null : String(dto.default_owner_id),
    hotFollowupMinutes: dto.hot_followup_minutes,
    updatedAt: dto.updated_at,
  };
}

export function toLeadSource(dto: LeadSourceDto): LeadSource {
  return {
    id: String(dto.id),
    name: dto.name,
    channel: dto.channel,
    publicKey: dto.public_key,
    active: dto.active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function toWhatsAppAccount(dto: WhatsAppAccountDto): WhatsAppAccount {
  return {
    id: String(dto.id),
    phoneNumberId: dto.phone_number_id,
    displayPhone: dto.display_phone,
    sourceName: dto.source_name,
    createdAt: dto.created_at,
  };
}

export function toScoringRule(dto: ScoringRuleDto): ScoringRule {
  return {
    id: String(dto.id),
    name: dto.name,
    criterion: dto.criterion,
    value: dto.value,
    points: dto.points,
    active: dto.active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function toAssignmentRule(dto: AssignmentRuleDto): AssignmentRule {
  return {
    id: String(dto.id),
    name: dto.name,
    position: dto.position,
    criterion: dto.criterion,
    value: dto.value,
    active: dto.active,
    userIds: (dto.user_ids ?? []).map(String),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

// Lead settings (settings.view to read, settings.edit to change)

export async function fetchLeadSettings(signal?: AbortSignal): Promise<LeadSettings> {
  const response = await http.get<{ settings: LeadSettingsDto }>(LEAD_SETTINGS, { signal });
  return toLeadSettings(response.settings);
}

/** Sends only the given keys; `clear_default_owner: true` unsets the default owner. */
export async function updateLeadSettings(body: LeadSettingsPatchDto): Promise<LeadSettings> {
  const response = await http.patch<{ settings: LeadSettingsDto }>(LEAD_SETTINGS, compact(body));
  return toLeadSettings(response.settings);
}

// Lead sources

export async function fetchLeadSources(signal?: AbortSignal): Promise<LeadSource[]> {
  const response = await http.get<{ sources: LeadSourceDto[] | null }>(LEAD_SOURCES, { signal });
  return (response.sources ?? []).map(toLeadSource);
}

/** 409 name_taken. */
export async function createLeadSource(body: LeadSourceCreateDto): Promise<LeadSource> {
  const response = await http.post<{ source: LeadSourceDto }>(LEAD_SOURCES, compact(body));
  return toLeadSource(response.source);
}

export async function updateLeadSource(id: string, body: LeadSourcePatchDto): Promise<LeadSource> {
  const response = await http.patch<{ source: LeadSourceDto }>(
    path(LEAD_SOURCES, id),
    compact(body),
  );
  return toLeadSource(response.source);
}

/** Issues a new public_key; the old web-form URL stops working. */
export async function rotateLeadSourceKey(id: string): Promise<LeadSource> {
  const response = await http.post<{ source: LeadSourceDto }>(
    path(LEAD_SOURCES, id, '/rotate-key'),
  );
  return toLeadSource(response.source);
}

// WhatsApp accounts

export async function fetchWhatsAppAccounts(signal?: AbortSignal): Promise<WhatsAppAccount[]> {
  const response = await http.get<{ accounts: WhatsAppAccountDto[] | null }>(WHATSAPP_ACCOUNTS, {
    signal,
  });
  return (response.accounts ?? []).map(toWhatsAppAccount);
}

/** 409 phone_number_taken. */
export async function createWhatsAppAccount(
  body: WhatsAppAccountCreateDto,
): Promise<WhatsAppAccount> {
  const response = await http.post<{ account: WhatsAppAccountDto }>(
    WHATSAPP_ACCOUNTS,
    compact(body),
  );
  return toWhatsAppAccount(response.account);
}

export async function deleteWhatsAppAccount(id: string): Promise<void> {
  await http.delete(path(WHATSAPP_ACCOUNTS, id));
}

// Scoring rules

export async function fetchScoringRules(signal?: AbortSignal): Promise<ScoringRule[]> {
  const response = await http.get<{ rules: ScoringRuleDto[] | null }>(SCORING_RULES, { signal });
  return (response.rules ?? []).map(toScoringRule);
}

export async function createScoringRule(body: ScoringRuleCreateDto): Promise<ScoringRule> {
  const response = await http.post<{ rule: ScoringRuleDto }>(SCORING_RULES, compact(body));
  return toScoringRule(response.rule);
}

export async function updateScoringRule(
  id: string,
  body: ScoringRulePatchDto,
): Promise<ScoringRule> {
  const response = await http.patch<{ rule: ScoringRuleDto }>(
    path(SCORING_RULES, id),
    compact(body),
  );
  return toScoringRule(response.rule);
}

export async function deleteScoringRule(id: string): Promise<void> {
  await http.delete(path(SCORING_RULES, id));
}

// Assignment rules

/** In evaluation order (sorted by position). */
export async function fetchAssignmentRules(signal?: AbortSignal): Promise<AssignmentRule[]> {
  const response = await http.get<{ rules: AssignmentRuleDto[] | null }>(ASSIGNMENT_RULES, {
    signal,
  });
  return (response.rules ?? []).map(toAssignmentRule).sort((a, b) => a.position - b.position);
}

export async function createAssignmentRule(body: AssignmentRuleCreateDto): Promise<AssignmentRule> {
  const response = await http.post<{ rule: AssignmentRuleDto }>(ASSIGNMENT_RULES, compact(body));
  return toAssignmentRule(response.rule);
}

export async function updateAssignmentRule(
  id: string,
  body: AssignmentRulePatchDto,
): Promise<AssignmentRule> {
  const response = await http.patch<{ rule: AssignmentRuleDto }>(
    path(ASSIGNMENT_RULES, id),
    compact(body),
  );
  return toAssignmentRule(response.rule);
}

export async function deleteAssignmentRule(id: string): Promise<void> {
  await http.delete(path(ASSIGNMENT_RULES, id));
}
