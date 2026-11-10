import { Bell, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  NOTIFICATION_KINDS,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type AppNotification,
} from '@/features/tasks';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

function NotificationRow({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
}) {
  const unread = !notification.readAt;
  const kind = NOTIFICATION_KINDS[notification.kind];
  const Icon = kind.icon;
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          onOpen(notification);
        }}
        className={cn(
          'flex w-full flex-col gap-1.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
          unread && 'bg-primary/5',
        )}
      >
        <span className="flex items-start gap-2">
          {unread && (
            <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
          <span className="flex-1 text-sm leading-snug font-medium">{notification.title}</span>
        </span>
        {notification.body && (
          <span className="text-xs text-muted-foreground">{notification.body}</span>
        )}
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Icon aria-hidden className="size-3.5" />
            {kind.label}
          </span>
          <span aria-hidden>·</span>
          <time dateTime={notification.createdAt}>
            {formatRelativeTime(notification.createdAt)}
          </time>
        </span>
      </button>
    </li>
  );
}

/** Notification bell: hot leads, assignments and overdue tasks (polled every 30 s). */
export function AlertsMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data, isPending } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unread = data?.unreadCount ?? 0;

  const openNotification = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (notification.href) {
      setOpen(false);
      void navigate(notification.href);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread ? `Notifications, ${String(unread)} unread` : 'Notifications'}
        >
          <Bell aria-hidden />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-semibold text-white tabular-nums">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              Hot leads, assignments and overdue tasks
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => {
              markAllRead.mutate();
            }}
          >
            <CheckCheck aria-hidden />
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-96">
          {isPending ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-14" />
              ))}
            </div>
          ) : !data ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Couldn’t load notifications.
            </p>
          ) : data.notifications.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">You’re all caught up.</p>
          ) : (
            <ul className="space-y-0.5 p-1.5">
              {data.notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onOpen={openNotification}
                />
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
