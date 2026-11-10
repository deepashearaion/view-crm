import { ArrowRight } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useUserLookup } from '@/features/auth';
import { formatDateTime } from '@/lib/format';

import { useDealHistory } from '../hooks/use-deals';

/** Stage changes from GET /api/v1/deals/{id}/history. */
export function DealHistory({ dealId }: { dealId: string }) {
  const { data: history = [], isPending, isError } = useDealHistory(dealId);
  const users = useUserLookup();

  return (
    <section aria-labelledby="deal-history-heading" className="space-y-3">
      <h3 id="deal-history-heading" className="text-sm font-semibold">
        History
      </h3>
      {isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : isError ? (
        <p className="text-sm text-muted-foreground">Couldn’t load the history.</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stage changes yet.</p>
      ) : (
        <ol className="space-y-2 border-l pl-4">
          {history.map((entry) => {
            const who = entry.changedById ? users.get(entry.changedById)?.name : undefined;
            return (
              <li
                key={`${entry.changedAt}-${entry.toStageId}`}
                className="relative text-sm before:absolute before:top-1.5 before:-left-[1.3rem] before:size-2 before:rounded-full before:bg-border"
              >
                <p className="flex flex-wrap items-center gap-1.5">
                  {entry.fromStage ? (
                    <>
                      <span className="text-muted-foreground">{entry.fromStage}</span>
                      <ArrowRight aria-label="to" className="size-3.5 text-muted-foreground" />
                      <span className="font-medium">{entry.toStage}</span>
                    </>
                  ) : (
                    <span>
                      Created in <span className="font-medium">{entry.toStage}</span>
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {who ?? (entry.changedById ? 'Former user' : 'System')} ·{' '}
                  {formatDateTime(entry.changedAt)}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
