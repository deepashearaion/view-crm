import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { UserChip } from '@/components/data/user-chip';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useSessionUser, useUserLookup } from '@/features/auth';
import { formatDateTime } from '@/lib/format';
import { errorMessage } from '@/services';

import { contactToFormValues, formValuesToDto } from '../api/form-mapping';
import {
  useContact,
  useCreateContact,
  useDeleteContacts,
  useUpdateContact,
} from '../hooks/use-contacts';
import { contactFormSchema } from '../schemas';
import type { Contact, ContactFormOutput, ContactFormValues } from '../types';

import { ContactForm } from './contact-form';
import { LeadStatusBadge } from './lead-status-badge';

export type ContactSheetState =
  { mode: 'closed' } | { mode: 'create' } | { mode: 'view' | 'edit'; id: string };

interface ContactSheetProps {
  state: ContactSheetState;
  onStateChange: (state: ContactSheetState) => void;
}

const FORM_ID = 'contact-form';

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">
        {children === '' || children === null || children === undefined ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}

function ContactDetails({ contact }: { contact: Contact }) {
  const users = useUserLookup();
  const trip = Object.entries(contact.trip ?? {}).filter(([, value]) => Boolean(value));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {contact.mobile && (
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${contact.mobile.replace(/\s/g, '')}`}>
              <Phone aria-hidden />
              Call
            </a>
          </Button>
        )}
        {contact.email && (
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${contact.email}`}>
              <Mail aria-hidden />
              Email
            </a>
          </Button>
        )}
      </div>
      <dl className="divide-y">
        <Detail label="Email">{contact.email}</Detail>
        <Detail label="Mobile">{contact.mobile}</Detail>
        <Detail label="Alternate">{contact.alternateMobile}</Detail>
        <Detail label="Lead owner">
          <UserChip name={contact.leadOwnerId ? users.get(contact.leadOwnerId)?.name : undefined} />
        </Detail>
        <Detail label="Source">{contact.source}</Detail>
        <Detail label="Destination">{contact.destination}</Detail>
        <Detail label="Company ID">{contact.companyId ?? ''}</Detail>
        <Detail label="Created">{formatDateTime(contact.createdAt)}</Detail>
        <Detail label="Modified">{formatDateTime(contact.updatedAt)}</Detail>
      </dl>
      {contact.notes && (
        <section className="space-y-1.5">
          <h3 className="text-sm font-medium">Notes</h3>
          <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">{contact.notes}</p>
        </section>
      )}
      {trip.length > 0 && (
        <section className="space-y-1.5">
          <h3 className="text-sm font-medium">Trip details</h3>
          <dl className="divide-y rounded-lg border px-3">
            {trip.map(([key, value]) => (
              <Detail
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
              >
                {value}
              </Detail>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

export function ContactSheet({ state, onStateChange }: ContactSheetProps) {
  const sessionUser = useSessionUser();
  const contactId = state.mode === 'view' || state.mode === 'edit' ? state.id : null;
  const contactQuery = useContact(contactId);
  const contact = contactQuery.data;
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContacts = useDeleteContacts();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const defaultOwner = sessionUser?.id === undefined ? '' : String(sessionUser.id);
  const form = useForm<ContactFormValues, unknown, ContactFormOutput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactToFormValues(undefined, defaultOwner),
  });

  const isEditing = state.mode === 'edit' || state.mode === 'create';

  // Load the record into the form whenever the sheet switches to editing/creating.
  useEffect(() => {
    if (state.mode === 'create') form.reset(contactToFormValues(undefined, defaultOwner));
    if (state.mode === 'edit' && contact) form.reset(contactToFormValues(contact));
  }, [state.mode, contact, defaultOwner, form]);

  const close = () => {
    onStateChange({ mode: 'closed' });
  };

  const mutation = state.mode === 'create' ? createContact : updateContact;

  const onSubmit = form.handleSubmit((values) => {
    const body = formValuesToDto(values);
    if (state.mode === 'create') {
      createContact.mutate(body, {
        onSuccess: (created) => {
          toast.success(`${created.fullName} added to contacts.`);
          onStateChange({ mode: 'view', id: created.id });
        },
      });
    } else if (state.mode === 'edit') {
      updateContact.mutate(
        { id: state.id, body },
        {
          onSuccess: (updated) => {
            toast.success('Contact updated.');
            onStateChange({ mode: 'view', id: updated.id });
          },
        },
      );
    }
  });

  const handleDelete = () => {
    if (!contactId) return;
    deleteContacts.mutate([contactId], {
      onSuccess: ({ failed }) => {
        setConfirmDelete(false);
        if (failed.length) {
          toast.error('Couldn’t delete this contact. Please try again.');
          return;
        }
        toast.success('Contact deleted.');
        close();
      },
    });
  };

  const title =
    state.mode === 'create'
      ? 'New contact'
      : (contact?.fullName ?? (contactQuery.isPending ? 'Loading…' : 'Contact'));

  return (
    <>
      <Sheet
        open={state.mode !== 'closed'}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="border-b p-6 pr-12">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-lg">{title}</SheetTitle>
              {contact && state.mode === 'view' && (
                <LeadStatusBadge statusId={contact.leadStatusId} />
              )}
            </div>
            <SheetDescription>
              {state.mode === 'create'
                ? 'Add a person to your CRM.'
                : state.mode === 'edit'
                  ? 'Update the contact’s details.'
                  : contact
                    ? `Added ${formatDateTime(contact.createdAt)}`
                    : ' '}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1">
            <div className="p-6">
              {contactQuery.isError && state.mode !== 'create' ? (
                <InlineAlert>
                  {errorMessage(contactQuery.error, 'Couldn’t load this contact.')}
                </InlineAlert>
              ) : isEditing ? (
                <form
                  id={FORM_ID}
                  onSubmit={(event) => void onSubmit(event)}
                  noValidate
                  className="space-y-6"
                >
                  {mutation.isError && (
                    <InlineAlert>
                      {errorMessage(mutation.error, 'Couldn’t save the contact.')}
                    </InlineAlert>
                  )}
                  <ContactForm control={form.control} />
                </form>
              ) : contact ? (
                <ContactDetails contact={contact} />
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-6" />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />
          <SheetFooter className="flex-row justify-between gap-2 p-4">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (state.mode === 'edit') onStateChange({ mode: 'view', id: state.id });
                    else close();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" form={FORM_ID} disabled={mutation.isPending}>
                  {mutation.isPending
                    ? 'Saving…'
                    : state.mode === 'create'
                      ? 'Create contact'
                      : 'Save changes'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={!contact}
                  onClick={() => {
                    setConfirmDelete(true);
                  }}
                >
                  <Trash2 aria-hidden />
                  Delete
                </Button>
                <Button
                  disabled={!contact}
                  onClick={() => {
                    if (contactId) onStateChange({ mode: 'edit', id: contactId });
                  }}
                >
                  <Pencil aria-hidden />
                  Edit
                </Button>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this contact?"
        description={`${contact?.fullName ?? 'This contact'} will be permanently removed. This can’t be undone.`}
        confirmLabel="Delete"
        destructive
        pending={deleteContacts.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
