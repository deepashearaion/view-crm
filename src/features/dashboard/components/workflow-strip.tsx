import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { WorkflowBadge, type WorkflowKind } from '@/components/feedback/workflow-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  label: string;
  value: number;
  hint: string;
  kind: WorkflowKind;
  to: string;
}

const surface: Record<WorkflowKind, string> = {
  ai: 'border-ai/30 bg-ai-muted/60',
  human: 'border-human/30 bg-human-muted/60',
  decision: 'border-decision/30 bg-decision-muted/60',
};

/** Leads → hot → pipeline → won, colour-coded by the workflow legend. */
export function WorkflowStrip({ steps, loading }: { steps: WorkflowStep[]; loading: boolean }) {
  return (
    <ol aria-label="Workflow at a glance" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.label} className="relative">
          <Link
            to={step.to}
            className={cn(
              'flex h-full flex-col gap-2 rounded-xl border p-4 transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring',
              surface[step.kind],
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{step.label}</span>
              <WorkflowBadge kind={step.kind} />
            </span>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="font-heading text-3xl font-semibold tabular-nums">{step.value}</span>
            )}
            <span className="text-xs text-muted-foreground">{step.hint}</span>
          </Link>
          {index < steps.length - 1 && (
            <ChevronRight
              aria-hidden
              className="absolute top-1/2 -right-2.5 z-10 hidden size-4 -translate-y-1/2 text-muted-foreground xl:block"
            />
          )}
        </li>
      ))}
    </ol>
  );
}
