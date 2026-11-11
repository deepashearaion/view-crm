import { CircleDashed, Flame, Inbox, Plus, Snowflake, Sparkles, Thermometer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable, DataTableFacetedFilter, type FacetOption } from '@/components/data/data-table';
import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { StatCard } from '@/components/data/stat-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccess, useUserLookup, useUsers } from '@/features/auth';
import {
  LIFECYCLE_STAGES,
  TEMPERATURES,
  useContacts,
  useRescoreContact,
  useSetLifecycleStage,
  type Contact,
  type LifecycleStage,
} from '@/features/contacts';
import { toIstDate } from '@/lib/format';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { CaptureLeadDialog } from '../components/capture-lead-dialog';
import { getLeadColumns } from '../components/lead-columns';
import { LeadSourcesCard } from '../components/lead-sources-card';
import { INBOX_STAGES, TEMPERATURE_TABS, type TemperatureTab } from '../constants';

const contactHref = (contact: Pick<Contact, 'id'>) =>
  `${paths.contacts}?contact=${encodeURIComponent(contact.id)}`;

function inTab(contact: Contact, tab: TemperatureTab): boolean {
  if (tab === 'all') return true;
  if (tab === 'unscored') return contact.temperature === null || contact.score === null;
  return contact.score !== null && contact.temperature === tab;
}

