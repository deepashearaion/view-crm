import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  batch,
  createContact,
  deleteContact,
  fetchContact,
  fetchContacts,
  fetchTimeline,
  logActivity,
  patchContact,
  setLifecycleStage,
  updateContact,
} from '../api/contacts';
import { createLead, rescoreLead } from '../api/lead-intake';
import { contactKeys, TIMELINE_PAGE_SIZE } from '../constants';
import type {
  ActivityRequest,
  Contact,
  ContactWriteDto,
  LeadRequest,
  LeadResult,
  LifecycleStage,
} from '../types';

export function useContacts() {
  return useQuery({
    queryKey: contactKeys.list(),
    queryFn: ({ signal }) => fetchContacts(signal),
  });
}

export function useContact(id: string | null) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: contactKeys.detail(id ?? ''),
    queryFn: ({ signal }) => fetchContact(id ?? '', signal),
    enabled: id !== null,
    // Show the row from the list instantly while the detail request runs.
    initialData: () =>
      queryClient.getQueryData<Contact[]>(contactKeys.list())?.find((contact) => contact.id === id),
  });
}

function useUpsertInList() {
  const queryClient = useQueryClient();
  return (contact: Contact) => {
    queryClient.setQueryData<Contact[]>(contactKeys.list(), (contacts) => {
      if (!contacts) return contacts;
      const exists = contacts.some((item) => item.id === contact.id);
      return exists
        ? contacts.map((item) => (item.id === contact.id ? contact : item))
        : [contact, ...contacts];
    });
    queryClient.setQueryData(contactKeys.detail(contact.id), contact);
  };
}

/** Legacy POST /api/contacts (no scoring/routing). Prefer useCreateLead for new contacts. */
export function useCreateContact() {
  const upsert = useUpsertInList();
  return useMutation({ mutationFn: createContact, onSuccess: upsert });
}

export interface CreateLeadResult {
  lead: LeadResult;
  contact: Contact;
  /** Set when the lead was saved but the follow-up PATCH for the extra fields failed. */
  followUpError?: unknown;
}

/**
 * Lead intake from the contact form: POST /api/v1/leads, then a legacy PATCH for the fields the
 * leads endpoint doesn't take (only for newly created contacts, never for a merge), then reload
 * the contact from /api/v1 so score and lifecycle are current.
 */
export function useCreateLead() {
  const upsert = useUpsertInList();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lead: body,
      followUp,
    }: {
      lead: LeadRequest;
      followUp: ContactWriteDto | null;
    }): Promise<CreateLeadResult> => {
      const lead = await createLead(body);
      let followUpError: unknown;
      if (lead.created && followUp) {
        try {
          await patchContact(lead.contactId, followUp);
        } catch (error) {
          followUpError = error;
        }
      }
      const contact = await fetchContact(lead.contactId);
      return { lead, contact, followUpError };
    },
    onSuccess: ({ contact }) => {
      upsert(contact);
      void queryClient.invalidateQueries({ queryKey: contactKeys.timeline(contact.id) });
    },
  });
}

export function useUpdateContact() {
  const upsert = useUpsertInList();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ContactWriteDto }) => updateContact(id, body),
    onSuccess: upsert,
  });
}

/** Applies the same partial update to many contacts (bulk status / owner change). */
export function useBulkUpdateContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, body }: { ids: string[]; body: ContactWriteDto }) =>
      batch(ids, (id) => patchContact(id, body)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

export function useDeleteContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => batch(ids, deleteContact),
    onSuccess: ({ succeeded }) => {
      const removed = new Set(succeeded);
      queryClient.setQueryData<Contact[]>(contactKeys.list(), (contacts) =>
        contacts?.filter((contact) => !removed.has(contact.id)),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}

/** POST /api/v1/leads/{id}/rescore, then reload the contact. */
export function useRescoreContact() {
  const upsert = useUpsertInList();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const lead = await rescoreLead(id);
      const contact = await fetchContact(id);
      return { lead, contact };
    },
    onSuccess: ({ contact }) => {
      upsert(contact);
      void queryClient.invalidateQueries({ queryKey: contactKeys.timeline(contact.id) });
    },
  });
}

export function useSetLifecycleStage() {
  const upsert = useUpsertInList();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: LifecycleStage }) =>
      setLifecycleStage(id, stage),
    onSuccess: (contact) => {
      upsert(contact);
      void queryClient.invalidateQueries({ queryKey: contactKeys.timeline(contact.id) });
    },
  });
}

/** Contact activity timeline, newest first, paged with `before_id`. */
export function useContactTimeline(id: string | null) {
  return useInfiniteQuery({
    queryKey: contactKeys.timeline(id ?? ''),
    queryFn: ({ pageParam, signal }) => fetchTimeline(id ?? '', pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length < TIMELINE_PAGE_SIZE ? undefined : lastPage.at(-1)?.id,
    enabled: id !== null,
  });
}

export function useLogActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ActivityRequest }) => logActivity(id, body),
    onSuccess: (_activity, { id }) =>
      queryClient.invalidateQueries({ queryKey: contactKeys.timeline(id) }),
  });
}
