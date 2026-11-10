import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

import {
  createAssignmentRule,
  createLeadSource,
  createScoringRule,
  createWhatsAppAccount,
  deleteAssignmentRule,
  deleteScoringRule,
  deleteWhatsAppAccount,
  fetchAssignmentRules,
  fetchLeadSettings,
  fetchLeadSources,
  fetchScoringRules,
  fetchWhatsAppAccounts,
  rotateLeadSourceKey,
  updateAssignmentRule,
  updateLeadSettings,
  updateLeadSource,
  updateScoringRule,
} from '../api/automation';
import { automationKeys } from '../constants';
import type { AssignmentRulePatchDto, LeadSourcePatchDto, ScoringRulePatchDto } from '../types';

function useInvalidate(queryKey: QueryKey) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey });
}

// Lead settings

export function useLeadSettings() {
  return useQuery({
    queryKey: automationKeys.leadSettings(),
    queryFn: ({ signal }) => fetchLeadSettings(signal),
  });
}

export function useUpdateLeadSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLeadSettings,
    onSuccess: (settings) => queryClient.setQueryData(automationKeys.leadSettings(), settings),
  });
}

// Lead sources

export function useLeadSources() {
  return useQuery({
    queryKey: automationKeys.leadSources(),
    queryFn: ({ signal }) => fetchLeadSources(signal),
  });
}

export function useCreateLeadSource() {
  const invalidate = useInvalidate(automationKeys.leadSources());
  return useMutation({ mutationFn: createLeadSource, onSuccess: invalidate });
}

export function useUpdateLeadSource() {
  const invalidate = useInvalidate(automationKeys.leadSources());
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: LeadSourcePatchDto }) =>
      updateLeadSource(id, body),
    onSuccess: invalidate,
  });
}

export function useRotateLeadSourceKey() {
  const invalidate = useInvalidate(automationKeys.leadSources());
  return useMutation({ mutationFn: rotateLeadSourceKey, onSuccess: invalidate });
}

// WhatsApp accounts

export function useWhatsAppAccounts() {
  return useQuery({
    queryKey: automationKeys.whatsappAccounts(),
    queryFn: ({ signal }) => fetchWhatsAppAccounts(signal),
  });
}

export function useCreateWhatsAppAccount() {
  const invalidate = useInvalidate(automationKeys.whatsappAccounts());
  return useMutation({ mutationFn: createWhatsAppAccount, onSuccess: invalidate });
}

export function useDeleteWhatsAppAccount() {
  const invalidate = useInvalidate(automationKeys.whatsappAccounts());
  return useMutation({ mutationFn: deleteWhatsAppAccount, onSuccess: invalidate });
}

// Scoring rules

export function useScoringRules() {
  return useQuery({
    queryKey: automationKeys.scoringRules(),
    queryFn: ({ signal }) => fetchScoringRules(signal),
  });
}

export function useCreateScoringRule() {
  const invalidate = useInvalidate(automationKeys.scoringRules());
  return useMutation({ mutationFn: createScoringRule, onSuccess: invalidate });
}

export function useUpdateScoringRule() {
  const invalidate = useInvalidate(automationKeys.scoringRules());
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ScoringRulePatchDto }) =>
      updateScoringRule(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteScoringRule() {
  const invalidate = useInvalidate(automationKeys.scoringRules());
  return useMutation({ mutationFn: deleteScoringRule, onSuccess: invalidate });
}

// Assignment rules

export function useAssignmentRules() {
  return useQuery({
    queryKey: automationKeys.assignmentRules(),
    queryFn: ({ signal }) => fetchAssignmentRules(signal),
  });
}

export function useCreateAssignmentRule() {
  const invalidate = useInvalidate(automationKeys.assignmentRules());
  return useMutation({ mutationFn: createAssignmentRule, onSuccess: invalidate });
}

/** Positions of other rules may shift, so the whole list is refetched. */
export function useUpdateAssignmentRule() {
  const invalidate = useInvalidate(automationKeys.assignmentRules());
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AssignmentRulePatchDto }) =>
      updateAssignmentRule(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteAssignmentRule() {
  const invalidate = useInvalidate(automationKeys.assignmentRules());
  return useMutation({ mutationFn: deleteAssignmentRule, onSuccess: invalidate });
}
