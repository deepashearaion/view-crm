import type { z } from 'zod';

import type { TASK_TYPES } from './constants';
import type { taskFormSchema } from './schemas';

export type TaskType = (typeof TASK_TYPES)[number]['value'];
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Stored status, as the API returns it. */
export type TaskStatus = 'open' | 'done' | 'cancelled';

/** What the UI shows: open tasks split by their due date. Derived by `taskStatus`. */
export type TaskDisplayStatus = 'overdue' | 'upcoming' | 'no_due_date' | 'done' | 'cancelled';

/** `manual` = created by a person; anything else was created by the workflow. */
export type TaskOrigin = 'manual' | 'hot_lead' | 'deal_lost' | 'invoice_review';

/** GET /api/v1/tasks item. */
export interface TaskDto {
  id: number;
  contact_id: number | null;
  assignee_id: number;
  created_by_id: number | null;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  origin: TaskOrigin;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** POST /api/v1/tasks body. Leave out fields the user didn't fill in. */
export interface TaskCreateDto {
  title: string;
  contact_id?: number;
  assignee_id?: number;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  due_at?: string;
}

/** PATCH /api/v1/tasks/{id} body. Send only changed fields; `clear_due_at` removes the due date. */
export interface TaskPatchDto {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee_id?: number;
  due_at?: string;
  clear_due_at?: true;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  origin: TaskOrigin;
  dueAt: string | null;
  assigneeId: string;
  createdById: string | null;
  contactId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskFormValues = z.input<typeof taskFormSchema>;
export type TaskFormOutput = z.output<typeof taskFormSchema>;

export type NotificationKind = 'hot_lead' | 'lead_assigned' | 'task_assigned' | 'task_overdue';

/** GET /api/v1/notifications item. */
export interface NotificationDto {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Frontend path such as `/contacts/12` or `/tasks/34`. */
  link: string;
  contact_id: number | null;
  task_id: number | null;
  read_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** In-app route for `link` (under /dashboard), or undefined when there is none. */
  href: string | undefined;
  contactId: string | null;
  taskId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
}
