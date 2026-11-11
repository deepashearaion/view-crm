import { Mail, MessageCircle, Pencil, Reply, Trash2, UserPlus } from 'lucide-react';

import { DataTableRowActions } from '@/components/data/data-table';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { plural } from '@/lib/format';
import { cn } from '@/lib/utils';

import { formatDelay } from '../api/form-mapping';
import { triggerLabel } from '../constants';
import type { NurtureSequence } from '../types';

const MAX_PREVIEW_STEPS = 6;

interface SequenceCardProps {
  sequence: NurtureSequence;
  togglePending: boolean;
  /** Org-wide nurture.edit: activate/deactivate and edit the sequence. */
  canEdit: boolean;
  /** nurture.create: enroll a contact. */
  canEnroll: boolean;
  /** Org-wide nurture.delete. */
  canDelete: boolean;
  onToggleActive: (active: boolean) => void;
  onEdit: () => void;
  onEnroll: () => void;
  onDelete: () => void;
}

export function SequenceCard({
  sequence,
  togglePending,
  canEdit,
  canEnroll,
  canDelete,
  onToggleActive,
  onEdit,
  onEnroll,
  onDelete,
}: SequenceCardProps) {
  const switchId = `sequence-active-${sequence.id}`;
  const preview = sequence.steps.slice(0, MAX_PREVIEW_STEPS);
  const hidden = sequence.steps.length - preview.length;
  const offsets = preview.map((_, index) =>
    preview.slice(0, index + 1).reduce((sum, step) => sum + step.delayMinutes, 0),
  );

  return (
    <Card className={cn('transition-colors', !sequence.active && 'bg-muted/30')}>
      <CardHeader>
        <CardTitle className="min-w-0">
          {canEdit ? (
            <button
              type="button"
              className="max-w-full truncate text-left underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
              onClick={onEdit}
            >
              {sequence.name}
            </button>
          ) : (
            <span className="block max-w-full truncate">{sequence.name}</span>
          )}
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-1.5">
          {sequence.trigger === 'manual' ? (
            <Badge variant="outline">{triggerLabel(sequence.trigger)}</Badge>
          ) : (
            <WorkflowBadge
              kind="ai"
              label={`Auto · ${triggerLabel(sequence.trigger)}`}
              title="Contacts are enrolled automatically"
            />
          )}
          {sequence.stopOnReply && (
            <Badge variant="secondary" title="The cadence ends when the contact replies">
              <Reply aria-hidden data-icon="inline-start" />
              Stops on reply
            </Badge>
          )}
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          <Switch
            id={switchId}
            checked={sequence.active}
            disabled={!canEdit || togglePending}
            aria-label={`${sequence.active ? 'Deactivate' : 'Activate'} “${sequence.name}”`}
            onCheckedChange={onToggleActive}
          />
          {(canEdit || canEnroll || canDelete) && (
            <DataTableRowActions
              label={`Actions for ${sequence.name}`}
              actions={[
                ...(canEdit ? [{ label: 'Edit', icon: Pencil, onSelect: onEdit }] : []),
                ...(canEnroll
                  ? [{ label: 'Enroll contact', icon: UserPlus, onSelect: onEnroll }]
                  : []),
                ...(canDelete
                  ? [
                      {
                        label: 'Delete',
                        icon: Trash2,
                        destructive: true,
                        separatorBefore: canEdit || canEnroll,
                        onSelect: onDelete,
                      },
                    ]
                  : []),
              ]}
            />
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1">
        {preview.length ? (
          <ol className="flex flex-wrap items-center gap-1.5" aria-label="Steps">
            {preview.map((step, index) => {
              const Icon = step.channel === 'email' ? Mail : MessageCircle;
              const elapsed = offsets[index] ?? 0;
              const when = elapsed ? formatDelay(elapsed) : 'at once';
              return (
                <li
                  key={index}
                  className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-xs text-muted-foreground"
                  title={`Step ${String(index + 1)}: ${step.channel === 'email' ? step.subject || 'Email' : step.whatsappTemplate || 'WhatsApp'}`}
                >
                  <Icon aria-hidden className="size-3" />
                  <span className="sr-only">
                    {step.channel === 'email' ? 'Email' : 'WhatsApp'},{' '}
                  </span>
                  {when}
                </li>
              );
            })}
            {hidden > 0 && <li className="text-xs text-muted-foreground">+{hidden} more</li>}
          </ol>
        ) : (
          <p className="text-xs text-muted-foreground">No steps yet.</p>
        )}
      </CardContent>
      <CardFooter className="justify-between gap-2 border-t bg-muted/30 py-3 text-xs text-muted-foreground">
        <span>{plural(sequence.steps.length, 'step')}</span>
        <span className={cn(sequence.activeEnrollments > 0 && 'font-medium text-foreground')}>
          {plural(sequence.activeEnrollments, 'active enrollment')}
        </span>
        <span className={cn(sequence.active ? 'text-success' : '')}>
          {sequence.active ? 'Active' : 'Inactive'}
        </span>
      </CardFooter>
    </Card>
  );
}
