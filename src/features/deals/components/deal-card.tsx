import { parseISO } from 'date-fns';
import {
  ArrowRightLeft,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Percent,
  Repeat,
  Trash2,
  User,
} from 'lucide-react';

import { UserChip } from '@/components/data/user-chip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate, formatPaise } from '@/lib/format';
import { cn } from '@/lib/utils';

import { BILLING_PERIOD_LABELS, stageColorClass } from '../constants';
import type { Deal, DealStage } from '../types';

/** dataTransfer type used for Kanban drag and drop. */
export const DEAL_DRAG_TYPE = 'application/x-crm-deal';

interface DealCardProps {
  deal: Deal;
  stages: DealStage[];
  ownerName?: string;
  contactName?: string;
  /** Today's IST date (`YYYY-MM-DD`) for overdue checks. */
  today: string;
  /** False for viewers: no menu, no dragging. */
  canEdit: boolean;
  dragging?: boolean;
  onOpen: (deal: Deal) => void;
  onMove: (deal: Deal, stageId: string) => void;
  onDelete: (deal: Deal) => void;
  onDragChange?: (deal: Deal | null) => void;
}

export function DealCard({
  deal,
  stages,
  ownerName,
  contactName,
  today,
  canEdit,
  dragging = false,
  onOpen,
  onMove,
  onDelete,
  onDragChange,
}: DealCardProps) {
  const overdue =
    deal.status === 'open' && deal.expectedCloseDate !== null && deal.expectedCloseDate < today;

  return (
    <article
      draggable={canEdit}
      onDragStart={(event) => {
        event.dataTransfer.setData(DEAL_DRAG_TYPE, deal.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragChange?.(deal);
      }}
      onDragEnd={() => {
        onDragChange?.(null);
      }}
      className={cn(
        'group relative rounded-lg border bg-card p-3 shadow-xs transition-shadow focus-within:ring-2 focus-within:ring-ring/50 hover:shadow-sm',
        canEdit && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="min-w-0 flex-1 text-left after:absolute after:inset-0 focus-visible:outline-none"
          onClick={() => {
            onOpen(deal);
          }}
        >
          <span className="line-clamp-2 text-sm font-medium">{deal.title}</span>
        </button>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Actions for ${deal.title}`}
                className="relative z-10 -mt-0.5 -mr-1 opacity-60 group-hover:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreHorizontal aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={() => {
                  onOpen(deal);
                }}
              >
                <Pencil aria-hidden />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowRightLeft aria-hidden />
                  Move to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {stages.map((stage) => (
                    <DropdownMenuItem
                      key={stage.id}
                      disabled={stage.id === deal.stageId}
                      onSelect={() => {
                        onMove(deal, stage.id);
                      }}
                    >
                      <span
                        aria-hidden
                        className={cn('size-2 rounded-full', stageColorClass[stage.color].dot)}
                      />
                      {stage.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  onDelete(deal);
                }}
              >
                <Trash2 aria-hidden />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="font-heading text-base font-semibold tabular-nums">
          {formatPaise(deal.amountPaise)}
        </p>
        {deal.billingType === 'recurring' && (
          <Badge variant="secondary" className="h-4.5 px-1.5 text-[0.65rem]">
            <Repeat aria-hidden />
            {deal.billingPeriod ? BILLING_PERIOD_LABELS[deal.billingPeriod] : 'Recurring'}
          </Badge>
        )}
      </div>

      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        {contactName && (
          <p className="flex items-center gap-1.5 truncate">
            <User aria-hidden className="size-3.5 shrink-0" />
            {contactName}
          </p>
        )}
        {deal.status === 'lost' && deal.lostReason && (
          <p className="line-clamp-2 text-destructive" title={deal.lostReason}>
            Lost: {deal.lostReason}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <UserChip name={ownerName} className="text-xs" />
        <div className="flex items-center gap-1.5">
          {deal.expectedCloseDate && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground',
                overdue && 'font-medium text-destructive',
              )}
              title={overdue ? 'Expected close (overdue)' : 'Expected close'}
            >
              <CalendarDays aria-hidden className="size-3.5" />
              {formatDate(parseISO(deal.expectedCloseDate))}
            </span>
          )}
          {deal.status === 'open' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  tabIndex={0}
                  className="relative z-10 h-4.5 px-1.5 text-[0.65rem] tabular-nums"
                  aria-label={`${String(deal.winProbability)}% win probability`}
                >
                  {deal.winProbability}
                  <Percent aria-hidden />
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="block">
                <p className="font-medium">{deal.winProbability}% win probability</p>
                {deal.probabilityNotes.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {deal.probabilityNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </article>
  );
}
