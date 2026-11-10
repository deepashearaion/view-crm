import { http } from '@/services';

import { UNKNOWN_SOURCE } from '../constants';
import type {
  CountDto,
  DashboardReport,
  DashboardReportDto,
  FunnelReport,
  FunnelReportDto,
  PeriodDto,
  PipelineStageDto,
  PipelineStageReport,
  RepReportRow,
  RepRowDto,
  ReportCount,
  ReportRange,
  ReportSettings,
  ReportSettingsDto,
  ReportSettingsWriteDto,
  RevenueMonth,
  RevenueMonthDto,
  SourceReportRow,
  SourceRowDto,
} from '../types';

const BASE = '/api/v1/reports';

const toCount = (dto: CountDto): ReportCount => ({ count: dto.count, valuePaise: dto.value_paise });
const toPeriod = (dto: PeriodDto): ReportRange => ({ from: dto.from, to: dto.to });
const rangeQuery = (range: ReportRange) => ({ from: range.from, to: range.to });

export function toDashboardReport(dto: DashboardReportDto): DashboardReport {
  return {
    period: toPeriod(dto.period),
    openDeals: toCount(dto.open_deals),
    won: toCount(dto.won),
    lost: toCount(dto.lost),
    winRatePercent: dto.win_rate_percent,
    avgDealSizePaise: dto.avg_deal_size_paise,
    avgSalesCycleDays: dto.avg_sales_cycle_days,
    newCustomers: dto.new_customers,
    newLeads: dto.new_leads,
    hotLeads: dto.hot_leads,
    invoicedPaise: dto.invoiced_paise,
    arrPaise: dto.arr_paise,
    mrrPaise: dto.mrr_paise,
  };
}

export async function fetchDashboardReport(
  range: ReportRange,
  signal?: AbortSignal,
): Promise<DashboardReport> {
  const response = await http.get<{ dashboard: DashboardReportDto }>(`${BASE}/dashboard`, {
    query: rangeQuery(range),
    signal,
  });
  return toDashboardReport(response.dashboard);
}

export async function fetchFunnelReport(
  range: ReportRange,
  signal?: AbortSignal,
): Promise<FunnelReport> {
  const { funnel } = await http.get<{ funnel: FunnelReportDto }>(`${BASE}/funnel`, {
    query: rangeQuery(range),
    signal,
  });
  return {
    period: toPeriod(funnel.period),
    lost: funnel.lost,
    stages: funnel.stages.map((stage) => ({
      stage: stage.stage,
      reached: stage.reached,
      fromPreviousPercent: stage.from_previous_percent,
      fromFirstStagePercent: stage.from_first_stage_percent,
    })),
  };
}

export async function fetchPipelineReport(signal?: AbortSignal): Promise<PipelineStageReport[]> {
  const { stages } = await http.get<{ stages: PipelineStageDto[] | null }>(`${BASE}/pipeline`, {
    signal,
  });
  return (stages ?? []).map((stage) => ({
    stageId: String(stage.stage_id),
    name: stage.name,
    probability: stage.probability,
    deals: stage.deals,
    valuePaise: stage.value_paise,
    weightedPaise: stage.weighted_paise,
    avgDaysInStage: stage.avg_days_in_stage,
  }));
}

export async function fetchSourcesReport(
  range: ReportRange,
  signal?: AbortSignal,
): Promise<SourceReportRow[]> {
  const { sources } = await http.get<{ sources: SourceRowDto[] | null }>(`${BASE}/sources`, {
    query: rangeQuery(range),
    signal,
  });
  return (sources ?? []).map((row) => ({
    source: row.source,
    unknown: row.source === UNKNOWN_SOURCE || !row.source,
    leads: row.leads,
    hotLeads: row.hot_leads,
    customers: row.customers,
    conversionPercent: row.conversion_percent,
    wonPaise: row.won_paise,
  }));
}

export async function fetchRepsReport(
  range: ReportRange,
  signal?: AbortSignal,
): Promise<RepReportRow[]> {
  const { reps } = await http.get<{ reps: RepRowDto[] | null }>(`${BASE}/reps`, {
    query: rangeQuery(range),
    signal,
  });
  return (reps ?? []).map((row) => ({
    userId: String(row.user_id),
    name: row.name,
    role: row.role,
    leadsAssigned: row.leads_assigned,
    openDeals: toCount(row.open_deals),
    won: toCount(row.won),
    lost: toCount(row.lost),
    winRatePercent: row.win_rate_percent,
    overdueTasks: row.overdue_tasks,
  }));
}

export async function fetchRevenueReport(
  months: number,
  signal?: AbortSignal,
): Promise<RevenueMonth[]> {
  const response = await http.get<{ months: RevenueMonthDto[] | null }>(`${BASE}/revenue`, {
    query: { months },
    signal,
  });
  return (response.months ?? []).map((row) => ({
    month: row.month,
    wonDeals: row.won_deals,
    wonPaise: row.won_paise,
    newArrPaise: row.new_arr_paise,
    newCustomers: row.new_customers,
    invoicedPaise: row.invoiced_paise,
  }));
}

const toSettings = (dto: ReportSettingsDto): ReportSettings => ({
  weeklyEmail: dto.weekly_email,
  updatedAt: dto.updated_at,
});

export async function fetchReportSettings(signal?: AbortSignal): Promise<ReportSettings> {
  const { settings } = await http.get<{ settings: ReportSettingsDto }>(`${BASE}/settings`, {
    signal,
  });
  return toSettings(settings);
}

export async function updateReportSettings(body: ReportSettingsWriteDto): Promise<ReportSettings> {
  const { settings } = await http.put<{ settings: ReportSettingsDto }>(`${BASE}/settings`, body);
  return toSettings(settings);
}
