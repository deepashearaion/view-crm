import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Pencil, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { toast } from 'sonner';

import { UserChip } from '@/components/data/user-chip';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccess, useUserLookup } from '@/features/auth';
import { useCompanyLookup } from '@/features/companies';
import type { RecordSheetState } from '@/hooks/use-record-sheet-state';
import { formatDateTime } from '@/lib/format';
import { applyProblem, errorMessage } from '@/services';

import { contactToFormValues, formValuesToDto, formValuesToLead } from '../api/form-mapping';
import { leadErrorMessage } from '../api/lead-intake';
import { LIFECYCLE_STAGES, temperatureLabel } from '../constants';
import {
  useContact,
  useCreateLead,
  useDeleteContacts,
  useRescoreContact,
  useSetLifecycleStage,
  useUpdateContact,
  type CreateLeadResult,
} from '../hooks/use-contacts';
import { contactFormSchema } from '../schemas';
import type { Contact, ContactFormOutput, ContactFormValues, LifecycleStage } from '../types';

import { LifecycleStageBadge, OptedOutBadge, TemperatureBadge } from './contact-badges';
import { ContactForm } from './contact-form';
import { ContactTimeline } from './contact-timeline';
import { LeadStatusBadge } from './lead-status-badge';

export type ContactSheetState = RecordSheetState;

interface ContactSheetProps {
  state: ContactSheetState;
  onStateChange: (state: ContactSheetState) => void;
}

const FORM_ID = 'contact-form';

/** API field → form field, for problem+json field errors. */
const FIELD_MAP: Record<string, FieldPath<ContactFormValues>> = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  mobile: 'mobile',
  alternate_mobile: 'alternateMobile',
  company_id: 'companyId',
  lead_status_id: 'leadStatusId',
  lead_owner_id: 'leadOwnerId',
  destination: 'destination',
  source: 'source',
  notes: 'notes',
};

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-center gap-3 py-2 text-sm">
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

