import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { permissions, useSessionRole } from '@/features/auth';
import { isHttpError } from '@/services';

import {
  fetchDashboardReport,
  fetchFunnelReport,
  fetchPipelineReport,
  fetchRepsReport,
  fetchReportSettings,
  fetchRevenueReport,
  fetchSourcesReport,
  updateReportSettings,
} from '../api/reports';
import { reportKeys } from '../constants';
import type { ReportRange, ReportSettings } from '../types';

/** KPI totals for the period (owner/admin/manager/viewer: everyone; reps: their own). */
export function useDashboardReport(range: ReportRange) {
  return useQuery({
    queryKey: reportKeys.dashboard(range),
    queryFn: ({ signal }) => fetchDashboardReport(range, signal),
    placeholderData: keepPreviousData,
  });
}

export function useFunnelReport(range: ReportRange) {
  return useQuery({
    queryKey: reportKeys.funnel(range),
    queryFn: ({ signal }) => fetchFunnelReport(range, signal),
    placeholderData: keepPreviousData,
  });
}

/** Current open deals by stage; not tied to a period. */
export function usePipelineReport() {
  return useQuery({
    queryKey: reportKeys.pipeline(),
    queryFn: ({ signal }) => fetchPipelineReport(signal),
  });
}

export function useSourcesReport(range: ReportRange) {
  return useQuery({
    queryKey: reportKeys.sources(range),
    queryFn: ({ signal }) => fetchSourcesReport(range, signal),
    placeholderData: keepPreviousData,
  });
}

/** Per-rep figures. Not fetched for reps (the API answers 403). */
export function useRepsReport(range: ReportRange) {
  const role = useSessionRole();
  const available = permissions.canSeeRepReport(role);
  const query = useQuery({
    queryKey: reportKeys.reps(range),
    queryFn: ({ signal }) => fetchRepsReport(range, signal),
    enabled: available,
    placeholderData: keepPreviousData,
  });
  const forbidden = isHttpError(query.error) && query.error.status === 403;
  return { ...query, available: available && !forbidden };
}

export function useRevenueReport(months: number) {
  return useQuery({
    queryKey: reportKeys.revenue(months),
    queryFn: ({ signal }) => fetchRevenueReport(months, signal),
    placeholderData: keepPreviousData,
  });
}

export function useReportSettings() {
  return useQuery({
    queryKey: reportKeys.settings(),
    queryFn: ({ signal }) => fetchReportSettings(signal),
  });
}

/** PUT /reports/settings (owner, admin, manager). Optimistic, rolled back on error. */
export function useUpdateReportSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weeklyEmail: boolean) => updateReportSettings({ weekly_email: weeklyEmail }),
    onMutate: async (weeklyEmail) => {
      await queryClient.cancelQueries({ queryKey: reportKeys.settings() });
      const previous = queryClient.getQueryData<ReportSettings>(reportKeys.settings());
      if (previous)
        queryClient.setQueryData<ReportSettings>(reportKeys.settings(), {
          ...previous,
          weeklyEmail,
        });
      return { previous };
    },
    onError: (_error, _weeklyEmail, context) => {
      if (context?.previous) queryClient.setQueryData(reportKeys.settings(), context.previous);
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(reportKeys.settings(), settings);
    },
  });
}
