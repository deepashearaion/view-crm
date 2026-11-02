import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { WorkflowBadge } from '@/components/feedback/workflow-badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMarkAlertRead,
  useMarkAllAlertsRead,
  useRepAlerts,
  type RepAlert,
} from '@/features/tasks';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

function AlertRow({ alert, onOpen }: { alert: RepAlert; onOpen: (alert: RepAlert) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          onOpen(alert);
        }}
        className={cn(
          'flex w-full flex-col gap-1.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
          !alert.read && 'bg-primary/5',
        )}
      >
        <span className="flex items-start gap-2">
          {!alert.read && (
            <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
          <span className="flex-1 text-sm leading-snug font-medium">{alert.title}</span>
        </span>
        <span className="text-xs text-muted-foreground">{alert.summary}</span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <WorkflowBadge kind={alert.automated ? 'ai' : 'human'} />
          <time dateTime={alert.createdAt}>{formatRelativeTime(alert.createdAt)}</time>
        </span>
      </button>
    </li>
  );
}

/** Rep alerts ("Rep alerted instantly" in the workflow). */
export function AlertsMenu() {
  const navigate = useNavigate();
  const { data: alerts, isPending, isError } = useRepAlerts();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();
  const unread = alerts?.filter((alert) => !alert.read).length ?? 0;

  const openAlert = (alert: RepAlert) => {
    if (!alert.read) markRead.mutate(alert.id);
    if (alert.href) void navigate(alert.href);
  };

  return (
    <Popover>
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
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Rep alerts</p>
            <p className="text-xs text-muted-foreground">Hot leads, replies and due tasks</p>
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
          ) : isError ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Couldn’t load alerts.</p>
          ) : alerts.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">You’re all caught up.</p>
          ) : (
            <ul className="space-y-0.5 p-1.5">
              {alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onOpen={openAlert} />
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
