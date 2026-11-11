import { Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAccess } from '@/features/auth';
import { errorMessage, isHttpError } from '@/services';

import { useReportSettings, useUpdateReportSettings } from '../hooks/use-reports';

/** "Weekly email report" toggle. Editable with settings.edit; read-only otherwise. */
export function WeeklyEmailSwitch() {
  const canManage = useAccess().can('settings', 'edit');
  const settings = useReportSettings();
  const update = useUpdateReportSettings();

  // Nothing useful to show when the settings can't be read (e.g. 403).
  if (settings.isError) {
    if (isHttpError(settings.error) && settings.error.status === 403) return null;
    return (
      <p className="text-xs text-destructive">
        {errorMessage(settings.error, 'Couldn’t load the weekly email setting.')}
      </p>
    );
  }

  const id = 'weekly-email-report';
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
      <Mail aria-hidden className="size-4 text-muted-foreground" />
      <label htmlFor={id} className="text-sm font-medium">
        Weekly email report
      </label>
      {settings.isPending ? (
        <Skeleton className="h-[18px] w-8 rounded-full" />
      ) : (
        <Switch
          id={id}
          checked={settings.data.weeklyEmail}
          disabled={!canManage || update.isPending}
          title={canManage ? undefined : 'You don’t have permission to change this.'}
          onCheckedChange={(checked) => {
            update.mutate(checked, {
              onSuccess: (next) => {
                toast.success(
                  next.weeklyEmail
                    ? 'Weekly email report turned on.'
                    : 'Weekly email report turned off.',
                );
              },
              onError: (error) => {
                toast.error(errorMessage(error, 'Couldn’t update the weekly email setting.'));
              },
            });
          }}
        />
      )}
    </div>
  );
}
