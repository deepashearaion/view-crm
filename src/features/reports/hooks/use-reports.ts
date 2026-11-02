import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createReport, deleteReport, fetchReports } from '../api/reports';
import { reportKeys } from '../constants';
import type { Report } from '../types';

export function useReports() {
  return useQuery({ queryKey: reportKeys.all, queryFn: ({ signal }) => fetchReports(signal) });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReport,
    onSuccess: (report) => {
      queryClient.setQueryData<Report[]>(reportKeys.all, (reports = []) => [report, ...reports]);
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReport,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Report[]>(reportKeys.all, (reports) =>
        reports?.filter((report) => report.id !== id),
      );
    },
  });
}
