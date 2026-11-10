import { ChevronDown, Code2, Globe, KeyRound, Pencil, Plug, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/services';

import {
  INTAKE_OPTIONAL_FIELDS,
  LEAD_SOURCE_CHANNELS,
  formIntakeUrl,
  intakeFormSnippet,
} from '../constants';
import {
  useLeadSources,
  useRotateLeadSourceKey,
  useUpdateLeadSource,
} from '../hooks/use-automation';
import type { LeadSource } from '../types';

import { LeadSourceDialog } from './lead-source-dialog';
import { CopyButton, QueryError, TableSkeleton } from './shared';

const CHANNEL_LABELS = Object.fromEntries(
  LEAD_SOURCE_CHANNELS.map((item) => [item.value, item.label]),
) as Record<LeadSource['channel'], string>;

interface DialogState {
  open: boolean;
  source?: LeadSource;
}

function WebFormSetup({ source }: { source: LeadSource }) {
  const [open, setOpen] = useState(false);
  const url = formIntakeUrl(source.publicKey);
  const snippet = intakeFormSnippet(source.publicKey);
  const urlId = `intake-url-${source.id}`;

  return (
    <div className="space-y-3 border-t bg-muted/30 px-4 py-3">
      <div className="space-y-1.5">
        <label htmlFor={urlId} className="text-xs font-medium text-muted-foreground">
          Public form URL
        </label>
        <div className="flex gap-2">
          <Input
            id={urlId}
            readOnly
            value={url}
            className="h-8 font-mono text-xs"
            onFocus={(event) => {
              event.currentTarget.select();
            }}
          />
          <CopyButton value={url} label="Copy form URL" />
        </div>
      </div>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="-ml-2.5">
            <Code2 aria-hidden />
            HTML form snippet
            <ChevronDown aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <p className="text-xs text-muted-foreground">
            Paste this into your website. Submissions create a lead with this source. The hidden{' '}
            <code className="font-mono">website</code> field catches spam bots, so keep it hidden
            and empty. The form also accepts{' '}
            {INTAKE_OPTIONAL_FIELDS.map((field, index) => (
              <span key={field}>
                {index > 0 && ', '}
                <code className="font-mono">{field}</code>
              </span>
            ))}
            .
          </p>
          <div className="relative">
            <pre className="max-h-72 overflow-auto rounded-lg border bg-background p-3 pr-12 font-mono text-xs leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <CopyButton
              value={snippet}
              label="Copy HTML snippet"
              className="absolute top-2 right-2"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function SourceRow({
  source,
  onRename,
  onRotate,
}: {
  source: LeadSource;
  onRename: () => void;
  onRotate: () => void;
}) {
  const update = useUpdateLeadSource();
  const Icon = source.channel === 'web_form' ? Globe : Plug;

  return (
    <li className={cn('overflow-hidden rounded-lg border', !source.active && 'opacity-70')}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon aria-hidden className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            <span className="truncate">{source.name}</span>
            <Badge variant="secondary">{CHANNEL_LABELS[source.channel]}</Badge>
            {!source.active && <Badge variant="outline">Paused</Badge>}
          </p>
          <p className="text-xs text-muted-foreground">Created {formatDate(source.createdAt)}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={source.active}
            disabled={update.isPending}
            onCheckedChange={(active) => {
              update.mutate(
                { id: source.id, body: { active } },
                {
                  onSuccess: () => {
                    toast.success(
                      active ? `${source.name} is accepting leads.` : `${source.name} paused.`,
                    );
                  },
                  onError: (err) => {
                    toast.error(errorMessage(err, 'Couldn’t update the source.'));
                  },
                },
              );
            }}
          />
          Active
        </label>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Rename ${source.name}`}
            onClick={onRename}
          >
            <Pencil aria-hidden />
          </Button>
          {source.channel === 'web_form' && (
            <Button variant="ghost" size="sm" onClick={onRotate} title="Issue a new form URL">
              <RefreshCw aria-hidden />
              Rotate key
            </Button>
          )}
        </div>
      </div>
      {source.channel === 'web_form' && <WebFormSetup source={source} />}
    </li>
  );
}

export function LeadSourcesTab() {
  const { data: sources = [], isPending, error, refetch } = useLeadSources();
  const rotate = useRotateLeadSourceKey();
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [pendingRotate, setPendingRotate] = useState<LeadSource | null>(null);

  const addButton = (
    <Button
      size="sm"
      onClick={() => {
        setDialog({ open: true });
      }}
    >
      <Plus aria-hidden />
      Add source
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead sources</CardTitle>
        <CardDescription>
          Where leads come from. Web-form sources get a public URL your website can post enquiries
          to; turn a source off to pause it.
        </CardDescription>
        {sources.length > 0 && <CardAction>{addButton}</CardAction>}
      </CardHeader>
      <CardContent>
        {isPending ? (
          <TableSkeleton label="Loading lead sources" />
        ) : error ? (
          <QueryError
            error={error}
            title="Couldn’t load lead sources"
            onRetry={() => void refetch()}
          />
        ) : sources.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No lead sources yet"
            description="Add a web form to capture enquiries from your website straight into the CRM."
            className="border-none"
            actions={addButton}
          />
        ) : (
          <ul className="space-y-3">
            {sources.map((source) => (
              <SourceRow
                key={source.id}
                source={source}
                onRename={() => {
                  setDialog({ open: true, source });
                }}
                onRotate={() => {
                  setPendingRotate(source);
                }}
              />
            ))}
          </ul>
        )}
      </CardContent>

      <LeadSourceDialog
        open={dialog.open}
        source={dialog.source}
        onOpenChange={(open) => {
          if (!open) setDialog((current) => ({ ...current, open: false }));
        }}
      />
      <ConfirmDialog
        open={pendingRotate !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRotate(null);
        }}
        title={
          <span className="flex items-center gap-2">
            <KeyRound aria-hidden className="size-4" />
            Rotate the key of {pendingRotate?.name ?? 'this source'}?
          </span>
        }
        description="A new form URL is issued and the current one stops working immediately. Forms on your website keep failing until you replace them with the new URL or snippet."
        confirmLabel="Rotate key"
        destructive
        pending={rotate.isPending}
        onConfirm={() => {
          if (!pendingRotate) return;
          rotate.mutate(pendingRotate.id, {
            onSuccess: (source) => {
              toast.success(`New form URL issued for ${source.name}. Update your website.`);
              setPendingRotate(null);
            },
            onError: (err) => {
              toast.error(errorMessage(err, 'Couldn’t rotate the key.'));
            },
          });
        }}
      />
    </Card>
  );
}