function LifecycleStageSelect({ contact }: { contact: Contact }) {
  const setStage = useSetLifecycleStage();
  return (
    <Select
      value={contact.lifecycleStage}
      disabled={setStage.isPending}
      onValueChange={(value) => {
        setStage.mutate(
          { id: contact.id, stage: value as LifecycleStage },
          {
            onSuccess: (updated) => {
              toast.success(
                `Lifecycle stage set to ${LIFECYCLE_STAGES.find((s) => s.id === updated.lifecycleStage)?.label ?? updated.lifecycleStage}.`,
              );
            },
            onError: (error) => {
              toast.error(errorMessage(error, 'Couldn’t change the lifecycle stage.'));
            },
          },
        );
      }}
    >
      <SelectTrigger size="sm" aria-label="Lifecycle stage">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LIFECYCLE_STAGES.map((stage) => (
          <SelectItem key={stage.id} value={stage.id}>
            <LifecycleStageBadge stage={stage.id} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ContactDetails({ contact, canEdit }: { contact: Contact; canEdit: boolean }) {
  const users = useUserLookup();
  const companies = useCompanyLookup();
  const rescore = useRescoreContact();
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
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            disabled={rescore.isPending}
            onClick={() => {
              rescore.mutate(contact.id, {
                onSuccess: ({ lead }) => {
                  toast.success(
                    `Re-scored: ${String(lead.score)} (${temperatureLabel(lead.temperature)}).`,
                  );
                },
                onError: (error) => {
                  toast.error(errorMessage(error, 'Couldn’t re-score this contact.'));
                },
              });
            }}
          >
            <RefreshCw aria-hidden className={rescore.isPending ? 'animate-spin' : undefined} />
            Re-score
          </Button>
        )}
      </div>
      <dl className="divide-y">
        <Detail label="Lifecycle stage">
          {canEdit ? (
            <LifecycleStageSelect contact={contact} />
          ) : (
            <LifecycleStageBadge stage={contact.lifecycleStage} />
          )}
        </Detail>
        <Detail label="Lead score">
          <TemperatureBadge contact={contact} />
        </Detail>
        <Detail label="Email">{contact.email}</Detail>
        <Detail label="Mobile">{contact.mobile}</Detail>
        <Detail label="Alternate">{contact.alternateMobile}</Detail>
        <Detail label="Lead owner">
          <UserChip name={contact.leadOwnerId ? users.get(contact.leadOwnerId)?.name : undefined} />
        </Detail>
        <Detail label="Source">{contact.source}</Detail>
        <Detail label="Destination">{contact.destination}</Detail>
        <Detail label="Company">
          {contact.companyId === null
            ? ''
            : (companies.get(String(contact.companyId))?.name ?? `#${String(contact.companyId)}`)}
        </Detail>
        <Detail label="Marketing">
          {contact.optedOutAt ? `Opted out ${formatDateTime(contact.optedOutAt)}` : 'Subscribed'}
        </Detail>
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

function toastLeadResult({ lead, contact, followUpError }: CreateLeadResult) {
  const scoreLine = `Score ${String(lead.score)} · ${temperatureLabel(lead.temperature)}`;
  if (lead.created)
    toast.success(`${contact.fullName} added to contacts.`, { description: scoreLine });
  else
    toast.info(`Merged with existing contact ${contact.fullName}.`, {
      description: `${scoreLine}. Owner, status, company and alternate mobile weren’t changed.`,
    });
  if (followUpError)
    toast.warning('The lead was saved, but some fields couldn’t be updated.', {
      description: errorMessage(followUpError),
    });
}

export function ContactSheet({ state, onStateChange }: ContactSheetProps) {
  const access = useAccess();
  const canCreate = access.can('contacts', 'create');
  const canEdit = access.can('contacts', 'edit');
  const canDelete = access.can('contacts', 'delete');
  // Picking an owner other than yourself needs org-wide create (new) or edit (existing) access.
  const canReassign =
    state.mode === 'create'
      ? access.canAll('contacts', 'create')
      : access.canAll('contacts', 'edit');
  const contactId = state.mode === 'view' || state.mode === 'edit' ? state.id : null;
  const contactQuery = useContact(contactId);
  const contact = contactQuery.data;
  const createLead = useCreateLead();
  const updateContact = useUpdateContact();
  const deleteContacts = useDeleteContacts();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm<ContactFormValues, unknown, ContactFormOutput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactToFormValues(),
  });

  const isEditing = (state.mode === 'edit' && canEdit) || (state.mode === 'create' && canCreate);
  const showViewActions = !isEditing && state.mode !== 'create' && (canEdit || canDelete);

  // Load the record into the form whenever the sheet switches to editing/creating.
  useEffect(() => {
    if (state.mode === 'create') form.reset(contactToFormValues());
    if (state.mode === 'edit' && contact) form.reset(contactToFormValues(contact));
  }, [state.mode, contact, form]);

  const close = () => {
    onStateChange({ mode: 'closed' });
  };

  const mutation = state.mode === 'create' ? createLead : updateContact;
  const mutationError =
    leadErrorMessage(mutation.error) ?? errorMessage(mutation.error, 'Couldn’t save the contact.');

  const onError = (error: Error) => {
    applyProblem(
      error,
      (field, fieldError) => {
        form.setError(field as FieldPath<ContactFormValues>, fieldError);
      },
      FIELD_MAP,
    );
  };

  const onSubmit = form.handleSubmit((values) => {
    if (state.mode === 'create') {
      createLead.mutate(formValuesToLead(values), {
        onSuccess: (result) => {
          toastLeadResult(result);
          onStateChange({ mode: 'view', id: result.contact.id });
        },
        onError,
      });
    } else if (state.mode === 'edit') {
      const body = formValuesToDto(values);
      // Without org-wide edit access the owner can't change: leave it untouched.
      if (!canReassign) delete body.lead_owner_id;
      updateContact.mutate(
        { id: state.id, body },
        {
          onSuccess: (updated) => {
            toast.success('Contact updated.');
            onStateChange({ mode: 'view', id: updated.id });
          },
          onError,
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
              {contact && !isEditing && (
                <>
                  <LeadStatusBadge statusId={contact.leadStatusId} />
                  {contact.temperature && <TemperatureBadge contact={contact} />}
                  <OptedOutBadge optedOutAt={contact.optedOutAt} />
                </>
              )}
            </div>
            <SheetDescription>
              {state.mode === 'create'
                ? 'Add a lead. It’s scored, routed and merged with any contact that has the same email or mobile.'
                : isEditing
                  ? 'Update the contact’s details.'
                  : contact
                    ? `Added ${formatDateTime(contact.createdAt)}`
                    : ' '}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1">
            <div className="p-6">
              {state.mode === 'create' && !canCreate ? (
                <InlineAlert>You don’t have permission to add contacts.</InlineAlert>
              ) : contactQuery.isError && state.mode !== 'create' ? (
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
                  {mutation.isError && <InlineAlert>{mutationError}</InlineAlert>}
                  <ContactForm
                    control={form.control}
                    canReassign={canReassign}
                    isCreate={state.mode === 'create'}
                  />
                </form>
              ) : contact ? (
                // Keyed so each newly opened contact starts on Details.
                <Tabs key={contact.id} defaultValue="details" className="gap-4">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <ContactDetails contact={contact} canEdit={canEdit} />
                  </TabsContent>
                  <TabsContent value="activity">
                    <ContactTimeline contactId={contact.id} canEdit={canEdit} />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-6" />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {(isEditing || showViewActions) && (
            <>
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
                    {canDelete ? (
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
                    ) : (
                      <span />
                    )}
                    {canEdit && (
                      <Button
                        disabled={!contact}
                        onClick={() => {
                          if (contactId) onStateChange({ mode: 'edit', id: contactId });
                        }}
                      >
                        <Pencil aria-hidden />
                        Edit
                      </Button>
                    )}
                  </>
                )}
              </SheetFooter>
            </>
          )}
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
