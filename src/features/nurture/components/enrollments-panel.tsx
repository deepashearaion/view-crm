import { UserSearch, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '@/components/data/data-table';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { InlineAlert } from '@/components/feedback/inline-alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserLookup } from '@/features/auth';
import { useContacts } from '@/features/contacts';
import { errorMessage } from '@/services';

import { ENROLLMENT_STATUSES } from '../constants';
import { useNurtureEnrollments, useStopNurtureEnrollment } from '../hooks/use-nurture';
import type { EnrollmentStatus, NurtureEnrollment, NurtureSequence } from '../types';
import { ContactCombobox } from './contact-combobox';
import { getEnrollmentColumns } from './enrollment-columns';

/** The API answers at most 200 rows per page. */
const PAGE_LIMIT = 200;
const ALL = '__all__';

interface EnrollmentsPanelProps {
  /** Known sequences (managers); empty for roles that can't list them. */
  sequences: NurtureSequence[];
  /** Reps may only list enrollments of one contact at a time. */
  requireContact: boolean;
  canEdit: boolean;
}

/** Who is in which sequence, how far along, and why it ended. */
export function EnrollmentsPanel({ sequences, requireContact, canEdit }: EnrollmentsPanelProps) {
  const { data: contacts = [] } = useContacts();
  const users = useUserLookup();
  const stop = useStopNurtureEnrollment();
  const [contactId, setContactId] = useState('');
  const [sequenceId, setSequenceId] = useState('');
  const [status, setStatus] = useState<EnrollmentStatus | ''>('');
  const [pendingStop, setPendingStop] = useState<NurtureEnrollment | null>(null);

  const waitingForContact = requireContact && !contactId;
  const enrollments = useNurtureEnrollments(
    {
      contactId: contactId || undefined,
      sequenceId: sequenceId || undefined,
      status: status || undefined,
      limit: PAGE_LIMIT,
    },
    { enabled: !waitingForContact },
  );

  const contactNames = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact.fullName])),
    [contacts],
  );
  const stepCounts = useMemo(
    () => new Map(sequences.map((sequence) => [sequence.id, sequence.steps.length])),
    [sequences],
  );

  const columns = useMemo(
    () =>
      getEnrollmentColumns({
        contactName: (id) => contactNames.get(id),
        stepCount: (id) => stepCounts.get(id),
        users,
        canEdit,
        onStop: setPendingStop,
      }),
    [contactNames, stepCounts, users, canEdit],
  );

  const rows = enrollments.data ?? [];
  const filtered = Boolean(contactId || sequenceId || status);

  return (
    <div className="space-y-4">
      {rows.length >= PAGE_LIMIT && (
        <InlineAlert tone="info">
          Showing the {PAGE_LIMIT} most recent enrollments. Filter by sequence, status or contact to
          narrow the list.
        </InlineAlert>
      )}
      <DataTable
        label="Enrollments"
        storageKey="nurture-enrollments"
        columns={columns}
        data={waitingForContact ? [] : rows}
        getRowId={(row) => row.id}
        isLoading={!waitingForContact && enrollments.isPending}
        error={enrollments.error}
        onRetry={() => void enrollments.refetch()}
        initialSorting={[{ id: 'enrolledAt', desc: true }]}
        defaultHidden={['enrolledBy', 'finishedAt']}
        toolbar={() => (
          <>
            <ContactCombobox
              contacts={contacts}
              value={contactId}
              onValueChange={setContactId}
              placeholder={requireContact ? 'Pick a contact…' : 'All contacts'}
              clearable
              className="w-full sm:w-56"
            />
            {sequences.length > 0 && (
              <Select
                value={sequenceId || ALL}
                onValueChange={(value) => {
                  setSequenceId(value === ALL ? '' : value);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-48" aria-label="Sequence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All sequences</SelectItem>
                  {sequences.map((sequence) => (
                    <SelectItem key={sequence.id} value={sequence.id}>
                      {sequence.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={status || ALL}
              onValueChange={(value) => {
                setStatus(value === ALL ? '' : (value as EnrollmentStatus));
              }}
            >
              <SelectTrigger className="h-9 w-full sm:w-36" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                {ENROLLMENT_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        emptyState={
          waitingForContact ? (
            <EmptyState
              icon={UserSearch}
              title="Pick a contact"
              description="Choose one of your contacts to see the sequences they’re in."
              className="border-none"
            />
          ) : (
            <EmptyState
              icon={Users}
              title={filtered ? 'No matching enrollments' : 'No enrollments yet'}
              description={
                filtered
                  ? 'Try another sequence, status or contact.'
                  : 'Contacts appear here once a sequence’s trigger fires or someone enrolls them.'
              }
              className="border-none"
            />
          )
        }
      />

      <ConfirmDialog
        open={pendingStop !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStop(null);
        }}
        title="Stop this enrollment?"
        description={
          pendingStop
            ? `${contactNames.get(pendingStop.contactId) ?? 'This contact'} won’t receive any more messages from “${pendingStop.sequenceName}”.`
            : ''
        }
        confirmLabel="Stop"
        destructive
        pending={stop.isPending}
        onConfirm={() => {
          if (!pendingStop) return;
          stop.mutate(pendingStop.id, {
            onSuccess: () => {
              toast.success('Enrollment stopped.');
              setPendingStop(null);
            },
            onError: (error) => {
              toast.error(errorMessage(error, 'Couldn’t stop the enrollment.'));
            },
          });
        }}
      />
    </div>
  );
}
