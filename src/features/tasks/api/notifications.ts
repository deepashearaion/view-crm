import { http } from '@/services';

import type { AppNotification, NotificationDto, NotificationsResult } from '../types';

const BASE = '/api/v1/notifications';

/**
 * Maps a backend `link` (a frontend path such as `/contacts/12` or `/tasks/34`) to the
 * in-app route, which lives under /dashboard.
 */
export function notificationHref(link: string): string | undefined {
  if (!link.startsWith('/')) return undefined;
  if (link === '/dashboard' || link.startsWith('/dashboard/')) return link;
  return `/dashboard${link}`;
}

export function toNotification(dto: NotificationDto): AppNotification {
  return {
    id: String(dto.id),
    kind: dto.kind,
    title: dto.title,
    body: dto.body,
    href: notificationHref(dto.link),
    contactId: dto.contact_id === null ? null : String(dto.contact_id),
    taskId: dto.task_id === null ? null : String(dto.task_id),
    readAt: dto.read_at,
    createdAt: dto.created_at,
  };
}

/** The newest page of notifications plus the total unread count (for the bell badge). */
export async function fetchNotifications(signal?: AbortSignal): Promise<NotificationsResult> {
  const response = await http.get<{ notifications: NotificationDto[]; unread_count: number }>(
    BASE,
    { query: { limit: 50 }, signal },
  );
  return {
    notifications: response.notifications.map(toNotification),
    unreadCount: response.unread_count,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await http.post(`${BASE}/${encodeURIComponent(id)}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await http.post(`${BASE}/read-all`);
}
