import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/data/page-header';
import { InlineAlert } from '@/components/feedback/inline-alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { errorMessage } from '@/services';

import { FunnelChart } from '../components/funnel-chart';
import { PipelineChart } from '../components/pipeline-chart';
import { ReportKpis } from '../components/report-kpis';
import { ReportRangePicker } from '../components/report-range-picker';
import { ReportSection } from '../components/report-section';
import { RepsTable } from '../components/reps-table';
import { RevenueChart } from '../components/revenue-chart';
import { SourcesTable } from '../components/sources-table';
import { WeeklyEmailSwitch } from '../components/weekly-email-switch';
import { DEFAULT_REVENUE_MONTHS, REVENUE_MONTH_OPTIONS, type RevenueMonths } from '../constants';
import {
  useDashboardReport,
  useFunnelReport,
  usePipelineReport,
  useRepsReport,
  useRevenueReport,
  useSourcesReport,
} from '../hooks/use-reports';
import { formatReportRange, rangeFromSearchParams } from '../report-range';
import type { ReportRange } from '../types';

function isRevenueMonths(value: number): value is RevenueMonths {
  return REVENUE_MONTH_OPTIONS.some((option) => option === value);
}

export default function ReportsPage() {
  // `?from=&to=` keeps the period shareable (the weekly email links here).
  const [searchParams, setSearchParams] = useSearchParams();
  const range = rangeFromSearchParams(searchParams);
  const setRange = (next: ReportRange) => {
    setSearchParams(
      (params) => {
        params.set('from', next.from);
        params.set('to', next.to);
        return params;
      },
      { replace: true },
    );
  };
  const [months, setMonths] = useState<RevenueMonths>(DEFAULT_REVENUE_MONTHS);

  const dashboard = useDashboardReport(range);
  const funnel = useFunnelReport(range);
  const pipeline = usePipelineReport();
  const sources = useSourcesReport(range);
  const reps = useRepsReport(range);
  const revenue = useRevenueReport(months);

  const periodLabel = formatReportRange(range);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Reports"
        description="Sales, funnel, pipeline and revenue for the period you pick."
        actions={<WeeklyEmailSwitch />}
      />

      <ReportRangePicker value={range} onValueChange={setRange} />

      <section aria-label="Key figures" className="space-y-3">
        {dashboard.isError && (
          <InlineAlert>
            {errorMessage(dashboard.error, 'Couldn’t load the key figures for this period.')}
          </InlineAlert>
        )}
        <ReportKpis report={dashboard.data} loading={dashboard.isPending} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportSection
          title="Lifecycle funnel"
          description={`Contacts reaching each stage, ${periodLabel}.`}
          loading={funnel.isPending}
          error={funnel.error}
          empty={!funnel.data || funnel.data.stages.every((stage) => stage.reached === 0)}
          emptyText="No contacts moved through the funnel in this period."
        >
          {funnel.data && <FunnelChart report={funnel.data} />}
        </ReportSection>

        <ReportSection
          title="Open pipeline"
          description="Current open deals by stage, weighted by win probability. Not tied to the period."
          loading={pipeline.isPending}
          error={pipeline.error}
          empty={!pipeline.data || pipeline.data.every((stage) => stage.deals === 0)}
          emptyText="No open deals right now."
        >
          {pipeline.data && <PipelineChart stages={pipeline.data} />}
        </ReportSection>
      </div>

      <ReportSection
        title="Revenue by month"
        description="Won deal value, invoiced amount and new ARR."
        loading={revenue.isPending}
        error={revenue.error}
        empty={
          !revenue.data ||
          revenue.data.every(
            (month) => month.wonPaise === 0 && month.invoicedPaise === 0 && month.newArrPaise === 0,
          )
        }
        emptyText="No revenue recorded in these months."
        action={
          <Select
            value={String(months)}
            onValueChange={(value) => {
              const next = Number(value);
              if (isRevenueMonths(next)) setMonths(next);
            }}
          >
            <SelectTrigger className="h-8 w-36" aria-label="Months shown">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REVENUE_MONTH_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  Last {option} months
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        {revenue.data && <RevenueChart months={revenue.data} />}
      </ReportSection>

      <ReportSection
        title="Lead sources"
        description={`Where leads came from and how they converted, ${periodLabel}.`}
        loading={sources.isPending}
        error={sources.error}
        empty={!sources.data?.length}
        emptyText="No leads in this period."
      >
        {sources.data && <SourcesTable rows={sources.data} />}
      </ReportSection>

      {reps.available && (
        <ReportSection
          title="Team performance"
          description={`Leads, deals and overdue tasks per team member, ${periodLabel}.`}
          loading={reps.isPending}
          error={reps.error}
          empty={!reps.data?.length}
          emptyText="No team activity in this period."
        >
          {reps.data && <RepsTable rows={reps.data} />}
        </ReportSection>
      )}
    </div>
  );
}
