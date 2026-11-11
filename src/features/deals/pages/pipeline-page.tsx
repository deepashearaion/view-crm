import { CircleCheckBig, CircleX, Info, Plus, Settings2, SquareKanban, Wallet } from 'lucide-react';
import { useMemo, useState, type DragEvent } from 'react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAccess, useUserLookup, useUsers } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { formatPaise, plural, toIstDate, toIstMonth } from '@/lib/format';
import { cn } from '@/lib/utils';
import { errorMessage, hasProblemCode, isHttpError } from '@/services';

import { DEAL_DRAG_TYPE, DealCard } from '../components/deal-card';
import { DealSheet, type DealSheetState } from '../components/deal-sheet';
import { ForecastSummary } from '../components/forecast-summary';
import { LostReasonDialog } from '../components/lost-reason-dialog';
import { ManageStagesDialog } from '../components/manage-stages-dialog';
import { STAGE_REQUIRED_FIELD_LABELS, stageColorClass } from '../constants';
import {
  useDealForecast,
  useDealStages,
  useDeals,
  useDeleteDeal,
  useMoveDeal,
} from '../hooks/use-deals';
import type { Deal, DealStage } from '../types';

const ALL = 'all';
const FORECAST_MONTHS = 3;

function announceMove(deal: Deal, stage: DealStage) {
  if (stage.kind === 'won') {
    toast.success(`“${deal.title}” won.`, {
      description:
        'The contact is now a customer, nurture stopped and onboarding started. A draft invoice and a review task were created.',
    });
  } else if (stage.kind === 'lost') {
    toast(`“${deal.title}” marked lost.`, {
      description:
        'The contact moves into lost-deal nurture, or gets a re-contact task in 30 days.',
    });
  } else {
    toast.success(`Moved “${deal.title}” to ${stage.name}.`);
  }
}

