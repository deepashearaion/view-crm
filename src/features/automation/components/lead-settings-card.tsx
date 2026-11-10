import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/features/auth';
import { formatRelativeTime } from '@/lib/format';
import { applyProblem, errorMessage } from '@/services';

import { useLeadSettings, useUpdateLeadSettings } from '../hooks/use-automation';
import {
  leadSettingsSchema,
  type LeadSettingsFormOutput,
  type LeadSettingsFormValues,
} from '../schemas';
import type { LeadSettings, LeadSettingsPatchDto } from '../types';

import { QueryError } from './shared';

const FORM_ID = 'lead-settings-form';

function toFormValues(settings: LeadSettings): LeadSettingsFormValues {
  return {
    hotThreshold: String(settings.hotThreshold),
    warmThreshold: String(settings.warmThreshold),
    hotFollowupMinutes: String(settings.hotFollowupMinutes),
    defaultOwnerId: settings.defaultOwnerId ?? '',
  };
}

function toPatch(values: LeadSettingsFormOutput): LeadSettingsPatchDto {
  return {
    hot_threshold: Number(values.hotThreshold),
    warm_threshold: Number(values.warmThreshold),
    hot_followup_minutes: Number(values.hotFollowupMinutes),
    ...(values.defaultOwnerId
      ? { default_owner_id: Number(values.defaultOwnerId) }
      : { clear_default_owner: true }),
  };
}

const FIELD_MAP = {
  hot_threshold: 'hotThreshold',
  warm_threshold: 'warmThreshold',
  hot_followup_minutes: 'hotFollowupMinutes',
  default_owner_id: 'defaultOwnerId',
};

/** Hot/warm thresholds, hot-lead follow-up time and the fallback owner. */
export function LeadSettingsCard() {
  const { data: settings, isPending, error, refetch } = useLeadSettings();
  const { data: users = [] } = useUsers();
  const update = useUpdateLeadSettings();

  const form = useForm<LeadSettingsFormValues, unknown, LeadSettingsFormOutput>({
    resolver: zodResolver(leadSettingsSchema),
    defaultValues: {
      hotThreshold: '',
      warmThreshold: '',
      hotFollowupMinutes: '',
      defaultOwnerId: '',
    },
  });

  useEffect(() => {
    if (settings) form.reset(toFormValues(settings));
  }, [settings, form]);

  const ownerOptions = useMemo(
    () => users.map((user) => ({ value: user.id, label: user.name })),
    [users],
  );

  const onSubmit = form.handleSubmit((values) => {
    update.mutate(toPatch(values), {
      onSuccess: () => {
        toast.success('Lead settings saved.');
      },
      onError: (err) => {
        applyProblem(
          err,
          (field, fieldError) => {
            form.setError(field as keyof LeadSettingsFormValues, fieldError);
          },
          FIELD_MAP,
        );
      },
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Lead temperature
          <span className="flex gap-1">
            <Badge variant="hot">Hot</Badge>
            <Badge variant="warm">Warm</Badge>
            <Badge variant="cold">Cold</Badge>
          </span>
        </CardTitle>
        <CardDescription>
          Each lead’s score is the sum of the matching rules below. At or above the hot threshold
          it’s hot, at or above the warm threshold it’s warm, otherwise cold. Hot leads get a
          follow-up task for their owner automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <QueryError
            error={error}
            title="Couldn’t load lead settings"
            onRetry={() => void refetch()}
          />
        ) : (
          <form
            id={FORM_ID}
            onSubmit={(event) => void onSubmit(event)}
            noValidate
            className="space-y-4"
          >
            {update.isError && (
              <InlineAlert>
                {errorMessage(update.error, 'Couldn’t save lead settings.')}
              </InlineAlert>
            )}
            <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FormInput
                control={form.control}
                name="hotThreshold"
                label="Hot at score"
                type="number"
                min={0}
                max={100}
                description="0–100"
              />
              <FormInput
                control={form.control}
                name="warmThreshold"
                label="Warm at score"
                type="number"
                min={0}
                max={100}
                description="Lower than the hot threshold."
              />
              <FormInput
                control={form.control}
                name="hotFollowupMinutes"
                label="Follow up hot leads within"
                type="number"
                min={1}
                description="Minutes; sets the due time of the follow-up task."
              />
              <FormSelect
                control={form.control}
                name="defaultOwnerId"
                label="Default owner"
                options={ownerOptions}
                allowEmpty
                placeholder="None"
                description="Gets leads that no routing rule matches."
              />
            </div>
          </form>
        )}
      </CardContent>
      {settings && !error && (
        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t">
          <span className="text-xs text-muted-foreground">
            Updated {formatRelativeTime(settings.updatedAt)}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={!form.formState.isDirty || update.isPending}
              onClick={() => {
                form.reset(toFormValues(settings));
                update.reset();
              }}
            >
              Reset
            </Button>
            <Button type="submit" form={FORM_ID} disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
