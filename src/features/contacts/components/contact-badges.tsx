import { BellOff, Flame, Snowflake, Thermometer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateTime, formatRelativeTime } from '@/lib/format';

import { lifecycleStageById, temperatureLabel } from '../constants';
import type { Contact, LifecycleStage, Temperature } from '../types';

export function LifecycleStageBadge({ stage }: { stage: LifecycleStage | null | undefined }) {
  const entry = lifecycleStageById(stage);
  if (!entry) return <Badge variant="outline">No stage</Badge>;
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

const temperatureIcons = { hot: Flame, warm: Thermometer, cold: Snowflake } as const;

/** Cold / warm / hot badge with the score; the scoring reasons show in a tooltip. */
export function TemperatureBadge({
  contact,
}: {
  contact: Pick<Contact, 'score' | 'temperature' | 'scoreReasons' | 'scoredAt'>;
}) {
  const temperature: Temperature | null = contact.temperature;
  if (!temperature || contact.score === null) {
    return <span className="text-sm text-muted-foreground">Not scored</span>;
  }
  const Icon = temperatureIcons[temperature];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={temperature}
          tabIndex={0}
          aria-label={`${temperatureLabel(temperature)} lead, score ${String(contact.score)}`}
        >
          <Icon aria-hidden />
          {temperatureLabel(temperature)}
          <span className="tabular-nums opacity-80">{contact.score}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-72">
        <p className="font-medium">
          Score {contact.score} · {temperatureLabel(temperature)}
        </p>
        {contact.scoreReasons.length > 0 ? (
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {contact.scoreReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 opacity-80">No scoring rules matched.</p>
        )}
        {contact.scoredAt && (
          <p className="mt-1 opacity-80">Scored {formatRelativeTime(contact.scoredAt)}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/** Small marker for contacts that opted out of marketing messages. */
export function OptedOutBadge({ optedOutAt }: { optedOutAt: string | null }) {
  if (!optedOutAt) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="text-muted-foreground" tabIndex={0}>
          <BellOff aria-hidden />
          Opted out
        </Badge>
      </TooltipTrigger>
      <TooltipContent>Opted out of marketing on {formatDateTime(optedOutAt)}</TooltipContent>
    </Tooltip>
  );
}