/** Highest score first (unscored last), then newest. */
function byScoreThenNewest(a: Contact, b: Contact): number {
  return (
    (b.score ?? -1) - (a.score ?? -1) ||
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const EMPTY_TITLES: Record<TemperatureTab, string> = {
  hot: 'No hot leads right now',
  warm: 'No warm leads',
  cold: 'No cold leads',
  unscored: 'Every lead has been scored',
  all: 'No leads yet',
};

const stageLabel = (stage: LifecycleStage) =>
  LIFECYCLE_STAGES.find((entry) => entry.id === stage)?.label ?? stage;

const temperatureLabel = (temperature: string) =>
  TEMPERATURES.find((entry) => entry.id === temperature)?.label ?? temperature;

export default function LeadsPage() {
  const navigate = useNavigate();
  const access = useAccess();
  // Leads are contacts: capturing one needs contacts.create, re-scoring/stage moves contacts.edit.
  const canCreate = access.can('contacts', 'create');
  const canEdit = access.can('contacts', 'edit');
  const canViewSettings = access.can('settings', 'view');
  const { data: contacts = [], isPending, error, refetch } = useContacts();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const { mutate: rescore } = useRescoreContact();
  const { mutate: setStage } = useSetLifecycleStage();

  const [tab, setTab] = useState<TemperatureTab>('all');
  const [allStages, setAllStages] = useState(false);
  const [search, setSearch] = useState('');
  const [captureOpen, setCaptureOpen] = useState(false);

  /** The inbox (lead / MQL / SQL, or every stage), best leads first. */
  const inbox = useMemo(
    () =>
      contacts
        .filter((contact) => allStages || INBOX_STAGES.includes(contact.lifecycleStage))
        .sort(byScoreThenNewest),
    [contacts, allStages],
  );

  const counts = useMemo(() => {
    const today = toIstDate(new Date());
    const result: Record<TemperatureTab, number> & { today: number } = {
      hot: 0,
      warm: 0,
      cold: 0,
      unscored: 0,
      all: 0,
      today: 0,
    };
    for (const contact of inbox) {
      for (const { value } of TEMPERATURE_TABS) if (inTab(contact, value)) result[value]++;
      if (toIstDate(new Date(contact.createdAt)) === today) result.today++;
    }
    return result;
  }, [inbox]);

  const visible = useMemo(() => inbox.filter((contact) => inTab(contact, tab)), [inbox, tab]);

  const stageFacets: FacetOption[] = useMemo(
    () =>
      LIFECYCLE_STAGES.filter((stage) => allStages || INBOX_STAGES.includes(stage.id)).map(
        (stage) => ({ value: stage.id, label: stage.label }),
      ),
    [allStages],
  );
  const sourceFacets: FacetOption[] = useMemo(
    () =>
      [...new Set(inbox.map((contact) => contact.source).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .map((source) => ({ value: source, label: source })),
    [inbox],
  );
  const ownerFacets: FacetOption[] = userList.map((user) => ({ value: user.id, label: user.name }));

  const columns = useMemo(
    () =>
      getLeadColumns({
        users,
        canEdit,
        contactHref,
        onOpen: (contact) => {
          void navigate(contactHref(contact));
        },
        onRescore: (contact) => {
          rescore(contact.id, {
            onSuccess: ({ lead }) => {
              toast.success(`Re-scored ${contact.fullName}.`, {
                description: `Score ${String(lead.score)} · ${temperatureLabel(lead.temperature)}`,
              });
            },
            onError: (mutationError) => {
              toast.error(errorMessage(mutationError, 'Couldn’t re-score this lead.'));
            },
          });
        },
        onSetStage: (contact, stage) => {
          setStage(
            { id: contact.id, stage },
            {
              onSuccess: (updated) => {
                toast.success(
                  `${updated.fullName} moved to ${stageLabel(updated.lifecycleStage)}.`,
                );
              },
              onError: (mutationError) => {
                toast.error(errorMessage(mutationError, 'Couldn’t change the lifecycle stage.'));
              },
            },
          );
        },
      }),
    [users, canEdit, navigate, rescore, setStage],
  );

  const loadingStats = isPending && !error;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Leads"
        badges={<WorkflowBadge kind="ai" />}
        description="Captured from WhatsApp, web forms and email, then scored and routed by AI."
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setCaptureOpen(true);
              }}
            >
              <Plus aria-hidden />
              Capture lead
            </Button>
          )
        }
      />

      <section
        aria-label="Lead summary"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
      >
        <StatCard label="Hot" icon={Flame} value={counts.hot} loading={loadingStats} />
        <StatCard label="Warm" icon={Thermometer} value={counts.warm} loading={loadingStats} />
        <StatCard label="Cold" icon={Snowflake} value={counts.cold} loading={loadingStats} />
        <StatCard
          label="Not scored"
          icon={CircleDashed}
          value={counts.unscored}
          loading={loadingStats}
        />
        <StatCard
          label="New today"
          icon={Sparkles}
          value={counts.today}
          hint={allStages ? 'All stages' : 'Lead, MQL and SQL'}
          loading={loadingStats}
          className="col-span-2 md:col-span-1"
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as TemperatureTab);
          }}
        >
          <TabsList>
            {TEMPERATURE_TABS.map((entry) => (
              <TabsTrigger key={entry.value} value={entry.value} className="gap-2">
                {entry.label}
                <Badge
                  variant={entry.value === 'hot' && counts.hot > 0 ? 'hot' : 'secondary'}
                  className="h-4.5 min-w-5 px-1.5 tabular-nums"
                >
                  {counts[entry.value]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Switch id="leads-all-stages" checked={allStages} onCheckedChange={setAllStages} />
          <Label htmlFor="leads-all-stages" className="text-sm font-normal">
            All stages
          </Label>
        </div>
      </div>

      <DataTable
        label="Leads"
        storageKey="leads"
        columns={columns}
        data={visible}
        getRowId={(contact) => contact.id}
        globalFilter={search}
        isLoading={isPending}
        error={error}
        onRetry={() => void refetch()}
        onRowClick={(contact) => {
          void navigate(contactHref(contact));
        }}
        toolbar={(table) => (
          <>
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search leads…" />
            <DataTableFacetedFilter
              column={table.getColumn('lifecycle')}
              title="Stage"
              options={stageFacets}
            />
            <DataTableFacetedFilter
              column={table.getColumn('owner')}
              title="Owner"
              options={ownerFacets}
            />
            <DataTableFacetedFilter
              column={table.getColumn('source')}
              title="Source"
              options={sourceFacets}
            />
          </>
        )}
        emptyState={
          <EmptyState
            icon={Inbox}
            title={EMPTY_TITLES[tab]}
            description={
              tab === 'all'
                ? canCreate
                  ? 'Leads from WhatsApp, web forms and email land here. You can also capture one by hand.'
                  : 'Leads from WhatsApp, web forms and email will show up here.'
                : 'Try another temperature, or switch on “All stages”.'
            }
            className="border-none"
            actions={
              tab === 'all' &&
              canCreate && (
                <Button
                  onClick={() => {
                    setCaptureOpen(true);
                  }}
                >
                  <Plus aria-hidden />
                  Capture lead
                </Button>
              )
            }
          />
        }
      />

      <LeadSourcesCard canViewSettings={canViewSettings} />

      {canCreate && <CaptureLeadDialog open={captureOpen} onOpenChange={setCaptureOpen} />}
    </div>
  );
}
