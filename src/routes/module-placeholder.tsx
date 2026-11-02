import { Construction } from 'lucide-react';

import { PageHeader } from '@/components/data/page-header';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge, type WorkflowKind } from '@/components/feedback/workflow-badge';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  phase: number;
  workflow?: WorkflowKind;
}

/** Stand-in for workflow modules that are scheduled for a later phase. */
export function ModulePlaceholder({ title, description, phase, workflow }: ModulePlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <PageHeader
        title={title}
        description={description}
        badges={workflow && <WorkflowBadge kind={workflow} />}
      />
      <EmptyState
        icon={Construction}
        title={`${title} is coming in Phase ${String(phase)}`}
        description="The route, navigation and data layer are in place; the module UI is built in its phase."
      />
    </div>
  );
}
