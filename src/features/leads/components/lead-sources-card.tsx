import { ArrowRight, Code2, FileText, Mail, MessageCircle, Phone, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
import { Skeleton } from '@/components/ui/skeleton';
import { LEAD_SOURCE_CHANNELS, useLeadSettings, useLeadSources } from '@/features/automation';
import { paths } from '@/routes/paths';
import { errorMessage } from '@/services';

const BUILT_IN_CHANNELS = [
  { label: 'WhatsApp', icon: MessageCircle },
  { label: 'Web forms', icon: FileText },
  { label: 'Email', icon: Mail },
  { label: 'Phone & manual', icon: Phone },
] as const;

function ChannelList() {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {BUILT_IN_CHANNELS.map(({ label, icon: Icon }) => (
        <li key={label}>
          <Badge variant="outline">
            <Icon aria-hidden />
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/** Sources and score thresholds; needs settings.view (these endpoints 403 otherwise). */
function ManagedSources() {
  const sources = useLeadSources();
  const settings = useLeadSettings();
  const active = (sources.data ?? []).filter((source) => source.active);

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Active intake sources</h3>
        {sources.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-40" />
          </div>
        ) : sources.error ? (
          <p className="text-sm text-destructive">
            {errorMessage(sources.error, 'Couldn’t load lead sources.')}
          </p>
        ) : active.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No web-form or API sources yet. Add one to start collecting leads from your website.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {active.map((source) => (
              <li key={source.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  {source.channel === 'api' ? (
                    <Code2 aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{source.name}</span>
                </span>
                <Badge variant="secondary">
                  {LEAD_SOURCE_CHANNELS.find((channel) => channel.value === source.channel)
                    ?.label ?? source.channel}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Score thresholds</h3>
        {settings.isPending ? (
          <Skeleton className="h-5 w-56" />
        ) : settings.error ? (
          <p className="text-sm text-destructive">
            {errorMessage(settings.error, 'Couldn’t load lead settings.')}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Badge variant="hot">Hot ≥ {settings.data.hotThreshold}</Badge>
            <Badge variant="warm">Warm ≥ {settings.data.warmThreshold}</Badge>
            <Badge variant="cold">Cold &lt; {settings.data.warmThreshold}</Badge>
          </div>
        )}
      </div>
    </>
  );
}

export function LeadSourcesCard({ canViewSettings }: { canViewSettings: boolean }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Where leads come from</CardTitle>
        <CardDescription>
          Every channel feeds this inbox. New leads are de-duplicated, scored and routed to an owner
          automatically.
        </CardDescription>
        {canViewSettings && (
          <CardAction>
            <Button variant="outline" size="sm" asChild>
              <Link to={paths.automation}>
                <Settings2 aria-hidden />
                Manage
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ChannelList />
        {canViewSettings && <ManagedSources />}
      </CardContent>
    </Card>
  );
}
