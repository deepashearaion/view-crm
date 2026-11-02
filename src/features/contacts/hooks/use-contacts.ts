import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  batch,
  createContact,
  deleteContact,
  fetchContact,
  fetchContacts,
  updateContact,
} from '../api/contacts';
import { contactKeys } from '../constants';
import type { Contact, ContactWriteDto } from '../types';

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
    queryClient.setQueryData<Contact[]>(contactKeys.list(), (contacts = []) => {
      const exists = contacts.some((item) => item.id === contact.id);
      return exists
        ? contacts.map((item) => (item.id === contact.id ? contact : item))
        : [contact, ...contacts];
    });
    queryClient.setQueryData(contactKeys.detail(contact.id), contact);
  };
}

export function useCreateContact() {
  const upsert = useUpsertInList();
  return useMutation({ mutationFn: createContact, onSuccess: upsert });
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
      batch(ids, (id) => updateContact(id, body)),
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
