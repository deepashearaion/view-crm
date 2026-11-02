export const REP_ALERT_KINDS = [
  'hot_lead',
  'reply_received',
  'task_due',
  'deal_won',
  'deal_lost',
] as const;
export type RepAlertKind = (typeof REP_ALERT_KINDS)[number];

/** Instant notification for a sales rep (workflow: "Rep alerted instantly"). */
export interface RepAlert {
  id: string;
  kind: RepAlertKind;
  title: string;
  /** AI-generated one-line summary shown with the alert. */
  summary: string;
  /** True when the alert was raised by an automation rather than a person. */
  automated: boolean;
  read: boolean;
  createdAt: string;
  /** In-app path to open, e.g. the lead detail. */
  href?: string;
}
