import { CircleCheckBig, CircleX, IndianRupee, Repeat, UserPlus, Wallet } from 'lucide-react';
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
import { LEAD_STATUSES, useContacts } from '@/features/contacts';
import { useDealStages, useDeals } from '@/features/deals';
import { formatDuration, useCalls } from '@/features/extras';
import { taskStatus, taskTypeByValue, useTasks } from '@/features/tasks';
import { formatCurrency, formatRelativeTime } from '@/lib/format';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { ChartCard } from '../components/chart-card';
import { WorkflowStrip, type WorkflowStep } from '../components/workflow-strip';
import { useSalesDashboard } from '../hooks/use-sales-dashboard';

const statusColors: Record<string, string> = {
  hot: 'var(--lead-hot)',
  warm: 'var(--lead-warm)',
  cold: 'var(--lead-cold)',
  human: 'var(--human)',
  decision: 'var(--decision)',
  ai: 'var(--ai)',
};

const leadChartConfig = { count: { label: 'Contacts' } } satisfies ChartConfig;
const pipelineChartConfig = {
  value: { label: 'Open value', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const compactInr = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function greeting(now: Date): string {
  const hour = now.getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardPage() {
  const user = useSessionUser();
  const [now] = useState(() => new Date());
  const sales = useSalesDashboard();
  const contacts = useContacts();
  const deals = useDeals();
  const stages = useDealStages();
  const tasks = useTasks();
  const calls = useCalls();

  const leadData = useMemo(
    () =>
      LEAD_STATUSES.map((status) => ({
        status: status.label,
        count: (contacts.data ?? []).filter((contact) => contact.leadStatusId === status.id).length,
        fill: statusColors[status.variant] ?? 'var(--chart-1)',
      })),
    [contacts.data],
  );

  const pipelineData = useMemo(
    () =>
      (stages.data ?? [])
        .filter((stage) => stage.kind === 'open')
        .map((stage) => ({
          stage: stage.name,
          value: (deals.data ?? [])
            .filter((deal) => deal.stageId === stage.id)
            .reduce((sum, deal) => sum + deal.value, 0),
        })),
    [deals.data, stages.data],
  );

  const workflow = useMemo<WorkflowStep[]>(() => {
    const stageKind = new Map((stages.data ?? []).map((stage) => [stage.id, stage.kind]));
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
        value: (contacts.data ?? []).filter((contact) => contact.leadStatusId === 1).length,
        hint: 'Routed to a rep instantly',
        kind: 'decision',
        to: paths.leads,
      },
      {
        label: 'In pipeline',
        value: allDeals.filter((deal) => stageKind.get(deal.stageId) === 'open').length,
        hint: 'Guided stages, forecast',
        kind: 'human',
        to: paths.deals,
      },
      {
        label: 'Won',
        value: allDeals.filter((deal) => stageKind.get(deal.stageId) === 'won').length,
        hint: 'Auto onboarding & invoice',
        kind: 'ai',
        to: paths.onboarding,
      },
    ];
  }, [contacts.data, deals.data, stages.data]);

  const taskSummary = useMemo(() => {
    const list = tasks.data ?? [];
    const open = list
      .filter((task) => !task.completedAt)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
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

  const workflowLoading = contacts.isPending || deals.isPending || stages.isPending;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title={`${greeting(now)}, ${displayName(user)}`}
        description="Hereâ€™s how your pipeline is moving today."
      />

      <WorkflowStrip steps={workflow} loading={workflowLoading} />

      {sales.isError && (
        <InlineAlert>
          Sales figures are unavailable:{' '}
          {errorMessage(sales.error, 'the dashboard service did not respond.')}
        </InlineAlert>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Open deal value"
          icon={Wallet}
          loading={sales.isPending}
          value={formatCurrency(sales.data?.openDealValue ?? 0)}
          hint={`${String(sales.data?.openDeals ?? 0)} open deals`}
          className="xl:col-span-2"
        />
        <StatCard
          label="Won"
          icon={CircleCheckBig}
          loading={sales.isPending}
          value={sales.data?.won ?? 0}
        />
        <StatCard
          label="Lost"
          icon={CircleX}
          loading={sales.isPending}
          value={sales.data?.lost ?? 0}
        />
        <StatCard
          label="New customers"
          icon={UserPlus}
          loading={sales.isPending}
          value={sales.data?.newCustomers ?? 0}
        />
        <StatCard
          label="MRR"
          icon={Repeat}
          loading={sales.isPending}
          value={formatCurrency(sales.data?.mrr ?? 0)}
          hint={
            <span className="inline-flex items-center gap-1">
              <IndianRupee aria-hidden className="size-3" />
              ARR {formatCurrency(sales.data?.arr ?? 0)}
            </span>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Contacts by lead status"
          description="Current temperature of everyone in your CRM."
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
          description="Where deal value sits right now."
          loading={deals.isPending || stages.isPending}
          empty={pipelineData.every((item) => item.value === 0)}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to={paths.deals}>Open pipeline</Link>
            </Button>
          }
        >
          <ChartContainer config={pipelineChartConfig} className="h-56 w-full">
            <BarChart data={pipelineData} margin={{ left: 4, right: 4 }} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="stage"
                tickLine={false}
                axisLine={false}
                interval={0}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(value: number) => `â‚¹${compactInr.format(value)}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />
                }
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={6} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Your next tasks"
          loading={tasks.isPending}
          empty={taskSummary.next.length === 0}
          emptyText="Youâ€™re all caught up."
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
                      {overdue ? 'Overdue Â· ' : ''}
                      {formatRelativeTime(task.dueAt)}
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
