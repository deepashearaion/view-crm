import { Gauge, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
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
import { cn } from '@/lib/utils';
import { errorMessage } from '@/services';

import { SCORING_CRITERION_LABELS, criterionNeedsValue, criterionValueLabel } from '../constants';
import {
  useDeleteScoringRule,
  useScoringRules,
  useUpdateScoringRule,
} from '../hooks/use-automation';
import type { ScoringRule } from '../types';

import { LeadSettingsCard } from './lead-settings-card';
import { ScoringRuleDialog } from './scoring-rule-dialog';
import { QueryError, TableSkeleton } from './shared';

interface DialogState {
  open: boolean;
  rule?: ScoringRule;
}

function Points({ points }: { points: number }) {
  return (
    <span
      className={cn('font-medium tabular-nums', points > 0 ? 'text-success' : 'text-destructive')}
    >
      {points > 0 ? `+${String(points)}` : `−${String(Math.abs(points))}`}
    </span>
  );
}

function ScoringRulesCard() {
  const { data: rules = [], isPending, error, refetch } = useScoringRules();
  const updateRule = useUpdateScoringRule();
  const deleteRule = useDeleteScoringRule();
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<ScoringRule | null>(null);

  const addButton = (
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
        <CardTitle>Scoring rules</CardTitle>
        <CardDescription>
          Every active rule a lead matches adds (or subtracts) its points.
        </CardDescription>
        {rules.length > 0 && <CardAction>{addButton}</CardAction>}
      </CardHeader>
      <CardContent className="px-0">
        {isPending ? (
          <TableSkeleton label="Loading scoring rules" />
        ) : error ? (
          <QueryError
            error={error}
            title="Couldn’t load scoring rules"
            onRetry={() => void refetch()}
          />
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Gauge}
            title="No scoring rules yet"
            description="Add rules such as “Has an email: +10” so leads are scored and hot ones are followed up quickly."
            className="mx-4 border-none"
            actions={addButton}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Name</TableHead>
                <TableHead>When the lead…</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-24 pr-6">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} className={cn(!rule.active && 'text-muted-foreground')}>
                  <TableCell className="pl-6 font-medium">{rule.name}</TableCell>
                  <TableCell>{SCORING_CRITERION_LABELS[rule.criterion]}</TableCell>
                  <TableCell>
                    {criterionNeedsValue(rule.criterion) ? (
                      criterionValueLabel(rule.criterion, rule.value)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Points points={rule.points} />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.active}
                      aria-label={`${rule.name} active`}
                      disabled={updateRule.isPending && updateRule.variables.id === rule.id}
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
                    <div className="flex justify-end">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ScoringRuleDialog
        open={dialog.open}
        rule={dialog.rule}
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
        description="Leads will no longer be scored with this rule."
        confirmLabel="Delete"
        destructive
        pending={deleteRule.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteRule.mutate(pendingDelete.id, {
            onSuccess: () => {
              toast.success('Scoring rule deleted.');
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

export function ScoringTab() {
  return (
    <div className="space-y-6">
      <LeadSettingsCard />
      <ScoringRulesCard />
    </div>
  );
}
