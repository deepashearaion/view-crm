import { AlertTriangle, Lock, Plus, Repeat, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/data/page-header';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccess } from '@/features/auth';
import { useRecordSheetState } from '@/hooks/use-record-sheet-state';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

import { NURTURE_PROBLEM_CODES, nurtureProblemCode, triggerLabel } from '../constants';
import { EnrollContactDialog } from '../components/enroll-contact-dialog';
import { EnrollmentsPanel } from '../components/enrollments-panel';
import { SequenceCard } from '../components/sequence-card';
import { SequenceSheet } from '../components/sequence-sheet';
import {
  useDeleteNurtureSequence,
  useNurtureSequences,
  useUpdateNurtureSequence,
} from '../hooks/use-nurture';
import type { NurtureSequence } from '../types';

type Tab = 'sequences' | 'enrollments';

const DESCRIPTION = 'Automatic email and WhatsApp cadences; replies re-score the lead.';

export default function NurturePage({ createOnMount = false }: { createOnMount?: boolean }) {
  const navigate = useNavigate();
  const access = useAccess();
  const canView = access.can('nurture', 'view');
  // Managing sequences needs org-wide access; enrolling and stopping work on own contacts too.
  const canCreateSequence = access.canAll('nurture', 'create');
  const canEditSequence = access.canAll('nurture', 'edit');
  const canDeleteSequence = access.canAll('nurture', 'delete');
  const canEnroll = access.can('nurture', 'create');
  const canStop = access.can('nurture', 'edit');
  // `own` view scope: enrollments must be listed per contact.
  const requireContact = access.scope('nurture', 'view') === 'own';
  const sequencesQuery = useNurtureSequences({ enabled: access.ready && canView });
  const sequences = sequencesQuery.data ?? [];
  const toggle = useUpdateNurtureSequence();
  const deleteSequence = useDeleteNurtureSequence();

  const [tab, setTab] = useState<Tab>('sequences');
  const [pendingDelete, setPendingDelete] = useState<NurtureSequence | null>(null);
  const [enrollFor, setEnrollFor] = useState<{ sequenceId?: string } | null>(null);
  const [sheetState, setSheetState] = useRecordSheetState({
    param: 'sequence',
    createOnMount: canCreateSequence && createOnMount,
    listPath: paths.nurture,
  });

  const newSequence = () => {
    void navigate(`${paths.nurture}/new`);
  };

  const toggleActive = (sequence: NurtureSequence, active: boolean) => {
    toggle.mutate(
      { id: sequence.id, body: { active } },
      {
        onSuccess: () => {
          toast.success(active ? `“${sequence.name}” is active.` : `“${sequence.name}” paused.`);
        },
        onError: (error) => {
          toast.error(
            nurtureProblemCode(error) === NURTURE_PROBLEM_CODES.triggerTaken
              ? `Another active sequence already uses the “${triggerLabel(sequence.trigger)}” trigger. Deactivate it first.`
              : errorMessage(error, 'Couldn’t update the sequence.'),
          );
        },
      },
    );
  };

  if (!canView) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
        <PageHeader
          title="Nurture sequences"
          badges={<WorkflowBadge kind="ai" />}
          description={DESCRIPTION}
        />
        {access.ready && (
          <EmptyState
            icon={Lock}
            title="You don’t have access to nurture sequences"
            description="Ask an admin if you need to see sequences or enrollments."
            className="py-8"
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Nurture sequences"
        badges={<WorkflowBadge kind="ai" />}
        description={DESCRIPTION}
        actions={
          <>
            {canEnroll && (
              <Button
                variant="outline"
                disabled={!sequences.length}
                onClick={() => {
                  setEnrollFor({});
                }}
              >
                <UserPlus aria-hidden />
                Enroll contact
              </Button>
            )}
            {canCreateSequence && (
              <Button onClick={newSequence}>
                <Plus aria-hidden />
                New sequence
              </Button>
            )}
          </>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as Tab);
        }}
      >
        <TabsList>
          <TabsTrigger value="sequences" className="gap-2">
            Sequences
            <Badge variant="secondary" className="h-4.5 min-w-5 px-1.5 tabular-nums">
              {sequences.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>

        <TabsContent value="sequences" className="mt-4">
          {sequencesQuery.isPending ? (
            <div
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              aria-busy="true"
              aria-label="Loading sequences"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : sequencesQuery.isError ? (
            <EmptyState
              icon={AlertTriangle}
              title="Couldn’t load sequences"
              description={errorMessage(sequencesQuery.error)}
              actions={
                <Button variant="outline" onClick={() => void sequencesQuery.refetch()}>
                  Try again
                </Button>
              }
            />
          ) : sequences.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title="No sequences yet"
              description="Create a cadence of emails and WhatsApp messages that runs automatically for new leads, lost or won deals, or contacts you enroll by hand."
              actions={
                canCreateSequence && (
                  <Button onClick={newSequence}>
                    <Plus aria-hidden />
                    New sequence
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sequences.map((sequence) => (
                <SequenceCard
                  key={sequence.id}
                  sequence={sequence}
                  togglePending={toggle.isPending && toggle.variables.id === sequence.id}
                  canEdit={canEditSequence}
                  canEnroll={canEnroll}
                  canDelete={canDeleteSequence}
                  onToggleActive={(active) => {
                    toggleActive(sequence, active);
                  }}
                  onEdit={() => {
                    setSheetState({ mode: 'edit', id: sequence.id });
                  }}
                  onEnroll={() => {
                    setEnrollFor({ sequenceId: sequence.id });
                  }}
                  onDelete={() => {
                    setPendingDelete(sequence);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrollments" className="mt-4">
          <EnrollmentsPanel
            sequences={sequences}
            requireContact={requireContact}
            canEdit={canStop}
          />
        </TabsContent>
      </Tabs>

      {(canCreateSequence || canEditSequence) && (
        <SequenceSheet state={sheetState} onStateChange={setSheetState} />
      )}

      {canEnroll && (
        <EnrollContactDialog
          open={enrollFor !== null}
          onOpenChange={(open) => {
            if (!open) setEnrollFor(null);
          }}
          sequences={sequences}
          defaultSequenceId={enrollFor?.sequenceId}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={`Delete “${pendingDelete?.name ?? ''}”?`}
        description={
          pendingDelete && pendingDelete.activeEnrollments > 0
            ? `It still has ${String(pendingDelete.activeEnrollments)} active ${pendingDelete.activeEnrollments === 1 ? 'enrollment' : 'enrollments'}. The sequence and its steps are permanently removed.`
            : 'The sequence and its steps are permanently removed.'
        }
        confirmLabel="Delete"
        destructive
        pending={deleteSequence.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteSequence.mutate(pendingDelete.id, {
            onSuccess: () => {
              toast.success('Sequence deleted.');
              setPendingDelete(null);
            },
            onError: (error) => {
              toast.error(errorMessage(error, 'Couldn’t delete the sequence.'));
            },
          });
        }}
      />
    </div>
  );
}
