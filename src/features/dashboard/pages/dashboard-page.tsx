import {
  BarChart3,
  CircleCheckBig,
  CircleX,
  IndianRupee,
  Repeat,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { PageHeader } from '@/components/data/page-header';
import { StatCard } from '@/components/data/stat-card';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { displayName, useSessionUser } from '@/features/auth';
import { TEMPERATURES, useContacts, type Temperature } from '@/features/contacts';
import { useDeals } from '@/features/deals';
import { formatDuration, useCalls } from '@/features/extras';
import {
  PipelineChart,
  currentMonthRange,
  useDashboardReport,
  usePipelineReport,
} from '@/features/reports';
import { taskStatus, taskTypeByValue, useTasks } from '@/features/tasks';
import { formatPaise, formatRelativeTime, plural } from '@/lib/format';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { ChartCard } from '../components/chart-card';
import { WorkflowStrip, type WorkflowStep } from '../components/workflow-strip';

const temperatureColors: Record<Temperature, string> = {
  hot: 'var(--lead-hot)',
  warm: 'var(--lead-warm)',
  cold: 'var(--lead-cold)',
};

const leadChartConfig = { count: { label: 'Contacts' } } satisfies ChartConfig;

function greeting(now: Date): string {
  const hour = now.getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/** Open tasks soonest-due first; tasks without a due date go last. */
function byDueAt(a: { dueAt: string | null }, b: { dueAt: string | null }): number {
  if (a.dueAt === b.dueAt) return 0;
  if (!a.dueAt) return 1;
  if (!b.dueAt) return -1;
  return a.dueAt.localeCompare(b.dueAt);
}

export default function DashboardPage() {
  const user = useSessionUser();
  const [now] = useState(() => new Date());
  const [month] = useState(() => currentMonthRange());
  const sales = useDashboardReport(month);
  const pipeline = usePipelineReport();
  const contacts = useContacts();
  const deals = useDeals();
  const tasks = useTasks();
  const calls = useCalls();

  const leadData = useMemo(() => {
    const list = contacts.data ?? [];
    return [
      ...TEMPERATURES.map((temperature) => ({
        status: temperature.label,
        count: list.filter((contact) => contact.temperature === temperature.id).length,
        fill: temperatureColors[temperature.id],
      })),
      {
        status: 'Not scored',
        count: list.filter((contact) => contact.temperature === null).length,
        fill: 'var(--decision)',
      },
    ];
  }, [contacts.data]);

  const workflow = useMemo<WorkflowStep[]>(() => {
    const allDeals = deals.data ?? [];
    return [
      {
        label: 'Leads captured',
        value: contacts.data?.length ?? 0,
        hint: 'WhatsApp, web forms, email',
        kind: 'ai',
        to: paths.contacts,
      },
      {
        label: 'Hot leads',
        value: (contacts.data ?? []).filter((contact) => contact.temperature === 'hot').length,
        hint: 'Routed to a rep instantly',
        kind: 'decision',
        to: paths.leads,
      },
      {
        label: 'In pipeline',
        value: allDeals.filter((deal) => deal.status === 'open').length,
        hint: 'Guided stages, forecast',
        kind: 'human',
        to: paths.deals,
      },
      {
        label: 'Won',
        value: allDeals.filter((deal) => deal.status === 'won').length,
        hint: 'Auto onboarding & invoice',
        kind: 'ai',
        to: paths.onboarding,
      },
    ];
  }, [contacts.data, deals.data]);

  const taskSummary = useMemo(() => {
    const list = tasks.data ?? [];
    const open = list
      .filter((task) => task.status === 'open')
      .sort(byDueAt)
      .slice(0, 5);
    return {
      overdue: list.filter((task) => taskStatus(task) === 'overdue').length,
      upcoming: list.filter((task) => taskStatus(task) === 'upcoming').length,
      next: open,
    };
  }, [tasks.data]);

  const callSummary = useMemo(() => {
    const weekAgo = now.getTime() - 7 * 86_400_000;
    const recent = (calls.data ?? []).filter(
      (call) => new Date(call.startedAt).getTime() >= weekAgo,
    );
    const connected = recent.filter((call) => call.outcome === 'connected');
    const talk = connected.reduce((sum, call) => sum + call.durationSeconds, 0);
    return { total: recent.length, connected: connected.length, talk };
  }, [calls.data, now]);

  const workflowLoading = contacts.isPending || deals.isPending;
  const report = sales.data;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title={`${greeting(now)}, ${displayName(user)}`}
        description="Here’s how your pipeline is moving this month."
        actions={
          <Button variant="outline" asChild>
            <Link to={paths.reports}>
              <BarChart3 aria-hidden />
              View reports
            </Link>
          </Button>
        }
      />

      <WorkflowStrip steps={workflow} loading={workflowLoading} />

      {sales.isError && (
        <InlineAlert>
          Sales figures are unavailable:{' '}
          {errorMessage(sales.error, 'the reports service did not respond.')}
        </InlineAlert>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Open deal value"
          icon={Wallet}
          loading={sales.isPending}
          value={formatPaise(report?.openDeals.valuePaise ?? 0)}
          hint={plural(report?.openDeals.count ?? 0, 'open deal')}
          className="xl:col-span-2"
        />
        <StatCard
          label="Won this month"
          icon={CircleCheckBig}
          loading={sales.isPending}
          value={report?.won.count ?? 0}
          hint={formatPaise(report?.won.valuePaise ?? 0)}
        />
        <StatCard
          label="Lost this month"
          icon={CircleX}
          loading={sales.isPending}
          value={report?.lost.count ?? 0}
          hint={formatPaise(report?.lost.valuePaise ?? 0)}
        />
        <StatCard
          label="New customers"
          icon={UserPlus}
          loading={sales.isPending}
          value={report?.newCustomers ?? 0}
          hint={`${plural(report?.hotLeads ?? 0, 'hot lead')} this month`}
        />
        <StatCard
          label="MRR"
          icon={Repeat}
          loading={sales.isPending}
          value={formatPaise(report?.mrrPaise ?? 0)}
          hint={
            <span className="inline-flex items-center gap-1">
              <IndianRupee aria-hidden className="size-3" />
              ARR {formatPaise(report?.arrPaise ?? 0)}
            </span>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Contacts by temperature"
          description="How warm everyone in your CRM is, from lead scoring."
          loading={contacts.isPending}
          empty={(contacts.data ?? []).length === 0}
        >
          <ChartContainer config={leadChartConfig} className="h-56 w-full">
            <BarChart
              data={leadData}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
              accessibilityLayer
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="status"
                width={84}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={4} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          title="Open pipeline by stage"
          description="Where deal value sits right now, and its weighted value."
          loading={pipeline.isPending}
          empty={!pipeline.data || pipeline.data.every((stage) => stage.deals === 0)}
          emptyText={
            pipeline.isError
              ? errorMessage(pipeline.error, 'Couldn’t load the pipeline.')
              : 'No open deals yet.'
          }
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to={paths.deals}>Open pipeline</Link>
            </Button>
          }
        >
          {pipeline.data && (
            <PipelineChart stages={pipeline.data} className="h-56 w-full" hideLegend />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Your next tasks"
          loading={tasks.isPending}
          empty={taskSummary.next.length === 0}
          emptyText="You’re all caught up."
          className="lg:col-span-2"
          action={
            <div className="flex gap-1.5">
              {taskSummary.overdue > 0 && (
                <Badge variant="destructive">{taskSummary.overdue} overdue</Badge>
              )}
              <Badge variant="secondary">{taskSummary.upcoming} upcoming</Badge>
            </div>
          }
        >
          <ul className="divide-y">
            {taskSummary.next.map((task) => {
              const type = taskTypeByValue(task.type);
              const overdue = taskStatus(task) === 'overdue';
              return (
                <li key={task.id} className="flex items-center gap-3 py-2.5">
                  {type && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <type.icon aria-hidden className="size-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{task.title}</span>
                    <span
                      className={
                        overdue ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'
                      }
                    >
                      {task.dueAt
                        ? `${overdue ? 'Overdue · ' : ''}${formatRelativeTime(task.dueAt)}`
                        : 'No due date'}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <Button variant="link" className="mt-1 px-0" asChild>
            <Link to={paths.tasks}>View all tasks</Link>
          </Button>
        </ChartCard>

        <ChartCard
          title="Calls this week"
          loading={calls.isPending}
          empty={callSummary.total === 0}
          emptyText="No calls in the last 7 days."
        >
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Total</dt>
              <dd className="font-heading text-3xl font-semibold tabular-nums">
                {callSummary.total}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Connected</dt>
              <dd className="font-heading text-3xl font-semibold tabular-nums">
                {callSummary.connected}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm text-muted-foreground">Talk time</dt>
              <dd className="font-heading text-xl font-semibold tabular-nums">
                {formatDuration(callSummary.talk)}
              </dd>
            </div>
          </dl>
          <Button variant="link" className="mt-3 px-0" asChild>
            <Link to={paths.callRecordings}>Open call log</Link>
          </Button>
        </ChartCard>
      </div>
    </div>
  );
}
