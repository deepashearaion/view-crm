import { Link2, PhoneCall, PhoneIncoming, PhoneOutgoing, Plus, Unlink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { InlineAlert } from '@/components/feedback/inline-alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserLookup } from '@/features/auth';
import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { errorMessage } from '@/services';

import { callBelongsTo, formatDuration } from '../call-recordings/api/calls';
import { useCalls, useSetCallContact } from '../call-recordings/hooks/use-calls';
import { CALL_OUTCOMES, type Call } from '../call-recordings/types';
import type { ContactRef } from '../types';

import { LogCallDialog } from './log-call-dialog';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}

/**
 * A contact's calls: those linked to it, plus unlinked calls to or from its numbers.
 * Log calls by hand, link a phone-matched call for good, or unlink one.
 */
export function ContactCallsPanel({ contact, canEdit }: { contact: ContactRef; canEdit: boolean }) {
  const { data: allCalls = [], isPending, error } = useCalls();
  const users = useUserLookup();
  const setContact = useSetCallContact();
  const [logging, setLogging] = useState(false);

  const calls = useMemo(
    () =>
      allCalls
        .filter((call) => callBelongsTo(call, contact))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [allCalls, contact],
  );

  const stats = useMemo(() => {
    const connected = calls.filter((call) => call.outcome === 'connected');
    return {
      connected: connected.length,
      talk: connected.reduce((sum, call) => sum + call.durationSeconds, 0),
      last: calls[0]?.startedAt,
    };
  }, [calls]);

  const link = (call: Call, contactId: string | null) => {
    setContact.mutate(
      { id: call.id, contactId },
      {
        onSuccess: () => {
          toast.success(
            contactId ? 'Call linked to this contact.' : 'Call unlinked from this contact.',
          );
        },
        onError: (err) => toast.error(errorMessage(err, 'Couldn’t update the call.')),
      },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Includes calls to or from{' '}
          {[contact.mobile, contact.alternateMobile].filter(Boolean).join(' or ') ||
            'this contact’s numbers'}
          .
        </p>
        {canEdit && (
          <Button
            size="sm"
            onClick={() => {
              setLogging(true);
            }}
          >
            <Plus aria-hidden />
            Log a call
          </Button>
        )}
      </div>

      {Boolean(error) && <InlineAlert>{errorMessage(error, 'Couldn’t load calls.')}</InlineAlert>}

      {calls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Calls" value={String(calls.length)} />
          <Stat label="Talk time" value={formatDuration(stats.talk)} />
          <Stat label="Last call" value={stats.last ? formatRelativeTime(stats.last) : '—'} />
        </div>
      )}

      {isPending ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading calls">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : calls.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <PhoneCall aria-hidden className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">No calls with this contact yet</p>
          <p className="text-xs text-muted-foreground">
            Calls to or from their numbers appear here automatically. You can also log one.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {calls.map((call) => {
            const Icon = call.direction === 'inbound' ? PhoneIncoming : PhoneOutgoing;
            const outcome = CALL_OUTCOMES.find((item) => item.value === call.outcome);
            const rep = call.ownerId ? users.get(call.ownerId)?.name : undefined;
            const linked = call.contactId === contact.id;
            return (
              <li key={call.id} className="space-y-2 px-3 py-2.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon aria-label={call.direction} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium">
                        {call.direction === 'inbound' ? 'Inbound' : 'Outbound'}
                      </span>
                      {outcome && <Badge variant={outcome.variant}>{outcome.label}</Badge>}
                      {!linked && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" tabIndex={0}>
                              Matched by number
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Not linked yet; shown because {call.phone} is this contact’s number.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(call.startedAt)} · {call.phone}
                      {call.outcome === 'connected' && ` · ${formatDuration(call.durationSeconds)}`}
                      {rep && ` · ${rep}`}
                    </p>
                    {call.notes && <p className="mt-1 text-sm whitespace-pre-line">{call.notes}</p>}
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={setContact.isPending}
                      aria-label={linked ? 'Unlink this call' : 'Link this call to the contact'}
                      title={linked ? 'Unlink this call' : 'Link this call to the contact'}
                      onClick={() => {
                        link(call, linked ? null : contact.id);
                      }}
                    >
                      {linked ? <Unlink aria-hidden /> : <Link2 aria-hidden />}
                    </Button>
                  )}
                </div>
                {call.recordingUrl && (
                  <audio
                    controls
                    preload="none"
                    src={call.recordingUrl}
                    className="h-8 w-full"
                    aria-label={`Recording of the call on ${formatDateTime(call.startedAt)}`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <LogCallDialog open={logging} onOpenChange={setLogging} contact={contact} />
    </div>
  );
}
