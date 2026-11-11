import type { QueryClient } from '@tanstack/react-query';

import type { Access } from '@/features/auth';
import {
  contactKeys,
  fetchContacts,
  LIFECYCLE_STAGES,
  lifecycleStageById,
  temperatureLabel,
  type Contact,
} from '@/features/contacts';
import {
  BILLING_PERIOD_LABELS,
  BILLING_TYPE_LABELS,
  dealKeys,
  fetchDeals,
  type Deal,
} from '@/features/deals';
import {
  fetchAllInvoices,
  INVOICE_STATUSES,
  invoiceKeys,
  type Invoice,
} from '@/features/onboarding';
import {
  fetchTasks,
  TASK_ORIGIN_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  taskKeys,
  taskStatus,
  type Task,
} from '@/features/tasks';
import { paiseToRupees, toIstDate } from '@/lib/format';
import type { CellFormat, CellValue } from '@/lib/xlsx';

import {
  fetchDashboardReport,
  fetchFunnelReport,
  fetchPipelineReport,
  fetchRepsReport,
  fetchRevenueReport,
  fetchSourcesReport,
} from '../api/reports';
import { reportKeys } from '../constants';
import { formatReportMonth } from '../report-format';
import type {
  DashboardReport,
  FunnelStage,
  PipelineStageReport,
  RepReportRow,
  ReportRange,
  RevenueMonth,
  SourceReportRow,
} from '../types';

// ── Shapes ───────────────────────────────────────────────────────────────────

/** Resolves ids to names while building rows. */
export interface ReportLookups {
  userName: (id: string | null) => string;
  /** Empty map when the user can't view contacts; ids are shown instead. */
  contactName: (id: string | null) => string;
}

interface ColumnDef<Row> {
  id: string;
  label: string;
  format: CellFormat;
  value: (row: Row, lookups: ReportLookups) => CellValue;
  /** Ticked when the report is first opened. */
  preset?: boolean;
}

interface DateBasisDef<Row> {
  id: string;
  label: string;
  /** `YYYY-MM-DD` or an ISO instant; null rows drop out of the period. */
  value: (row: Row) => string | null;
}

interface FilterDef<Row> {
  label: string;
  options: readonly { value: string; label: string }[];
  value: (row: Row) => string;
}

interface DatasetDef<Row> {
  id: string;
  label: string;
  description: string;
  group: 'summary' | 'records';
  allowed: (access: Access) => boolean;
  /**
   * - `api`: the period is sent to the API.
   * - `none`: a snapshot of right now (open pipeline).
   * - `rows`: rows are kept when the chosen date falls in the period.
   */
  period: 'api' | 'none' | 'rows';
  dateBases?: DateBasisDef<Row>[];
  filter?: FilterDef<Row>;
  /** True when a column shows contact names (contacts are loaded only then). */
  usesContacts?: (columnIds: readonly string[]) => boolean;
  load: (queryClient: QueryClient, range: ReportRange) => Promise<Row[]>;
  columns: ColumnDef<Row>[];
}

export interface ReportColumn {
  id: string;
  label: string;
  format: CellFormat;
  preset: boolean;
}

export interface ReportRequest {
  range: ReportRange;
  /** A `dateBases` id, or ANY_DATE to ignore the period. */
  dateBasis: string;
  /** A filter option value, or ALL_VALUES. */
  filter: string;
  columnIds: readonly string[];
}

/** One report type, with its row type erased so a list of them is well typed. */
export interface ReportDataset {
  id: string;
  label: string;
  description: string;
  group: 'summary' | 'records';
  allowed: (access: Access) => boolean;
  period: 'api' | 'none' | 'rows';
  dateBases: { id: string; label: string }[];
  filter?: { label: string; options: readonly { value: string; label: string }[] };
  columns: ReportColumn[];
  usesContacts: (columnIds: readonly string[]) => boolean;
  run: (
    queryClient: QueryClient,
    request: ReportRequest,
    lookups: ReportLookups,
  ) => Promise<CellValue[][]>;
}

export const ANY_DATE = 'any';
export const ALL_VALUES = 'all';

const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** The IST calendar day of `YYYY-MM-DD` or an ISO instant. */
function istDayOf(value: string): string {
  return DAY_ONLY.test(value) ? value : toIstDate(new Date(value));
}

