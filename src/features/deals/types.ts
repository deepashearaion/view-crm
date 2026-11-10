import type { z } from 'zod';

import type {
  BillingPeriod,
  BillingType,
  DealStatus,
  StageColor,
  StageKind,
  StageRequiredField,
} from './constants';
import type { dealFormSchema, lostReasonSchema, stageFormSchema } from './schemas';

export type { BillingPeriod, BillingType, DealStatus, StageColor, StageKind, StageRequiredField };

/** GET /api/v1/deal-stages item. */
export interface StageDto {
  id: number;
  name: string;
  position: number;
  kind: StageKind;
  probability: number;
  guidance: string;
  required_fields: StageRequiredField[] | null;
  open_deals: number;
  open_value_paise: number;
  created_at: string;
  updated_at: string;
}

/** POST /api/v1/deal-stages body; PATCH takes the same fields except `kind`. */
export interface StageWriteDto {
  name?: string;
  position?: number;
  kind?: StageKind;
  probability?: number;
  guidance?: string;
  required_fields?: StageRequiredField[];
}

export interface DealStage {
  id: string;
  name: string;
  position: number;
  kind: StageKind;
  /** Win probability 0–100. */
  probability: number;
  /** What reps should do in this stage. */
  guidance: string;
  /** Fields a deal needs before it can enter this stage. */
  requiredFields: StageRequiredField[];
  openDeals: number;
  openValuePaise: number;
  /** Derived client-side from kind and position (the API has no colour). */
  color: StageColor;
}

/** GET /api/v1/deals item. */
export interface DealDto {
  id: number;
  title: string;
  description: string;
  contact_id: number | null;
  owner_id: number | null;
  stage_id: number;
  stage_name: string;
  status: DealStatus;
  amount_paise: number;
  billing_type: BillingType;
  billing_period: BillingPeriod | null;
  value_paise: number;
  expected_close_date: string | null;
  closed_at: string | null;
  lost_reason: string;
  stage_entered_at: string;
  win_probability: number;
  probability_notes: string[] | null;
  created_at: string;
  updated_at: string;
}

/** POST /api/v1/deals body. Leave out fields the user didn't fill in. */
export interface DealCreateDto {
  title: string;
  description?: string;
  contact_id?: number;
  owner_id?: number;
  stage_id?: number;
  amount_paise?: number;
  billing_type?: BillingType;
  billing_period?: BillingPeriod;
  expected_close_date?: string;
}

/** PATCH /api/v1/deals/{id} body. Never stage_id; clear with the `clear_*` flags. */
export type DealUpdateDto = Partial<Omit<DealCreateDto, 'stage_id'>> & {
  clear_contact?: true;
  clear_expected_close_date?: true;
};

/** POST /api/v1/deals/{id}/stage body. */
export interface DealMoveDto {
  stage_id: number;
  lost_reason?: string;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  contactId: string | null;
  ownerId: string | null;
  stageId: string;
  stageName: string;
  status: DealStatus;
  amountPaise: number;
  billingType: BillingType;
  /** Set when `billingType` is recurring. */
  billingPeriod: BillingPeriod | null;
  /** The one-time amount, or a recurring deal's first-year value. */
  valuePaise: number;
  /** IST calendar day, `YYYY-MM-DD`. */
  expectedCloseDate: string | null;
  closedAt: string | null;
  lostReason: string;
  stageEnteredAt: string;
  /** 0–100. */
  winProbability: number;
  /** The forecast's reasoning behind `winProbability`. */
  probabilityNotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DealHistoryDto {
  from_stage_id: number | null;
  from_stage: string | null;
  to_stage_id: number;
  to_stage: string;
  changed_by_id: number | null;
  changed_at: string;
}

export interface DealHistoryEntry {
  fromStageId: string | null;
  fromStage: string | null;
  toStageId: string;
  toStage: string;
  changedById: string | null;
  changedAt: string;
}

export interface ForecastMonthDto {
  month: string;
  won_deals: number;
  won_paise: number;
  open_deals: number;
  best_case_paise: number;
  weighted_paise: number;
  forecast_paise: number;
  commit_paise: number;
}

export interface ForecastBucketDto {
  deals: number;
  value_paise: number;
}

export interface ForecastDto {
  method: string;
  months: ForecastMonthDto[] | null;
  overdue: ForecastBucketDto;
  undated: ForecastBucketDto;
}

export interface ForecastMonth {
  /** `YYYY-MM`. */
  month: string;
  wonDeals: number;
  wonPaise: number;
  openDeals: number;
  bestCasePaise: number;
  weightedPaise: number;
  forecastPaise: number;
  commitPaise: number;
}

export interface ForecastBucket {
  deals: number;
  valuePaise: number;
}

export interface DealForecast {
  method: string;
  months: ForecastMonth[];
  /** Open deals whose expected close date has passed. */
  overdue: ForecastBucket;
  /** Open deals with no expected close date. */
  undated: ForecastBucket;
}

export type DealFormValues = z.input<typeof dealFormSchema>;
export type DealFormOutput = z.output<typeof dealFormSchema>;
export type StageFormValues = z.input<typeof stageFormSchema>;
export type StageFormOutput = z.output<typeof stageFormSchema>;
export type LostReasonValues = z.infer<typeof lostReasonSchema>;
