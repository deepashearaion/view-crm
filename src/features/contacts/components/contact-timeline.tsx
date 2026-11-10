import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRightLeft,
  BellOff,
  ChevronDown,
  CircleCheck,
  CirclePause,
  CircleX,
  Copy,
  FileText,
  FileX,
  Gauge,
  Handshake,
  History,
  ListTodo,
  Mail,
  MessageSquare,
  Milestone,
  Phone,
  Send,
  StickyNote,
  Trophy,
  UserCheck,
  UserPlus,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch, type FieldPath } from 'react-hook-form';
import { toast } from 'sonner';

import { EmptyState } from '@/components/feedback/empty-state';
import { InlineAlert } from '@/components/feedback/inline-alert';
import { FormInput } from '@/components/form/form-input';
import { FormSelect, type SelectOption } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserLookup } from '@/features/auth';
import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { applyProblem, errorMessage } from '@/services';

import { useContactTimeline, useLogActivity } from '../hooks/use-contacts';
import { activityFormSchema } from '../schemas';
import type {
  Activity,
  ActivityChannel,
  ActivityFormOutput,
  ActivityFormValues,
  ActivityKind,
  ActivityRequest,
} from '../types';

const KIND_ICONS: Record<ActivityKind, LucideIcon> = {
  captured: UserPlus,
  duplicate_captured: Copy,
  message: MessageSquare,
  note: StickyNote,
  call: Phone,
  email: Mail,
  score_changed: Gauge,
  owner_assigned: UserCheck,
  lifecycle_changed: Milestone,
  task_created: ListTodo,
  task_completed: CircleCheck,
  deal_created: Handshake,
  deal_stage_changed: ArrowRightLeft,
  deal_won: Trophy,
  deal_lost: CircleX,
  nurture_enrolled: Workflow,
  nurture_stopped: CirclePause,
  opted_out: BellOff,
  invoice_issued: FileText,
  invoice_sent: Send,
  invoice_cancelled: FileX,
};

const CHANNEL_LABELS: Record<ActivityChannel, string> = {
  web_form: 'Web form',
  whatsapp: 'WhatsApp',
  email: 'Email',
  phone: 'Phone',
  manual: 'Manual',
  api: 'API',
  system: 'System',
};

const KIND_LABELS: Partial<Record<ActivityKind, string>> = {
  note: 'Note',
  call: 'Call',
  email: 'Email',
  message: 'Message',
};

function ActivityItem({ activity }: { activity: Activity }) {
  const users = useUserLookup();
  const [open, setOpen] = useState(false);
  // Unknown kinds from a newer API fall back to a generic icon.
  const Icon = (KIND_ICONS as Partial<Record<string, LucideIcon>>)[activity.kind] ?? History;
  const actor = activity.actorUserId ? users.get(activity.actorUserId)?.name : undefined;
  const meta = [
    activity.channel ? CHANNEL_LABELS[activity.channel] : null,
    activity.direction === 'inbound'
      ? 'Inbound'
      : activity.direction === 'outbound'
        ? 'Outbound'
        : null,
    actor ?? (activity.channel === 'system' ? null : activity.actorUserId ? 'Unknown user' : null),
  ].filter(Boolean);
  const summary =
    activity.summary || KIND_LABELS[activity.kind] || activity.kind.replace(/_/g, ' ');

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <span
        aria-hidden
        className="absolute top-8 bottom-0 left-4 w-px bg-border [li:last-child>&]:hidden"
      />
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted/50">
        <Icon aria-hidden className="size-4 text-muted-foreground" />
      </span>
      <Collapsible open={open} onOpenChange={setOpen} className="min-w-0 flex-1 pt-1">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 text-sm font-medium break-words">{summary}</p>
          <time
            dateTime={activity.occurredAt}
            title={formatDateTime(activity.occurredAt)}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {formatRelativeTime(activity.occurredAt)}
          </time>
        </div>
        {meta.length > 0 && <p className="text-xs text-muted-foreground">{meta.join(' · ')}</p>}
        {activity.body && (
          <>
            <CollapsibleTrigger asChild>
              <Button variant="link" size="sm" className="h-auto px-0 text-xs">
                {open ? 'Hide details' : 'Show details'}
                <ChevronDown
                  aria-hidden
                  className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="mt-1 rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                {activity.body}
              </p>
            </CollapsibleContent>
          </>
        )}
      </Collapsible>
    </li>
  );
}

