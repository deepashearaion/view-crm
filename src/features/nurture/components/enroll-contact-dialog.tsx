import { useState } from 'react';
import { toast } from 'sonner';

import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContacts } from '@/features/contacts';
import { errorMessage } from '@/services';

import { NURTURE_PROBLEM_CODES, nurtureProblemCode, triggerLabel } from '../constants';
import { useEnrollContact } from '../hooks/use-nurture';
import type { NurtureSequence } from '../types';
import { ContactCombobox } from './contact-combobox';

interface EnrollContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequences: NurtureSequence[];
  /** Preselected sequence, e.g. when opened from a sequence card. */
  defaultSequenceId?: string;
}

/** Adds one contact to a sequence by hand. */
export function EnrollContactDialog({
  open,
  onOpenChange,
  sequences,
  defaultSequenceId,
}: EnrollContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Content unmounts when closed, so every opening starts with a fresh form. */}
        <EnrollContactForm
          onDone={() => {
            onOpenChange(false);
          }}
          sequences={sequences}
          defaultSequenceId={defaultSequenceId}
        />
      </DialogContent>
    </Dialog>
  );
}

function EnrollContactForm({
  onDone,
  sequences,
  defaultSequenceId,
}: {
  onDone: () => void;
  sequences: NurtureSequence[];
  defaultSequenceId: string | undefined;
}) {
  const { data: contacts = [], isPending: contactsLoading } = useContacts();
  const enroll = useEnrollContact();
  const [contactId, setContactId] = useState('');
  const [sequenceId, setSequenceId] = useState(defaultSequenceId ?? '');
  const [submitted, setSubmitted] = useState(false);

  const contact = contacts.find((item) => item.id === contactId);
  const sequence = sequences.find((item) => item.id === sequenceId);
  const alreadyEnrolled =
    nurtureProblemCode(enroll.error) === NURTURE_PROBLEM_CODES.alreadyEnrolled;

  const submit = () => {
    setSubmitted(true);
    if (!contactId || !sequenceId) return;
    enroll.mutate(
      { sequenceId, contactId },
      {
        onSuccess: () => {
          toast.success(
            `${contact?.fullName ?? 'Contact'} enrolled in “${sequence?.name ?? 'the sequence'}”.`,
          );
          onDone();
        },
      },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Enroll a contact</DialogTitle>
        <DialogDescription>
          The first step runs after its delay. Messages are held overnight (21:00–09:00 IST).
        </DialogDescription>
      </DialogHeader>
      <form
        id="enroll-contact-form"
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {enroll.isError && (
          <InlineAlert>
            {alreadyEnrolled
              ? `${contact?.fullName ?? 'This contact'} is already enrolled in “${sequence?.name ?? 'this sequence'}”.`
              : errorMessage(enroll.error, 'Couldn’t enroll the contact.')}
          </InlineAlert>
        )}
        <FieldGroup>
          <Field data-invalid={submitted && !contactId}>
            <FieldLabel htmlFor="enroll-contact">Contact</FieldLabel>
            <ContactCombobox
              id="enroll-contact"
              contacts={contacts}
              value={contactId}
              onValueChange={(id) => {
                setContactId(id);
                enroll.reset();
              }}
              placeholder={contactsLoading ? 'Loading contacts…' : 'Pick a contact…'}
              invalid={submitted && !contactId}
            />
            {submitted && !contactId && <FieldError>Pick a contact.</FieldError>}
          </Field>
          <Field data-invalid={submitted && !sequenceId}>
            <FieldLabel htmlFor="enroll-sequence">Sequence</FieldLabel>
            <Select
              value={sequenceId}
              onValueChange={(id) => {
                setSequenceId(id);
                enroll.reset();
              }}
            >
              <SelectTrigger
                id="enroll-sequence"
                className="h-9 w-full"
                aria-invalid={submitted && !sequenceId}
              >
                <SelectValue placeholder="Pick a sequence…" />
              </SelectTrigger>
              <SelectContent>
                {sequences.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                    <span className="text-xs text-muted-foreground">
                      {triggerLabel(item.trigger)}
                      {item.active ? '' : ' · inactive'}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sequence && !sequence.active && (
              <FieldDescription>
                This sequence is inactive: nothing is sent until it’s switched on.
              </FieldDescription>
            )}
            {submitted && !sequenceId && <FieldError>Pick a sequence.</FieldError>}
          </Field>
        </FieldGroup>
      </form>
      <DialogFooter>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" form="enroll-contact-form" disabled={enroll.isPending}>
          {enroll.isPending ? 'Enrolling…' : 'Enroll'}
        </Button>
      </DialogFooter>
    </>
  );
}
