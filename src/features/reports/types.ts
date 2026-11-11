// ---- DTOs: /api/v1/reports/* (section 9 of the API contract) ----

export interface CountDto {
  count: number;
  value_paise: number;
}

export interface PeriodDto {
  from: string;
  to: string;
}

/** GET /api/v1/reports/dashboard → { dashboard }. */
export interface DashboardReportDto {
  period: PeriodDto;
  open_deals: CountDto;
  won: CountDto;
  lost: CountDto;
  win_rate_percent: number;
  avg_deal_size_paise: number;
  avg_sales_cycle_days: number;
  new_customers: number;
  new_leads: number;
  hot_leads: number;
  invoiced_paise: number;
  arr_paise: number;
  mrr_paise: number;
}

export type FunnelStageName = 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer';

/** GET /api/v1/reports/funnel → { funnel }. */
export interface FunnelReportDto {
  period: PeriodDto;
  lost: number;
  stages: {
    stage: FunnelStageName;
    reached: number;
    from_previous_percent: number;
    from_first_stage_percent: number;
  }[];
}

/** GET /api/v1/reports/pipeline → { stages }. Current open deals, no period. */
export interface PipelineStageDto {
  stage_id: number;
  name: string;
  probability: number;
  deals: number;
  value_paise: number;
  weighted_paise: number;
  avg_days_in_stage: number;
}

/** GET /api/v1/reports/sources → { sources }. `"(none)"` means unknown. */
export interface SourceRowDto {
  source: string;
  leads: number;
  hot_leads: number;
  customers: number;
  conversion_percent: number;
  won_paise: number;
}

/** GET /api/v1/reports/reps → { reps }. Needs reports.view `all` (403 otherwise). */
export interface RepRowDto {
  user_id: number;
  name: string;
  /** Role name (custom roles). */
  role: string;
  leads_assigned: number;
  open_deals: CountDto;
  won: CountDto;
  lost: CountDto;
  win_rate_percent: number;
  overdue_tasks: number;
}

/** GET /api/v1/reports/revenue?months= → { months }, oldest first. */
export interface RevenueMonthDto {
  month: string;
  won_deals: number;
  won_paise: number;
  new_arr_paise: number;
  new_customers: number;
  invoiced_paise: number;
}

/** GET/PUT /api/v1/reports/settings → { settings }. */
export interface ReportSettingsDto {
  weekly_email: boolean;
  updated_at: string;
}

/** PUT /api/v1/reports/settings body. */
export interface ReportSettingsWriteDto {
  weekly_email: boolean;
}

// ---- App models ----

/** Inclusive IST calendar days, `YYYY-MM-DD`. */
export interface ReportRange {
  from: string;
  to: string;
}

export interface ReportCount {
  count: number;
  valuePaise: number;
}

export interface DashboardReport {
  period: ReportRange;
  openDeals: ReportCount;
  won: ReportCount;
  lost: ReportCount;
  winRatePercent: number;
  avgDealSizePaise: number;
  avgSalesCycleDays: number;
  newCustomers: number;
  newLeads: number;
  hotLeads: number;
  invoicedPaise: number;
  arrPaise: number;
  mrrPaise: number;
}

export interface FunnelStage {
  stage: FunnelStageName;
  reached: number;
  fromPreviousPercent: number;
  fromFirstStagePercent: number;
}

export interface FunnelReport {
  period: ReportRange;
  lost: number;
  stages: FunnelStage[];
}

export interface PipelineStageReport {
  stageId: string;
  name: string;
  probability: number;
  deals: number;
  valuePaise: number;
  weightedPaise: number;
  avgDaysInStage: number;
}

export interface SourceReportRow {
  source: string;
  /** True for the API's `"(none)"` bucket. */
  unknown: boolean;
  leads: number;
  hotLeads: number;
  customers: number;
  conversionPercent: number;
  wonPaise: number;
}

export interface RepReportRow {
  userId: string;
  name: string;
  /** Role name (custom roles). */
  role: string;
  leadsAssigned: number;
  openDeals: ReportCount;
  won: ReportCount;
  lost: ReportCount;
  winRatePercent: number;
  overdueTasks: number;
}

export interface RevenueMonth {
  /** `YYYY-MM`. */
  month: string;
  wonDeals: number;
  wonPaise: number;
  newArrPaise: number;
  newCustomers: number;
  invoicedPaise: number;
}

export interface ReportSettings {
  weeklyEmail: boolean;
  updatedAt: string;
}