const kindOptions: SelectOption[] = [
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
];
const directionOptions: SelectOption[] = [
  { value: 'outbound', label: 'Outbound' },
  { value: 'inbound', label: 'Inbound' },
];

const EMPTY_ACTIVITY: ActivityFormValues = {
  kind: 'note',
  direction: '',
  summary: '',
  body: '',
};

function toActivityRequest(values: ActivityFormOutput): ActivityRequest {
  const body: ActivityRequest = { kind: values.kind, body: values.body };
  if (values.summary) body.summary = values.summary;
  if (values.kind !== 'note' && values.direction) body.direction = values.direction;
  return body;
}

function LogActivityForm({ contactId }: { contactId: string }) {
  const logActivity = useLogActivity();
  const form = useForm<ActivityFormValues, unknown, ActivityFormOutput>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: EMPTY_ACTIVITY,
  });
  const kind = useWatch({ control: form.control, name: 'kind' });

  const onSubmit = form.handleSubmit((values) => {
    logActivity.mutate(
      { id: contactId, body: toActivityRequest(values) },
      {
        onSuccess: () => {
          toast.success(`${KIND_LABELS[values.kind] ?? 'Activity'} logged.`);
          form.reset({ ...EMPTY_ACTIVITY, kind: values.kind });
        },
        onError: (error) => {
          applyProblem(error, (field, fieldError) => {
            form.setError(field as FieldPath<ActivityFormValues>, fieldError);
          });
        },
      },
    );
  });

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      className="space-y-3 rounded-lg border p-3"
      aria-label="Log activity"
    >
      {logActivity.isError && (
        <InlineAlert>{errorMessage(logActivity.error, 'Couldn’t log the activity.')}</InlineAlert>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <FormSelect control={form.control} name="kind" label="Type" options={kindOptions} />
        {kind !== 'note' && (
          <FormSelect
            control={form.control}
            name="direction"
            label="Direction"
            options={directionOptions}
            allowEmpty
          />
        )}
      </div>
      <FormInput
        control={form.control}
        name="summary"
        label="Summary"
        placeholder={kind === 'call' ? 'e.g. Discussed Goa itinerary' : 'One line'}
        autoComplete="off"
      />
      <FormTextarea control={form.control} name="body" label="Details" rows={3} />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={logActivity.isPending}>
          {logActivity.isPending ? 'Saving…' : `Log ${kind}`}
        </Button>
      </div>
    </form>
  );
}

/** Activity timeline for a contact with "Load more" and (for editors) a log form. */
export function ContactTimeline({ contactId, canEdit }: { contactId: string; canEdit: boolean }) {
  const timeline = useContactTimeline(contactId);
  const activities = timeline.data?.pages.flat() ?? [];

  return (
    <section className="space-y-4" aria-label="Activity">
      {canEdit && <LogActivityForm contactId={contactId} />}
      {timeline.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      ) : timeline.isError ? (
        <InlineAlert>
          {errorMessage(timeline.error, 'Couldn’t load the timeline.')}{' '}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => void timeline.refetch()}
          >
            Retry
          </Button>
        </InlineAlert>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Calls, emails, notes and lead events will show up here."
          className="border-none py-6"
        />
      ) : (
        <>
          <ol>
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </ol>
          {timeline.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={timeline.isFetchingNextPage}
                onClick={() => void timeline.fetchNextPage()}
              >
                {timeline.isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