export default function PipelinePage() {
  const access = useAccess();
  const canCreate = access.can('deals', 'create');
  const canEdit = access.can('deals', 'edit');
  const canDelete = access.can('deals', 'delete');
  const canManageStages = access.can('settings', 'edit');

  const { data: deals = [], isPending: dealsPending, error } = useDeals();
  const { data: stages = [], isPending: stagesPending } = useDealStages();
  const { data: userList = [] } = useUsers();
  const users = useUserLookup();
  const { data: contacts = [] } = useContacts();
  const moveDeal = useMoveDeal();
  const deleteDeal = useDeleteDeal();

  const [search, setSearch] = useState('');
  const [owner, setOwner] = useState(ALL);
  const [sheet, setSheet] = useState<DealSheetState>({ mode: 'closed' });
  const [stagesOpen, setStagesOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Deal | null>(null);
  const [lostPrompt, setLostPrompt] = useState<{ deal: Deal; stage: DealStage } | null>(null);
  const [dragging, setDragging] = useState<Deal | null>(null);
  const [dropStageId, setDropStageId] = useState<string | null>(null);
  const [today] = useState(() => toIstDate(new Date()));
  const [thisMonth] = useState(() => toIstMonth(new Date()));

  const forecast = useDealForecast({
    from: thisMonth,
    months: FORECAST_MONTHS,
    ownerId: owner === ALL ? undefined : owner,
  });

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );
  const dealById = useMemo(() => new Map(deals.map((deal) => [deal.id, deal])), [deals]);
  const stageById = useMemo(() => new Map(stages.map((stage) => [stage.id, stage])), [stages]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = (text: string | undefined) => text?.toLowerCase().includes(query) === true;
    return deals.filter(
      (deal) =>
        (owner === ALL || deal.ownerId === owner) &&
        (!query ||
          matches(deal.title) ||
          matches(deal.description) ||
          matches(deal.contactId ? contactNames.get(deal.contactId) : undefined)),
    );
  }, [deals, owner, search, contactNames]);

  const metrics = useMemo(() => {
    let open = 0;
    let openCount = 0;
    let won = 0;
    let wonCount = 0;
    let lostCount = 0;
    for (const deal of filtered) {
      if (deal.status === 'open') {
        open += deal.valuePaise;
        openCount++;
      } else if (deal.status === 'won') {
        won += deal.valuePaise;
        wonCount++;
      } else {
        lostCount++;
      }
    }
    return { open, openCount, won, wonCount, lostCount };
  }, [filtered]);

  const loading = dealsPending || stagesPending;

  /** POST /deals/{id}/stage. Lost stages ask for a reason first; missing fields open the sheet. */
  const requestMove = (deal: Deal, stageId: string, lostReason?: string) => {
    const stage = stageById.get(stageId);
    if (!stage || stageId === deal.stageId) return;
    if (stage.kind === 'lost' && !lostReason) {
      setLostPrompt({ deal, stage });
      return;
    }
    moveDeal
      .mutateAsync({ id: deal.id, stageId, lostReason })
      .then((updated) => {
        announceMove(updated, stage);
      })
      .catch((moveError: unknown) => {
        if (hasProblemCode(moveError, 'stage_requirements')) {
          setSheet({
            mode: 'edit',
            deal,
            requirements: {
              stageId,
              stageName: stage.name,
              lostReason,
              errors: (isHttpError(moveError) ? moveError.problem?.errors : undefined) ?? {},
            },
          });
          return;
        }
        if (
          isHttpError(moveError) &&
          moveError.code === 'validation_failed' &&
          moveError.problem?.errors?.lost_reason
        ) {
          setLostPrompt({ deal, stage });
        }
        toast.error(errorMessage(moveError, 'Couldn’t move the deal.'));
      });
  };

  const sheetState: DealSheetState =
    sheet.mode === 'edit' ? { ...sheet, deal: dealById.get(sheet.deal.id) ?? sheet.deal } : sheet;

  const dropHandlers = (stage: DealStage) =>
    canEdit
      ? {
          onDragOver: (event: DragEvent) => {
            if (!event.dataTransfer.types.includes(DEAL_DRAG_TYPE)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            if (dropStageId !== stage.id) setDropStageId(stage.id);
          },
          onDragLeave: (event: DragEvent) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setDropStageId(null);
            }
          },
          onDrop: (event: DragEvent) => {
            event.preventDefault();
            setDropStageId(null);
            setDragging(null);
            const deal = dealById.get(event.dataTransfer.getData(DEAL_DRAG_TYPE));
            if (deal) requestMove(deal, stage.id);
          },
        }
      : {};

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col gap-5 p-4 sm:p-6">
      <PageHeader
        title="Pipeline"
        description="Track every opportunity from qualification to close."
        badges={<WorkflowBadge kind="human" label="Rep step" />}
        actions={
          <>
            {canManageStages && (
              <Button
                variant="outline"
                disabled={stagesPending}
                onClick={() => {
                  setStagesOpen(true);
                }}
              >
                <Settings2 aria-hidden />
                Stages
              </Button>
            )}
            {canCreate && (
              <Button
                disabled={!stages.some((stage) => stage.kind === 'open')}
                onClick={() => {
                  setSheet({ mode: 'create' });
                }}
              >
                <Plus aria-hidden />
                New deal
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.8fr)]">
        <StatCard
          label="Open pipeline"
          icon={Wallet}
          loading={loading}
          value={formatPaise(metrics.open)}
          hint={plural(metrics.openCount, 'open deal')}
        />
        <StatCard
          label="Won"
          icon={CircleCheckBig}
          loading={loading}
          value={formatPaise(metrics.won)}
          hint={plural(metrics.wonCount, 'deal')}
        />
        <StatCard
          label="Lost"
          icon={CircleX}
          loading={loading}
          value={metrics.lostCount}
          hint="Re-enter nurture after 30 days"
        />
        <ForecastSummary
          className="sm:col-span-3 xl:col-span-1"
          forecast={forecast.data}
          loading={forecast.isPending}
          error={forecast.isError}
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
      </div>

      {error ? (
        <EmptyState
          icon={SquareKanban}
          title="Couldn’t load the pipeline"
          description={errorMessage(error, 'Please refresh to try again.')}
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
              const total = stageDeals.reduce((sum, deal) => sum + deal.valuePaise, 0);
              const required = stage.requiredFields.map(
                (field) => STAGE_REQUIRED_FIELD_LABELS[field],
              );
              return (
                <section
                  key={stage.id}
                  aria-label={`${stage.name}: ${String(stageDeals.length)} deals`}
                  className={cn(
                    'flex w-72 shrink-0 flex-col rounded-xl bg-muted/50 transition-colors',
                    dropStageId === stage.id &&
                      dragging?.stageId !== stage.id &&
                      'bg-muted ring-2 ring-ring/40',
                  )}
                  {...dropHandlers(stage)}
                >
                  <header className="space-y-2 p-3 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={cn('size-2.5 rounded-full', stageColorClass[stage.color].dot)}
                      />
                      <h2 className="flex-1 truncate text-sm font-semibold">{stage.name}</h2>
                      {(stage.guidance || required.length > 0) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label={`Guidance for ${stage.name}`}
                              className="rounded-sm text-muted-foreground hover:text-foreground"
                            >
                              <Info aria-hidden className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="block">
                            {stage.guidance && <p>{stage.guidance}</p>}
                            {required.length > 0 && (
                              <p className={cn(stage.guidance && 'mt-1')}>
                                Needs: {required.join(', ')}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <span className="rounded-full bg-background px-2 text-xs font-medium tabular-nums">
                        {stageDeals.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground tabular-nums">
                        {formatPaise(total)}
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
                        today={today}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        dragging={dragging?.id === deal.id}
                        ownerName={deal.ownerId ? users.get(deal.ownerId)?.name : undefined}
                        contactName={deal.contactId ? contactNames.get(deal.contactId) : undefined}
                        onOpen={(item) => {
                          setSheet({ mode: 'edit', deal: item });
                        }}
                        onMove={requestMove}
                        onDelete={setPendingDelete}
                        onDragChange={(item) => {
                          setDragging(item);
                          if (!item) setDropStageId(null);
                        }}
                      />
                    ))}
                    {stageDeals.length === 0 && (
                      <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                        No deals in this stage
                      </p>
                    )}
                    {canCreate && stage.kind === 'open' && (
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
        state={sheetState}
        stages={stages}
        canEdit={sheetState.mode === 'create' ? canCreate : canEdit}
        canDelete={canDelete}
        canReassign={
          sheetState.mode === 'create'
            ? access.canAll('deals', 'create')
            : access.canAll('deals', 'edit')
        }
        onClose={() => {
          setSheet({ mode: 'closed' });
        }}
        onSaved={(deal) => {
          const retry = sheet.mode === 'edit' ? sheet.requirements : undefined;
          setSheet({ mode: 'closed' });
          if (retry) requestMove(deal, retry.stageId, retry.lostReason);
        }}
        onDelete={setPendingDelete}
        onMove={requestMove}
      />
      {canManageStages && (
        <ManageStagesDialog open={stagesOpen} onOpenChange={setStagesOpen} stages={stages} />
      )}
      <LostReasonDialog
        dealTitle={lostPrompt?.deal.title ?? null}
        stageName={lostPrompt?.stage.name ?? ''}
        onCancel={() => {
          setLostPrompt(null);
        }}
        onConfirm={(lostReason) => {
          if (lostPrompt) requestMove(lostPrompt.deal, lostPrompt.stage.id, lostReason);
          setLostPrompt(null);
        }}
      />
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
            onError: (deleteError) => {
              toast.error(errorMessage(deleteError, 'Couldn’t delete the deal.'));
            },
          });
        }}
      />
    </div>
  );
}
