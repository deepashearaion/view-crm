import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchRepAlerts, markAlertRead, markAllAlertsRead } from '../api/alerts';
import { taskKeys } from '../constants';
import type { RepAlert } from '../types';

export function useRepAlerts() {
  return useQuery({
    queryKey: taskKeys.alerts(),
    queryFn: ({ signal }) => fetchRepAlerts(signal),
    refetchInterval: 60_000,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAlertRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<RepAlert[]>(taskKeys.alerts(), (alerts) =>
        alerts?.map((alert) => (alert.id === updated.id ? updated : alert)),
      );
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAlertsRead,
    onSuccess: () => {
      queryClient.setQueryData<RepAlert[]>(taskKeys.alerts(), (alerts) =>
        alerts?.map((alert) => ({ ...alert, read: true })),
      );
    },
  });
}
