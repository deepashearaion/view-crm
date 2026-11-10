import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createNurtureSequence,
  deleteNurtureSequence,
  enrollContact,
  fetchNurtureEnrollments,
  fetchNurtureSequence,
  fetchNurtureSequences,
  stopNurtureEnrollment,
  unsubscribe,
  updateNurtureSequence,
} from '../api/nurture';
import { nurtureKeys } from '../constants';
import type { NurtureEnrollmentFilters, NurtureSequence, NurtureSequencePatchDto } from '../types';

export function useNurtureSequences(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: nurtureKeys.sequenceList(),
    queryFn: ({ signal }) => fetchNurtureSequences(signal),
    enabled: options.enabled,
  });
}

export function useNurtureSequence(id: string | undefined) {
  return useQuery({
    queryKey: nurtureKeys.sequenceDetail(id ?? ''),
    queryFn: ({ signal }) => fetchNurtureSequence(id ?? '', signal),
    enabled: Boolean(id),
  });
}

function useSetSequence() {
  const queryClient = useQueryClient();
  return (sequence: NurtureSequence) => {
    queryClient.setQueryData(nurtureKeys.sequenceDetail(sequence.id), sequence);
    return queryClient.invalidateQueries({ queryKey: nurtureKeys.sequenceList() });
  };
}

export function useCreateNurtureSequence() {
  const setSequence = useSetSequence();
  return useMutation({ mutationFn: createNurtureSequence, onSuccess: setSequence });
}

export function useUpdateNurtureSequence() {
  const setSequence = useSetSequence();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: NurtureSequencePatchDto }) =>
      updateNurtureSequence(id, body),
    onSuccess: setSequence,
  });
}

export function useDeleteNurtureSequence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNurtureSequence,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: nurtureKeys.sequenceDetail(id) });
      return queryClient.invalidateQueries({ queryKey: nurtureKeys.all });
    },
  });
}

export function useNurtureEnrollments(
  filters: NurtureEnrollmentFilters = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: nurtureKeys.enrollmentList(filters),
    queryFn: ({ signal }) => fetchNurtureEnrollments(filters, signal),
    enabled: options.enabled,
  });
}

/** Enrollments and sequence counts (`active_enrollments`) both change. */
function useInvalidateNurture() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: nurtureKeys.all });
}

export function useEnrollContact() {
  const invalidate = useInvalidateNurture();
  return useMutation({
    mutationFn: ({ sequenceId, contactId }: { sequenceId: string; contactId: string }) =>
      enrollContact(sequenceId, contactId),
    onSuccess: invalidate,
  });
}

export function useStopNurtureEnrollment() {
  const invalidate = useInvalidateNurture();
  return useMutation({ mutationFn: stopNurtureEnrollment, onSuccess: invalidate });
}

/** Public unsubscribe page: `mutate(token)`. */
export function useUnsubscribe() {
  return useMutation({ mutationFn: unsubscribe });
}
