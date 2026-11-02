import {
  ArrowRightLeft,
  Building2,
  CalendarDays,
  MoreHorizontal,
  Pencil,
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
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

import { priorityByValue, stageColorClass } from '../constants';
import type { Deal, DealStage } from '../types';

interface DealCardProps {
  deal: Deal;
  stages: DealStage[];
  ownerName?: string;
  contactName?: string;
  companyName?: string;
  /** Render-stable timestamp for overdue checks. */
  now: number;
  onOpen: (deal: Deal) => void;
  onMove: (deal: Deal, stageId: string) => void;
  onDelete: (deal: Deal) => void;
}

export function DealCard({
  deal,
  stages,
  ownerName,
  contactName,
  companyName,
  now,
  onOpen,
  onMove,
  onDelete,
}: DealCardProps) {
  const priority = priorityByValue(deal.priority);
  const overdue = deal.expectedClose !== null && new Date(deal.expectedClose).getTime() < now;

  return (
    <article className="group relative rounded-lg border bg-card p-3 shadow-xs transition-shadow focus-within:ring-2 focus-within:ring-ring/50 hover:shadow-sm">
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
      </div>

      <p className="mt-1 font-heading text-base font-semibold tabular-nums">
        {formatCurrency(deal.value)}
      </p>

      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        {companyName && (
          <p className="flex items-center gap-1.5 truncate">
            <Building2 aria-hidden className="size-3.5 shrink-0" />
            {companyName}
          </p>
        )}
        {contactName && (
          <p className="flex items-center gap-1.5 truncate">
            <User aria-hidden className="size-3.5 shrink-0" />
            {contactName}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <UserChip name={ownerName} className="text-xs" />
        <div className="flex items-center gap-1.5">
          {deal.expectedClose && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground',
                overdue && 'font-medium text-destructive',
              )}
              title="Expected close"
            >
              <CalendarDays aria-hidden className="size-3.5" />
              {formatDate(deal.expectedClose)}
            </span>
          )}
          {priority && priority.value !== 'medium' && (
            <Badge variant={priority.variant} className="h-4.5 px-1.5 text-[0.65rem]">
              {priority.label}
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
}
