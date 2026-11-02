import type { z } from 'zod';

import type { TASK_TYPES } from './constants';
import type { taskFormSchema } from './schemas';

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

export type TaskType = (typeof TASK_TYPES)[number]['value'];

/** Derived from due/completed dates, never stored. */
export type TaskStatus = 'overdue' | 'upcoming' | 'completed';

/** Who created the task: a rep, or an automation (e.g. hot-lead routing). */
export type TaskOrigin = 'manual' | 'automation';

export interface TaskDto {
  id: number;
  title: string;
  type: TaskType;
  due_at: string;
  owner_id: number | null;
  contact_id: number | null;
  company_id: number | null;
  description: string;
  origin: TaskOrigin;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskWriteDto = Partial<Omit<TaskDto, 'id' | 'created_at' | 'updated_at' | 'origin'>>;

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  dueAt: string;
  ownerId: string | null;
  contactId: string | null;
  companyId: string | null;
  description: string;
  origin: TaskOrigin;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskFormValues = z.input<typeof taskFormSchema>;
export type TaskFormOutput = z.output<typeof taskFormSchema>;
