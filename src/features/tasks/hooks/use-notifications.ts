import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';
import { notificationKeys } from '../constants';
import type { NotificationsResult } from '../types';

/** Polls every 30 s: the API has no push channel yet. */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ signal }) => fetchNotifications(signal),
    refetchInterval: 30_000,
  });
}

/** Shared optimistic-update plumbing: apply `update`, roll back on error, refetch after. */
function useOptimisticNotifications<TVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  update: (data: NotificationsResult, variables: TVariables, readAt: string) => NotificationsResult,
) {
  const queryClient = useQueryClient();
  const key = notificationKeys.list();
  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationsResult>(key);
      const readAt = new Date().toISOString();
      queryClient.setQueryData<NotificationsResult>(key, (data) =>
        data ? update(data, variables, readAt) : data,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

/** POST /notifications/{id}/read; marks it read and decrements the unread count right away. */
export function useMarkNotificationRead() {
  return useOptimisticNotifications<string>(markNotificationRead, (data, id, readAt) => {
    const target = data.notifications.find((item) => item.id === id);
    if (!target || target.readAt) return data;
    return {
      notifications: data.notifications.map((item) =>
        item.id === id ? { ...item, readAt } : item,
      ),
      unreadCount: Math.max(0, data.unreadCount - 1),
    };
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const key = notificationKeys.list();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationsResult>(key);
      const readAt = new Date().toISOString();
      queryClient.setQueryData<NotificationsResult>(key, (data) =>
        data
          ? {
              notifications: data.notifications.map((item) =>
                item.readAt ? item : { ...item, readAt },
              ),
              unreadCount: 0,
            }
          : data,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
