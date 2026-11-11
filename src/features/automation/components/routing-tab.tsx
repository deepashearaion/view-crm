import { ArrowDown, ArrowUp, Pencil, Plus, Repeat, Route, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAccess, useUserLookup, type User } from '@/features/auth';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/services';

import {
  ASSIGNMENT_CRITERION_LABELS,
  criterionNeedsValue,
  criterionValueLabel,
} from '../constants';
import {
  useAssignmentRules,
  useDeleteAssignmentRule,
  useLeadSettings,
  useUpdateAssignmentRule,
} from '../hooks/use-automation';
import type { AssignmentRule } from '../types';

import { AssignmentRuleDialog } from './assignment-rule-dialog';
import { QueryError, TableSkeleton } from './shared';

interface DialogState {
  open: boolean;
  rule?: AssignmentRule;
}

function RuleUsers({ userIds, lookup }: { userIds: string[]; lookup: Map<string, User> }) {
  if (userIds.length === 0) return <span className="text-muted-foreground">Nobody</span>;
  const names = userIds.map((id) => lookup.get(id)?.name ?? `User #${id}`);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <AvatarGroup>
        {names.slice(0, 3).map((name, index) => (
          <Avatar key={userIds[index]} className="size-6" title={name}>
            <AvatarFallback className="bg-primary/10 text-[0.65rem] font-semibold text-primary">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <div className="min-w-0">
        <p className="truncate">
          {names.length > 2
            ? `${names.slice(0, 2).join(', ')} +${String(names.length - 2)}`
            : names.join(', ')}
        </p>
        {names.length > 1 && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Repeat aria-hidden className="size-3" />
            Round-robin
          </p>
        )}
      </div>
    </div>
  );
}

export function RoutingTab() {
  const canEdit = useAccess().can('settings', 'edit');
  const { data: rules = [], isPending, error, refetch } = useAssignmentRules();
  const { data: settings } = useLeadSettings();
  const lookup = useUserLookup();
  const updateRule = useUpdateAssignmentRule();
  const deleteRule = useDeleteAssignmentRule();
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<AssignmentRule | null>(null);
  const [reordering, setReordering] = useState(false);

  const defaultOwner = settings?.defaultOwnerId ? lookup.get(settings.defaultOwnerId) : undefined;
  const nextPosition = rules.reduce((max, rule) => Math.max(max, rule.position), 0) + 1;

  /** Swaps the rule's position with its neighbour's (one PATCH each). */
  const move = async (index: number, direction: -1 | 1) => {
    const rule = rules[index];
    const neighbour = rules[index + direction];
    if (!rule || !neighbour) return;
    const target = neighbour.position;
    const vacated = rule.position === target ? target - direction : rule.position;
    setReordering(true);
    try {
      await updateRule.mutateAsync({ id: rule.id, body: { position: target } });
      await updateRule.mutateAsync({ id: neighbour.id, body: { position: vacated } });
    } catch (err) {
      toast.error(errorMessage(err, 'Couldn’t reorder the rules.'));
    } finally {
      setReordering(false);
    }
  };

  const addButton = canEdit && (
    <Button
      size="sm"
      onClick={() => {
        setDialog({ open: true });
      }}
    >
      <Plus aria-hidden />
      Add rule
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner routing</CardTitle>
        <CardDescription>
          New leads are checked against these rules from top to bottom; the first active rule that
          matches picks the owner. Leads that match no rule go to the default owner
          {defaultOwner ? ` (${defaultOwner.name})` : ''}, set on the Scoring tab.
        </CardDescription>
        {rules.length > 0 && addButton && <CardAction>{addButton}</CardAction>}
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        {settings && !settings.defaultOwnerId && rules.length > 0 && (
          <InlineAlert tone="info" className="mx-6">
            No default owner is set, so leads that match no rule stay unassigned.
          </InlineAlert>
        )}
        {isPending ? (
          <TableSkeleton label="Loading routing rules" />
        ) : error ? (
          <QueryError
            error={error}
            title="Couldn’t load routing rules"
            onRetry={() => void refetch()}
          />
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Route}
            title="No routing rules yet"
            description={
              defaultOwner
                ? `All new leads go to ${defaultOwner.name}, the default owner. Add rules to route leads by source, channel, destination or temperature.`
                : 'Add rules to assign new leads by source, channel, destination or temperature.'
            }
            className="mx-4 border-none"
            actions={addButton || undefined}
          />
        ) : (
          <Table aria-busy={reordering}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-6">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Applies to</TableHead>
                <TableHead>Assign to</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-40 pr-6">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule, index) => (
                <TableRow key={rule.id} className={cn(!rule.active && 'text-muted-foreground')}>
                  <TableCell className="pl-6 text-muted-foreground tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    {ASSIGNMENT_CRITERION_LABELS[rule.criterion]}
                    {criterionNeedsValue(rule.criterion) && (
                      <span className="font-medium">
                        {' '}
                        {criterionValueLabel(rule.criterion, rule.value)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-64">
                    <RuleUsers userIds={rule.userIds} lookup={lookup} />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.active}
                      aria-label={`${rule.name} active`}
                      disabled={!canEdit || reordering}
                      onCheckedChange={(active) => {
                        updateRule.mutate(
                          { id: rule.id, body: { active } },
                          {
                            onSuccess: () => {
                              toast.success(
                                active ? `${rule.name} turned on.` : `${rule.name} turned off.`,
                              );
                            },
                            onError: (err) => {
                              toast.error(errorMessage(err, 'Couldn’t update the rule.'));
                            },
                          },
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell className="pr-6">
                    {canEdit && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Move ${rule.name} up`}
                          disabled={index === 0 || reordering}
                          onClick={() => void move(index, -1)}
                        >
                          <ArrowUp aria-hidden />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Move ${rule.name} down`}
                          disabled={index === rules.length - 1 || reordering}
                          onClick={() => void move(index, 1)}
                        >
                          <ArrowDown aria-hidden />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${rule.name}`}
                          onClick={() => {
                            setDialog({ open: true, rule });
                          }}
                        >
                          <Pencil aria-hidden />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${rule.name}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setPendingDelete(rule);
                          }}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AssignmentRuleDialog
        open={dialog.open}
        rule={dialog.rule}
        nextPosition={nextPosition}
        onOpenChange={(open) => {
          if (!open) setDialog((current) => ({ ...current, open: false }));
        }}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={`Delete ${pendingDelete?.name ?? 'rule'}?`}
        description="New leads will no longer be routed by this rule. Existing owners don’t change."
        confirmLabel="Delete"
        destructive
        pending={deleteRule.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteRule.mutate(pendingDelete.id, {
            onSuccess: () => {
              toast.success('Routing rule deleted.');
              setPendingDelete(null);
            },
            onError: (err) => {
              toast.error(errorMessage(err, 'Couldn’t delete the rule.'));
            },
          });
        }}
      />
    </Card>
  );
}
