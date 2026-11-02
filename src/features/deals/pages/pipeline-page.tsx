import {
  CircleCheckBig,
  CircleX,
  Plus,
  Settings2,
  SquareKanban,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/data/page-header';
import { SearchInput } from '@/components/data/search-input';
import { StatCard } from '@/components/data/stat-card';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserLookup, useUsers } from '@/features/auth';
import { useCompanyLookup } from '@/features/companies';
import { useContacts } from '@/features/contacts';
import { formatCurrency, plural } from '@/lib/format';
import { cn } from '@/lib/utils';

import { DealCard } from '../components/deal-card';
import { DealSheet, type DealSheetState } from '../components/deal-sheet';
import { ManageStagesDialog } from '../components/manage-stages-dialog';
import { DEAL_PRIORITIES, stageColorClass } from '../constants';
import { useDealStages, useDeals, useDeleteDeal, useMoveDeal } from '../hooks/use-deals';
import type { Deal } from '../types';

const ALL = 'all';

export default function PipelinePage() {
  const { data: deals = [], isPending: dealsPending, error } = useDeals();
  const { data: stages = [], isPending: stagesPending } = useDealStages();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const companies = useCompanyLookup();
  const { data: contacts = [] } = useContacts();
  const moveDeal = useMoveDeal();
  const deleteDeal = useDeleteDeal();

  const [search, setSearch] = useState('');
  const [owner, setOwner] = useState(ALL);
  const [priority, setPriority] = useState(ALL);
  const [sheet, setSheet] = useState<DealSheetState>({ mode: 'closed' });
  const [stagesOpen, setStagesOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Deal | null>(null);
  const [now] = useState(() => Date.now());

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = (text: string | undefined) => text?.toLowerCase().includes(query) === true;
    return deals.filter(
      (deal) =>
        (owner === ALL || deal.ownerId === owner) &&
        (priority === ALL || deal.priority === priority) &&
        (!query ||
          matches(deal.title) ||
          matches(deal.companyId ? companies.get(deal.companyId)?.name : undefined) ||
          matches(deal.contactId ? contactNames.get(deal.contactId) : undefined)),
    );
  }, [deals, owner, priority, search, companies, contactNames]);

  const metrics = useMemo(() => {
    const stageById = new Map(stages.map((stage) => [stage.id, stage]));
    let open = 0;
    let openCount = 0;
    let weighted = 0;
    let won = 0;
    let wonCount = 0;
    let lostCount = 0;
    for (const deal of filtered) {
      const stage = stageById.get(deal.stageId);
      if (!stage) continue;
      if (stage.kind === 'open') {
        open += deal.value;
        openCount++;
        weighted += (deal.value * stage.probability) / 100;
      } else if (stage.kind === 'won') {
        won += deal.value;
        wonCount++;
      } else {
        lostCount++;
      }
    }
    return { open, openCount, weighted, won, wonCount, lostCount };
  }, [filtered, stages]);

  const loading = dealsPending || stagesPending;

  const handleMove = (deal: Deal, stageId: string) => {
    const stage = stages.find((item) => item.id === stageId);
    moveDeal.mutate(
      { id: deal.id, stageId },
      {
        onSuccess: () => {
          toast.success(`Moved “${deal.title}” to ${stage?.name ?? 'stage'}.`);
        },
        onError: () => {
          toast.error('Couldn’t move the deal.');
        },
      },
    );
  };

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        title="Pipeline"
        description="Track every opportunity from qualification to close."
        badges={<WorkflowBadge kind="human" label="Rep step" />}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setStagesOpen(true);
              }}
            >
              <Settings2 aria-hidden />
              Stages
            </Button>
            <Button
              disabled={stages.length === 0}
              onClick={() => {
                setSheet({ mode: 'create' });
              }}
            >
              <Plus aria-hidden />
              New deal
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open pipeline"
          icon={Wallet}
          loading={loading}
          value={formatCurrency(metrics.open)}
          hint={plural(metrics.openCount, 'open deal')}
        />
        <StatCard
          label="Weighted forecast"
          icon={TrendingUp}
          loading={loading}
          value={formatCurrency(metrics.weighted)}
          hint="Value × stage probability"
        />
        <StatCard
          label="Won"
          icon={CircleCheckBig}
          loading={loading}
          value={formatCurrency(metrics.won)}
          hint={plural(metrics.wonCount, 'deal')}
        />
        <StatCard
          label="Lost"
          icon={CircleX}
          loading={loading}
          value={metrics.lostCount}
          hint="Re-enter nurture after 30 days"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onValueChange={setSearch} placeholder="Search deals…" />
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="h-9 w-44" aria-label="Filter by owner">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All owners</SelectItem>
            {userList.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="h-9 w-40" aria-label="Filter by priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All priorities</SelectItem>
            {DEAL_PRIORITIES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <EmptyState
          icon={SquareKanban}
          title="Couldn’t load the pipeline"
          description="Please refresh to try again."
        />
      ) : loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-96 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex h-full gap-4 pb-4">
            {stages.map((stage) => {
              const stageDeals = filtered.filter((deal) => deal.stageId === stage.id);
              const total = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
              return (
                <section
                  key={stage.id}
                  aria-label={`${stage.name}: ${String(stageDeals.length)} deals`}
                  className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/50"
                >
                  <header className="space-y-2 p-3 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={cn('size-2.5 rounded-full', stageColorClass[stage.color].dot)}
                      />
                      <h2 className="flex-1 truncate text-sm font-semibold">{stage.name}</h2>
                      <span className="rounded-full bg-background px-2 text-xs font-medium tabular-nums">
                        {stageDeals.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground tabular-nums">
                        {formatCurrency(total)}
                      </span>
                      <span>
                        {stage.kind === 'open'
                          ? `${String(stage.probability)}% win`
                          : stage.kind === 'won'
                            ? 'Won'
                            : 'Lost'}
                      </span>
                    </div>
                    <div
                      aria-hidden
                      className={cn('h-0.5 rounded-full', stageColorClass[stage.color].bar)}
                    />
                  </header>
                  <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
                    {stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        stages={stages}
                        now={now}
                        ownerName={deal.ownerId ? users.get(deal.ownerId)?.name : undefined}
                        contactName={deal.contactId ? contactNames.get(deal.contactId) : undefined}
                        companyName={
                          deal.companyId ? companies.get(deal.companyId)?.name : undefined
                        }
                        onOpen={(item) => {
                          setSheet({ mode: 'edit', deal: item });
                        }}
                        onMove={handleMove}
                        onDelete={setPendingDelete}
                      />
                    ))}
                    {stageDeals.length === 0 && (
                      <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                        No deals in this stage
                      </p>
                    )}
                    {stage.kind === 'open' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start text-muted-foreground"
                        onClick={() => {
                          setSheet({ mode: 'create', stageId: stage.id });
                        }}
                      >
                        <Plus aria-hidden />
                        Add deal
                      </Button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <DealSheet
        state={sheet}
        stages={stages}
        onClose={() => {
          setSheet({ mode: 'closed' });
        }}
        onDelete={(deal) => {
          setPendingDelete(deal);
        }}
      />
      <ManageStagesDialog open={stagesOpen} onOpenChange={setStagesOpen} stages={stages} />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this deal?"
        description={`“${pendingDelete?.title ?? ''}” will be removed from the pipeline.`}
        confirmLabel="Delete"
        destructive
        pending={deleteDeal.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteDeal.mutate(pendingDelete.id, {
            onSuccess: () => {
              toast.success('Deal deleted.');
              setPendingDelete(null);
              setSheet({ mode: 'closed' });
            },
            onError: () => {
              toast.error('Couldn’t delete the deal.');
            },
          });
        }}
      />
    </div>
  );
}
