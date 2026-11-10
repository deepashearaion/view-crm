import {
  CalendarClock,
  ClipboardList,
  Flame,
  ListTodo,
  Mail,
  MessageCircle,
  Phone,
  UserPlus,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { NotificationKind, TaskOrigin, TaskPriority } from './types';

export const TASK_TYPES = [
  { value: 'follow_up', label: 'Follow-up', icon: CalendarClock },
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'todo', label: 'To-do', icon: ListTodo },
] as const;

export function taskTypeByValue(value: string) {
  return TASK_TYPES.find((type) => type.value === value);
}

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', variant: 'outline' },
  { value: 'normal', label: 'Normal', variant: 'secondary' },
  { value: 'high', label: 'High', variant: 'warm' },
  { value: 'urgent', label: 'Urgent', variant: 'destructive' },
] as const satisfies readonly { value: TaskPriority; label: string; variant: string }[];

export function taskPriorityByValue(value: string) {
  return TASK_PRIORITIES.find((priority) => priority.value === value);
}

/** Display statuses (derived by `taskStatus`), in tab order. */
export const TASK_STATUSES = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'no_due_date', label: 'No due date' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

/** Why the workflow created a task (every origin except `manual`). */
export const TASK_ORIGIN_LABELS: Record<TaskOrigin, string> = {
  manual: 'Created by a person',
  hot_lead: 'Hot lead',
  deal_lost: 'Deal lost',
  invoice_review: 'Invoice review',
};

export const NOTIFICATION_KINDS: Record<NotificationKind, { label: string; icon: LucideIcon }> = {
  hot_lead: { label: 'Hot lead', icon: Flame },
  lead_assigned: { label: 'Lead assigned', icon: UserPlus },
  task_assigned: { label: 'Task assigned', icon: ClipboardList },
  task_overdue: { label: 'Task overdue', icon: CalendarClock },
};

export const taskKeys = {
  /** Root key; other features invalidate `['tasks']` (e.g. after a deal moves). */
  all: ['tasks'] as const,
  list: () => [...taskKeys.all, 'list'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
};
