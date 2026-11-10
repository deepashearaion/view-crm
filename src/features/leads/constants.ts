import type { LeadRequest, LifecycleStage, Temperature } from '@/features/contacts';

/** Stages that make up the lead inbox; the "All stages" switch shows the rest too. */
export const INBOX_STAGES: readonly LifecycleStage[] = ['lead', 'mql', 'sql'];

export type LeadChannel = NonNullable<LeadRequest['channel']>;

export const LEAD_CHANNELS: readonly { value: LeadChannel; label: string }[] = [
  { value: 'manual', label: 'Manual entry' },
  { value: 'phone', label: 'Phone call' },
  { value: 'email', label: 'Email' },
  { value: 'web_form', label: 'Web form' },
  { value: 'api', label: 'API' },
];

/** Temperature tab: a temperature, unscored contacts, or everything. */
export type TemperatureTab = Temperature | 'unscored' | 'all';

export const TEMPERATURE_TABS: readonly { value: TemperatureTab; label: string }[] = [
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
  { value: 'unscored', label: 'Not scored' },
  { value: 'all', label: 'All' },
];

/** Stage moves offered from the row menu, in funnel order. */
export const STAGE_MOVES: readonly { stage: LifecycleStage; label: string }[] = [
  { stage: 'mql', label: 'Mark as MQL' },
  { stage: 'sql', label: 'Mark as SQL' },
  { stage: 'opportunity', label: 'Convert to opportunity' },
];

const FUNNEL: readonly LifecycleStage[] = ['lead', 'mql', 'sql', 'opportunity', 'customer'];

/** Forward moves from the current stage, plus "lost" while the lead is still open. */
export function stageMovesFor(stage: LifecycleStage) {
  const current = FUNNEL.indexOf(stage);
  const forward = STAGE_MOVES.filter(
    (move) => current !== -1 && FUNNEL.indexOf(move.stage) > current,
  );
  const canLose = stage !== 'lost' && stage !== 'customer';
  return { forward, canLose };
}
