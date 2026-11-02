import { CircleUserRound, GitFork, Sparkles, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Badge } from '@/components/ui/badge';

export type WorkflowKind = 'ai' | 'human' | 'decision';

const meta: Record<WorkflowKind, { label: string; icon: LucideIcon; description: string }> = {
  ai: { label: 'AI', icon: Sparkles, description: 'Automatic step performed by AI' },
  human: { label: 'Rep', icon: CircleUserRound, description: 'Human step performed by a rep' },
  decision: { label: 'Decision', icon: GitFork, description: 'Decision point in the workflow' },
};

interface WorkflowBadgeProps extends Omit<ComponentProps<typeof Badge>, 'variant' | 'children'> {
  kind: WorkflowKind;
  /** Overrides the default label ("AI", "Rep", "Decision"). */
  label?: string;
}

/** Marks an item with its workflow legend type: automatic (AI), human step or decision. */
export function WorkflowBadge({ kind, label, ...props }: WorkflowBadgeProps) {
  const { icon: Icon, label: defaultLabel, description } = meta[kind];
  return (
    <Badge variant={kind} title={description} {...props}>
      <Icon aria-hidden data-icon="inline-start" />
      {label ?? defaultLabel}
    </Badge>
  );
}

/** Shorthand for the most common case: an action performed automatically by AI. */
export function AIBadge(props: Omit<WorkflowBadgeProps, 'kind'>) {
  return <WorkflowBadge kind="ai" {...props} />;
}