function defineDataset<Row>(def: DatasetDef<Row>): ReportDataset {
  return {
    id: def.id,
    label: def.label,
    description: def.description,
    group: def.group,
    allowed: def.allowed,
    period: def.period,
    dateBases: (def.dateBases ?? []).map(({ id, label }) => ({ id, label })),
    filter: def.filter && { label: def.filter.label, options: def.filter.options },
    columns: def.columns.map(({ id, label, format, preset }) => ({
      id,
      label,
      format,
      preset: preset ?? false,
    })),
    usesContacts: def.usesContacts ?? (() => false),
    run: async (queryClient, request, lookups) => {
      let rows = await def.load(queryClient, request.range);

      const basis = def.dateBases?.find((item) => item.id === request.dateBasis);
      if (def.period === 'rows' && basis) {
        const { from, to } = request.range;
        rows = rows.filter((row) => {
          const value = basis.value(row);
          if (!value) return false;
          const day = istDayOf(value);
          return day >= from && day <= to;
        });
      }
      const { filter } = def;
      if (filter && request.filter !== ALL_VALUES) {
        rows = rows.filter((row) => filter.value(row) === request.filter);
      }

      const columns = request.columnIds
        .map((id) => def.columns.find((column) => column.id === id))
        .filter((column) => column !== undefined);
      return rows.map((row) => columns.map((column) => column.value(row, lookups)));
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const rupees = (paise: number | null | undefined) =>
  paise === null || paise === undefined ? null : paiseToRupees(paise);

const labelOf = (options: readonly { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

/** Cached for 30s like the app's other queries, so re-generating doesn't refetch. */
const STALE = 30_000;

const CONTACT_COLUMN_IDS = new Set(['contact']);
const usesContactColumn = (ids: readonly string[]) => ids.some((id) => CONTACT_COLUMN_IDS.has(id));

/** Loads every contact the user can see (shared cache with the Contacts page). */
export function loadContacts(queryClient: QueryClient): Promise<Contact[]> {
  return queryClient.query({
    queryKey: contactKeys.list(),
    queryFn: ({ signal }) => fetchContacts(signal),
    staleTime: STALE,
  });
}

const DEAL_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
] as const;

const TASK_STATUS_OPTIONS = TASK_STATUSES.map(({ value, label }) => ({ value, label }));
const LIFECYCLE_OPTIONS = LIFECYCLE_STAGES.map(({ id, label }) => ({ value: id, label }));
const INVOICE_STATUS_OPTIONS = INVOICE_STATUSES.map(({ value, label }) => ({ value, label }));

const canViewReports = (access: Access) => access.can('reports', 'view');

// ── Summary reports (/api/v1/reports/*) ──────────────────────────────────────

const keyFigures = defineDataset<DashboardReport>({
  id: 'key-figures',
  label: 'Key figures',
  description: 'One row of headline totals for the period: deals, win rate, leads and revenue.',
  group: 'summary',
  allowed: canViewReports,
  period: 'api',
  load: async (queryClient, range) => [
    await queryClient.query({
      queryKey: reportKeys.dashboard(range),
      queryFn: ({ signal }) => fetchDashboardReport(range, signal),
      staleTime: STALE,
    }),
  ],
  columns: [
    { id: 'from', label: 'From', format: 'date', value: (r) => r.period.from, preset: true },
    { id: 'to', label: 'To', format: 'date', value: (r) => r.period.to, preset: true },
    {
      id: 'newLeads',
      label: 'New leads',
      format: 'integer',
      value: (r) => r.newLeads,
      preset: true,
    },
    {
      id: 'hotLeads',
      label: 'Hot leads',
      format: 'integer',
      value: (r) => r.hotLeads,
      preset: true,
    },
    {
      id: 'newCustomers',
      label: 'New customers',
      format: 'integer',
      value: (r) => r.newCustomers,
      preset: true,
    },
    {
      id: 'openDeals',
      label: 'Open deals',
      format: 'integer',
      value: (r) => r.openDeals.count,
      preset: true,
    },
    {
      id: 'openValue',
      label: 'Open value',
      format: 'money',
      value: (r) => rupees(r.openDeals.valuePaise),
      preset: true,
    },
    {
      id: 'wonDeals',
      label: 'Won deals',
      format: 'integer',
      value: (r) => r.won.count,
      preset: true,
    },
    {
      id: 'wonValue',
      label: 'Won value',
      format: 'money',
      value: (r) => rupees(r.won.valuePaise),
      preset: true,
    },
    { id: 'lostDeals', label: 'Lost deals', format: 'integer', value: (r) => r.lost.count },
    {
      id: 'lostValue',
      label: 'Lost value',
      format: 'money',
      value: (r) => rupees(r.lost.valuePaise),
    },
    {
      id: 'winRate',
      label: 'Win rate',
      format: 'percent',
      value: (r) => r.winRatePercent,
      preset: true,
    },
    {
      id: 'avgDeal',
      label: 'Average deal size',
      format: 'money',
      value: (r) => rupees(r.avgDealSizePaise),
    },
    {
      id: 'cycle',
      label: 'Average sales cycle (days)',
      format: 'decimal',
      value: (r) => r.avgSalesCycleDays,
    },
    {
      id: 'invoiced',
      label: 'Invoiced',
      format: 'money',
      value: (r) => rupees(r.invoicedPaise),
      preset: true,
    },
    { id: 'arr', label: 'ARR', format: 'money', value: (r) => rupees(r.arrPaise) },
    { id: 'mrr', label: 'MRR', format: 'money', value: (r) => rupees(r.mrrPaise) },
  ],
});

const FUNNEL_LABELS: Record<string, string> = {
  lead: 'Lead',
  mql: 'MQL',
  sql: 'SQL',
  opportunity: 'Opportunity',
  customer: 'Customer',
};

const funnel = defineDataset<FunnelStage>({
  id: 'funnel',
  label: 'Lifecycle funnel',
  description: 'Contacts reaching each lifecycle stage in the period, with conversion rates.',
  group: 'summary',
  allowed: canViewReports,
  period: 'api',
  load: async (queryClient, range) =>
    (
      await queryClient.query({
        queryKey: reportKeys.funnel(range),
        queryFn: ({ signal }) => fetchFunnelReport(range, signal),
        staleTime: STALE,
      })
    ).stages,
  columns: [
    {
      id: 'stage',
      label: 'Stage',
      format: 'text',
      value: (r) => FUNNEL_LABELS[r.stage] ?? r.stage,
      preset: true,
    },
    { id: 'reached', label: 'Reached', format: 'integer', value: (r) => r.reached, preset: true },
    {
      id: 'fromPrevious',
      label: 'From previous stage',
      format: 'percent',
      value: (r) => r.fromPreviousPercent,
      preset: true,
    },
    {
      id: 'fromFirst',
      label: 'From first stage',
      format: 'percent',
      value: (r) => r.fromFirstStagePercent,
      preset: true,
    },
  ],
});

const pipeline = defineDataset<PipelineStageReport>({
  id: 'pipeline',
  label: 'Open pipeline',
  description: 'Open deals by stage right now, weighted by win probability. Ignores the period.',
  group: 'summary',
  allowed: canViewReports,
  period: 'none',
  load: (queryClient) =>
    queryClient.query({
      queryKey: reportKeys.pipeline(),
      queryFn: ({ signal }) => fetchPipelineReport(signal),
      staleTime: STALE,
    }),
  columns: [
    { id: 'stage', label: 'Stage', format: 'text', value: (r) => r.name, preset: true },
    {
      id: 'probability',
      label: 'Win probability',
      format: 'percent',
      value: (r) => r.probability,
      preset: true,
    },
    { id: 'deals', label: 'Open deals', format: 'integer', value: (r) => r.deals, preset: true },
    {
      id: 'value',
      label: 'Value',
      format: 'money',
      value: (r) => rupees(r.valuePaise),
      preset: true,
    },
    {
      id: 'weighted',
      label: 'Weighted value',
      format: 'money',
      value: (r) => rupees(r.weightedPaise),
      preset: true,
    },
    {
      id: 'avgDays',
      label: 'Average days in stage',
      format: 'decimal',
      value: (r) => r.avgDaysInStage,
    },
  ],
});

/** The API serves at most 36 months back from today. */
const REVENUE_MONTHS = 36;

const revenue = defineDataset<RevenueMonth>({
  id: 'revenue',
  label: 'Revenue by month',
  description: 'Won value, invoiced amount and new ARR per month in the period (last 36 months).',
  group: 'summary',
  allowed: canViewReports,
  period: 'api',
  load: async (queryClient, range) => {
    const months = await queryClient.query({
      queryKey: reportKeys.revenue(REVENUE_MONTHS),
      queryFn: ({ signal }) => fetchRevenueReport(REVENUE_MONTHS, signal),
      staleTime: STALE,
    });
    const first = range.from.slice(0, 7);
    const last = range.to.slice(0, 7);
    return months.filter((row) => row.month >= first && row.month <= last);
  },
  columns: [
    {
      id: 'month',
      label: 'Month',
      format: 'text',
      value: (r) => formatReportMonth(r.month, true),
      preset: true,
    },
    {
      id: 'wonDeals',
      label: 'Won deals',
      format: 'integer',
      value: (r) => r.wonDeals,
      preset: true,
    },
    {
      id: 'wonValue',
      label: 'Won value',
      format: 'money',
      value: (r) => rupees(r.wonPaise),
      preset: true,
    },
    {
      id: 'invoiced',
      label: 'Invoiced',
      format: 'money',
      value: (r) => rupees(r.invoicedPaise),
      preset: true,
    },
    {
      id: 'newArr',
      label: 'New ARR',
      format: 'money',
      value: (r) => rupees(r.newArrPaise),
      preset: true,
    },
    {
      id: 'newCustomers',
      label: 'New customers',
      format: 'integer',
      value: (r) => r.newCustomers,
      preset: true,
    },
  ],
});

const sources = defineDataset<SourceReportRow>({
  id: 'sources',
  label: 'Lead sources',
  description: 'Leads, hot leads, customers and won value per lead source in the period.',
  group: 'summary',
  allowed: canViewReports,
  period: 'api',
  load: (queryClient, range) =>
    queryClient.query({
      queryKey: reportKeys.sources(range),
      queryFn: ({ signal }) => fetchSourcesReport(range, signal),
      staleTime: STALE,
    }),
  columns: [
    {
      id: 'source',
      label: 'Source',
      format: 'text',
      value: (r) => (r.unknown ? 'Unknown' : r.source),
      preset: true,
    },
    { id: 'leads', label: 'Leads', format: 'integer', value: (r) => r.leads, preset: true },
    {
      id: 'hotLeads',
      label: 'Hot leads',
      format: 'integer',
      value: (r) => r.hotLeads,
      preset: true,
    },
    {
      id: 'customers',
      label: 'Customers',
      format: 'integer',
      value: (r) => r.customers,
      preset: true,
    },
    {
      id: 'conversion',
      label: 'Conversion',
      format: 'percent',
      value: (r) => r.conversionPercent,
      preset: true,
    },
    {
      id: 'wonValue',
      label: 'Won value',
      format: 'money',
      value: (r) => rupees(r.wonPaise),
      preset: true,
    },
  ],
});

const reps = defineDataset<RepReportRow>({
  id: 'team',
  label: 'Team performance',
  description: 'Leads, deals, win rate and overdue tasks per team member in the period.',
  group: 'summary',
  allowed: (access) => access.canAll('reports', 'view'),
  period: 'api',
  load: (queryClient, range) =>
    queryClient.query({
      queryKey: reportKeys.reps(range),
      queryFn: ({ signal }) => fetchRepsReport(range, signal),
      staleTime: STALE,
    }),
  columns: [
    { id: 'name', label: 'Name', format: 'text', value: (r) => r.name, preset: true },
    { id: 'role', label: 'Role', format: 'text', value: (r) => r.role, preset: true },
    {
      id: 'leads',
      label: 'Leads assigned',
      format: 'integer',
      value: (r) => r.leadsAssigned,
      preset: true,
    },
    {
      id: 'openDeals',
      label: 'Open deals',
      format: 'integer',
      value: (r) => r.openDeals.count,
      preset: true,
    },
    {
      id: 'openValue',
      label: 'Open value',
      format: 'money',
      value: (r) => rupees(r.openDeals.valuePaise),
    },
    {
      id: 'wonDeals',
      label: 'Won deals',
      format: 'integer',
      value: (r) => r.won.count,
      preset: true,
    },
    {
      id: 'wonValue',
      label: 'Won value',
      format: 'money',
      value: (r) => rupees(r.won.valuePaise),
      preset: true,
    },
    { id: 'lostDeals', label: 'Lost deals', format: 'integer', value: (r) => r.lost.count },
    {
      id: 'lostValue',
      label: 'Lost value',
      format: 'money',
      value: (r) => rupees(r.lost.valuePaise),
    },
    {
      id: 'winRate',
      label: 'Win rate',
      format: 'percent',
      value: (r) => r.winRatePercent,
      preset: true,
    },
    {
      id: 'overdue',
      label: 'Overdue tasks',
      format: 'integer',
      value: (r) => r.overdueTasks,
      preset: true,
    },
  ],
});

// ── Record reports (lists, filtered on the client) ───────────────────────────

const contacts = defineDataset<Contact>({
  id: 'contacts',
  label: 'Contacts',
  description: 'Every contact you can see, with lifecycle stage, score and owner.',
  group: 'records',
  allowed: (access) => access.can('contacts', 'view'),
  period: 'rows',
  dateBases: [
    { id: 'created', label: 'Created', value: (r) => r.createdAt },
    { id: 'updated', label: 'Last updated', value: (r) => r.updatedAt },
  ],
  filter: { label: 'Lifecycle stage', options: LIFECYCLE_OPTIONS, value: (r) => r.lifecycleStage },
  load: loadContacts,
  columns: [
    { id: 'id', label: 'Contact ID', format: 'text', value: (r) => r.id },
    { id: 'name', label: 'Name', format: 'text', value: (r) => r.fullName, preset: true },
    { id: 'firstName', label: 'First name', format: 'text', value: (r) => r.firstName },
    { id: 'lastName', label: 'Last name', format: 'text', value: (r) => r.lastName },
    { id: 'email', label: 'Email', format: 'text', value: (r) => r.email, preset: true },
    { id: 'mobile', label: 'Mobile', format: 'text', value: (r) => r.mobile, preset: true },
    { id: 'altMobile', label: 'Alternate mobile', format: 'text', value: (r) => r.alternateMobile },
    {
      id: 'stage',
      label: 'Lifecycle stage',
      format: 'text',
      value: (r) => lifecycleStageById(r.lifecycleStage)?.label ?? r.lifecycleStage,
      preset: true,
    },
    {
      id: 'temperature',
      label: 'Temperature',
      format: 'text',
      value: (r) => temperatureLabel(r.temperature),
      preset: true,
    },
    { id: 'score', label: 'Lead score', format: 'integer', value: (r) => r.score },
    {
      id: 'scoreReasons',
      label: 'Score reasons',
      format: 'text',
      value: (r) => r.scoreReasons.join('; '),
    },
    { id: 'source', label: 'Source', format: 'text', value: (r) => r.source, preset: true },
    { id: 'destination', label: 'Destination', format: 'text', value: (r) => r.destination },
    {
      id: 'owner',
      label: 'Owner',
      format: 'text',
      value: (r, l) => l.userName(r.leadOwnerId),
      preset: true,
    },
    { id: 'optedOut', label: 'Opted out on', format: 'date', value: (r) => r.optedOutAt },
    { id: 'notes', label: 'Notes', format: 'text', value: (r) => r.notes },
    {
      id: 'created',
      label: 'Created',
      format: 'datetime',
      value: (r) => r.createdAt,
      preset: true,
    },
    { id: 'updated', label: 'Last updated', format: 'datetime', value: (r) => r.updatedAt },
  ],
});

const deals = defineDataset<Deal>({
  id: 'deals',
  label: 'Deals',
  description: 'Every deal you can see, with stage, value, owner and close dates.',
  group: 'records',
  allowed: (access) => access.can('deals', 'view'),
  period: 'rows',
  dateBases: [
    { id: 'created', label: 'Created', value: (r) => r.createdAt },
    { id: 'expectedClose', label: 'Expected close', value: (r) => r.expectedCloseDate },
    { id: 'closed', label: 'Closed (won or lost)', value: (r) => r.closedAt },
  ],
  filter: { label: 'Status', options: DEAL_STATUS_OPTIONS, value: (r) => r.status },
  usesContacts: usesContactColumn,
  load: (queryClient) =>
    queryClient.query({
      queryKey: dealKeys.list(),
      queryFn: ({ signal }) => fetchDeals(signal),
      staleTime: STALE,
    }),
  columns: [
    { id: 'id', label: 'Deal ID', format: 'text', value: (r) => r.id },
    { id: 'title', label: 'Title', format: 'text', value: (r) => r.title, preset: true },
    {
      id: 'contact',
      label: 'Contact',
      format: 'text',
      value: (r, l) => l.contactName(r.contactId),
      preset: true,
    },
    {
      id: 'owner',
      label: 'Owner',
      format: 'text',
      value: (r, l) => l.userName(r.ownerId),
      preset: true,
    },
    { id: 'stage', label: 'Stage', format: 'text', value: (r) => r.stageName, preset: true },
    {
      id: 'status',
      label: 'Status',
      format: 'text',
      value: (r) => labelOf(DEAL_STATUS_OPTIONS, r.status),
      preset: true,
    },
    { id: 'amount', label: 'Amount', format: 'money', value: (r) => rupees(r.amountPaise) },
    {
      id: 'value',
      label: 'Value',
      format: 'money',
      value: (r) => rupees(r.valuePaise),
      preset: true,
    },
    {
      id: 'billingType',
      label: 'Billing',
      format: 'text',
      value: (r) => BILLING_TYPE_LABELS[r.billingType],
    },
    {
      id: 'billingPeriod',
      label: 'Billing period',
      format: 'text',
      value: (r) => (r.billingPeriod ? BILLING_PERIOD_LABELS[r.billingPeriod] : ''),
    },
    {
      id: 'probability',
      label: 'Win probability',
      format: 'percent',
      value: (r) => r.winProbability,
      preset: true,
    },
    {
      id: 'expectedClose',
      label: 'Expected close',
      format: 'date',
      value: (r) => r.expectedCloseDate,
      preset: true,
    },
    { id: 'closed', label: 'Closed on', format: 'date', value: (r) => r.closedAt },
    { id: 'lostReason', label: 'Lost reason', format: 'text', value: (r) => r.lostReason },
    { id: 'stageEntered', label: 'In stage since', format: 'date', value: (r) => r.stageEnteredAt },
    { id: 'description', label: 'Description', format: 'text', value: (r) => r.description },
    { id: 'created', label: 'Created', format: 'datetime', value: (r) => r.createdAt },
    { id: 'updated', label: 'Last updated', format: 'datetime', value: (r) => r.updatedAt },
  ],
});

const tasks = defineDataset<Task>({
  id: 'tasks',
  label: 'Tasks',
  description: 'Every task you can see, with due dates, assignee and status.',
  group: 'records',
  allowed: (access) => access.can('tasks', 'view'),
  period: 'rows',
  dateBases: [
    { id: 'due', label: 'Due', value: (r) => r.dueAt },
    { id: 'created', label: 'Created', value: (r) => r.createdAt },
    { id: 'completed', label: 'Completed', value: (r) => r.completedAt },
  ],
  filter: { label: 'Status', options: TASK_STATUS_OPTIONS, value: (r) => taskStatus(r) },
  usesContacts: usesContactColumn,
  load: (queryClient) =>
    queryClient.query({
      queryKey: taskKeys.list(),
      queryFn: ({ signal }) => fetchTasks(signal),
      staleTime: STALE,
    }),
  columns: [
    { id: 'id', label: 'Task ID', format: 'text', value: (r) => r.id },
    { id: 'title', label: 'Title', format: 'text', value: (r) => r.title, preset: true },
    {
      id: 'type',
      label: 'Type',
      format: 'text',
      value: (r) => labelOf(TASK_TYPES, r.type),
      preset: true,
    },
    {
      id: 'priority',
      label: 'Priority',
      format: 'text',
      value: (r) => labelOf(TASK_PRIORITIES, r.priority),
      preset: true,
    },
    {
      id: 'status',
      label: 'Status',
      format: 'text',
      value: (r) => labelOf(TASK_STATUS_OPTIONS, taskStatus(r)),
      preset: true,
    },
    { id: 'due', label: 'Due', format: 'datetime', value: (r) => r.dueAt, preset: true },
    {
      id: 'assignee',
      label: 'Assignee',
      format: 'text',
      value: (r, l) => l.userName(r.assigneeId),
      preset: true,
    },
    {
      id: 'contact',
      label: 'Contact',
      format: 'text',
      value: (r, l) => l.contactName(r.contactId),
      preset: true,
    },
    {
      id: 'createdBy',
      label: 'Created by',
      format: 'text',
      value: (r, l) => (r.createdById ? l.userName(r.createdById) : 'Automation'),
    },
    { id: 'origin', label: 'Origin', format: 'text', value: (r) => TASK_ORIGIN_LABELS[r.origin] },
    { id: 'completed', label: 'Completed', format: 'datetime', value: (r) => r.completedAt },
    { id: 'description', label: 'Description', format: 'text', value: (r) => r.description },
    { id: 'created', label: 'Created', format: 'datetime', value: (r) => r.createdAt },
  ],
});

const invoices = defineDataset<Invoice>({
  id: 'invoices',
  label: 'Invoices',
  description: 'Every invoice you can see, with GST breakdown and totals.',
  group: 'records',
  allowed: (access) => access.can('invoices', 'view'),
  period: 'rows',
  dateBases: [
    { id: 'issued', label: 'Issue date', value: (r) => r.issueDate },
    { id: 'created', label: 'Created', value: (r) => r.createdAt },
    { id: 'due', label: 'Due date', value: (r) => r.dueDate },
  ],
  filter: { label: 'Status', options: INVOICE_STATUS_OPTIONS, value: (r) => r.status },
  usesContacts: usesContactColumn,
  load: (queryClient) =>
    queryClient.query({
      queryKey: [...invoiceKeys.list({}), 'all'],
      queryFn: ({ signal }) => fetchAllInvoices({}, signal),
      staleTime: STALE,
    }),
  columns: [
    {
      id: 'number',
      label: 'Invoice number',
      format: 'text',
      value: (r) => r.number ?? 'Draft',
      preset: true,
    },
    {
      id: 'status',
      label: 'Status',
      format: 'text',
      value: (r) => labelOf(INVOICE_STATUS_OPTIONS, r.status),
      preset: true,
    },
    { id: 'fy', label: 'Financial year', format: 'text', value: (r) => r.financialYear },
    { id: 'billTo', label: 'Bill to', format: 'text', value: (r) => r.billToName, preset: true },
    { id: 'gstin', label: 'Customer GSTIN', format: 'text', value: (r) => r.billToGstin },
    { id: 'email', label: 'Customer email', format: 'text', value: (r) => r.billToEmail },
    { id: 'phone', label: 'Customer phone', format: 'text', value: (r) => r.billToPhone },
    { id: 'pos', label: 'Place of supply', format: 'text', value: (r) => r.placeOfSupply },
    {
      id: 'contact',
      label: 'Contact',
      format: 'text',
      value: (r, l) => l.contactName(r.contactId),
    },
    { id: 'owner', label: 'Owner', format: 'text', value: (r, l) => l.userName(r.ownerId) },
    { id: 'issued', label: 'Issue date', format: 'date', value: (r) => r.issueDate, preset: true },
    { id: 'due', label: 'Due date', format: 'date', value: (r) => r.dueDate, preset: true },
    {
      id: 'taxable',
      label: 'Taxable value',
      format: 'money',
      value: (r) => rupees(r.taxablePaise),
      preset: true,
    },
    { id: 'cgst', label: 'CGST', format: 'money', value: (r) => rupees(r.cgstPaise) },
    { id: 'sgst', label: 'SGST', format: 'money', value: (r) => rupees(r.sgstPaise) },
    { id: 'igst', label: 'IGST', format: 'money', value: (r) => rupees(r.igstPaise) },
    {
      id: 'gst',
      label: 'Total GST',
      format: 'money',
      value: (r) => rupees(r.cgstPaise + r.sgstPaise + r.igstPaise),
      preset: true,
    },
    { id: 'roundOff', label: 'Round off', format: 'money', value: (r) => rupees(r.roundOffPaise) },
    {
      id: 'total',
      label: 'Total',
      format: 'money',
      value: (r) => rupees(r.totalPaise),
      preset: true,
    },
    { id: 'sent', label: 'Emailed on', format: 'datetime', value: (r) => r.sentAt },
    { id: 'cancelled', label: 'Cancelled on', format: 'datetime', value: (r) => r.cancelledAt },
    { id: 'cancelReason', label: 'Cancel reason', format: 'text', value: (r) => r.cancelReason },
    { id: 'created', label: 'Created', format: 'datetime', value: (r) => r.createdAt },
  ],
});

/** Every report type, in menu order. */
export const REPORT_DATASETS: readonly ReportDataset[] = [
  keyFigures,
  sources,
  reps,
  funnel,
  pipeline,
  revenue,
  contacts,
  deals,
  tasks,
  invoices,
];

export const REPORT_GROUP_LABELS = { summary: 'Summary reports', records: 'Record lists' } as const;

export function presetColumnIds(dataset: ReportDataset): string[] {
  return dataset.columns.filter((column) => column.preset).map((column) => column.id);
}
