import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelInvoice,
  createInvoice,
  deleteInvoice,
  fetchAllInvoices,
  fetchInvoice,
  fetchInvoices,
  issueInvoice,
  sendInvoice,
  updateInvoice,
} from '../api/invoices';
import { invoiceKeys } from '../constants';
import type { Invoice, InvoiceFilters, InvoicePatchDto } from '../types';

export function useInvoices(filters: InvoiceFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: ({ signal }) => fetchInvoices(filters, signal),
    enabled: options.enabled,
  });
}

/** Every visible invoice (all pages; all statuses unless filtered). */
export function useAllInvoices(
  filters: Omit<InvoiceFilters, 'limit' | 'offset'> = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...invoiceKeys.list(filters), 'all'],
    queryFn: ({ signal }) => fetchAllInvoices(filters, signal),
    enabled: options.enabled,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: invoiceKeys.detail(id ?? ''),
    queryFn: ({ signal }) => fetchInvoice(id ?? '', signal),
    enabled: Boolean(id),
  });
}

/** Writes the returned invoice into its detail cache and refetches every list. */
function useSetInvoice() {
  const queryClient = useQueryClient();
  return (invoice: Invoice) => {
    queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice);
    return queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
  };
}

export function useCreateInvoice() {
  const setInvoice = useSetInvoice();
  return useMutation({ mutationFn: createInvoice, onSuccess: setInvoice });
}

export function useUpdateInvoice() {
  const setInvoice = useSetInvoice();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: InvoicePatchDto }) => updateInvoice(id, body),
    onSuccess: setInvoice,
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: invoiceKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useIssueInvoice() {
  const setInvoice = useSetInvoice();
  return useMutation({ mutationFn: issueInvoice, onSuccess: setInvoice });
}

export function useSendInvoice() {
  const setInvoice = useSetInvoice();
  return useMutation({ mutationFn: sendInvoice, onSuccess: setInvoice });
}

export function useCancelInvoice() {
  const setInvoice = useSetInvoice();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelInvoice(id, reason),
    onSuccess: setInvoice,
  });
}
