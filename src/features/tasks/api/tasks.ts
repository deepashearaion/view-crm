import { http } from '@/services';

import type {
  Task,
  TaskCreateDto,
  TaskDisplayStatus,
  TaskDto,
  TaskFormOutput,
  TaskFormValues,
  TaskPatchDto,
} from '../types';

const BASE = '/api/v1/tasks';
const PAGE_SIZE = 200;
/** The table filters client-side, so the whole list is loaded, up to this many rows. */
const MAX_TASKS = 5_000;

const idOrNull = (value: number | null) => (value === null ? null : String(value));

export function toTask(dto: TaskDto): Task {
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description,
    type: dto.type,
    priority: dto.priority,
    status: dto.status,
    origin: dto.origin,
    dueAt: dto.due_at,
    assigneeId: String(dto.assignee_id),
    createdById: idOrNull(dto.created_by_id),
    contactId: idOrNull(dto.contact_id),
    completedAt: dto.completed_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

/** True when the workflow (not a person) created the task. */
export function isAutomatedTask(task: Pick<Task, 'origin'>): boolean {
  return task.origin !== 'manual';
}

/**
 * Display status: done / cancelled come from the stored status; open tasks are
 * overdue, upcoming or without a due date, derived from `dueAt` so it is always current.
 */
export function taskStatus(
  task: Pick<Task, 'status' | 'dueAt'>,
  now = Date.now(),
): TaskDisplayStatus {
  if (task.status === 'done') return 'done';
  if (task.status === 'cancelled') return 'cancelled';
  if (!task.dueAt) return 'no_due_date';
  return new Date(task.dueAt).getTime() < now ? 'overdue' : 'upcoming';
}

export function taskToFormValues(task?: Task, defaultAssigneeId = ''): TaskFormValues {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return {
    title: task?.title ?? '',
    type: task?.type ?? 'follow_up',
    priority: task?.priority ?? 'normal',
    dueAt: task ? (task.dueAt ? new Date(task.dueAt) : null) : tomorrow,
    assigneeId: task ? task.assigneeId : defaultAssigneeId,
    contactId: task?.contactId ?? '',
    description: task?.description ?? '',
  };
}

interface DtoOptions {
  /** Only managers and above may set the assignee; otherwise the API defaults it to the caller. */
  canReassign: boolean;
}

export function formValuesToCreateDto(
  values: TaskFormOutput,
  { canReassign }: DtoOptions,
): TaskCreateDto {
  const body: TaskCreateDto = {
    title: values.title,
    type: values.type,
    priority: values.priority,
  };
  if (values.description) body.description = values.description;
  if (values.contactId) body.contact_id = Number(values.contactId);
  if (values.dueAt) body.due_at = values.dueAt.toISOString();
  if (canReassign && values.assigneeId) body.assignee_id = Number(values.assigneeId);
  return body;
}

/** Only the fields that changed. The API can't change a task's contact after creation. */
export function formValuesToPatchDto(
  values: TaskFormOutput,
  task: Task,
  { canReassign }: DtoOptions,
): TaskPatchDto {
  const body: TaskPatchDto = {};
  if (values.title !== task.title) body.title = values.title;
  if (values.description !== task.description) body.description = values.description;
  if (values.type !== task.type) body.type = values.type;
  if (values.priority !== task.priority) body.priority = values.priority;
  if (!values.dueAt) {
    if (task.dueAt) body.clear_due_at = true;
  } else if (!task.dueAt || values.dueAt.getTime() !== new Date(task.dueAt).getTime()) {
    body.due_at = values.dueAt.toISOString();
  }
  if (canReassign && values.assigneeId && values.assigneeId !== task.assigneeId)
    body.assignee_id = Number(values.assigneeId);
  return body;
}

const taskPath = (id: string) => `${BASE}/${encodeURIComponent(id)}`;

/** Loads every task the caller can see, page by page (offset paging). */
export async function fetchTasks(signal?: AbortSignal): Promise<Task[]> {
  const tasks: Task[] = [];
  for (let offset = 0; offset < MAX_TASKS; offset += PAGE_SIZE) {
    const response = await http.get<{ tasks: TaskDto[] }>(BASE, {
      query: { limit: PAGE_SIZE, offset },
      signal,
    });
    tasks.push(...response.tasks.map(toTask));
    if (response.tasks.length < PAGE_SIZE) break;
  }
  return tasks;
}

export async function fetchTask(id: string, signal?: AbortSignal): Promise<Task> {
  const response = await http.get<{ task: TaskDto }>(taskPath(id), { signal });
  return toTask(response.task);
}

export async function createTask(body: TaskCreateDto): Promise<Task> {
  const response = await http.post<{ task: TaskDto }>(BASE, body);
  return toTask(response.task);
}

export async function updateTask(id: string, body: TaskPatchDto): Promise<Task> {
  const response = await http.patch<{ task: TaskDto }>(taskPath(id), body);
  return toTask(response.task);
}

export async function deleteTask(id: string): Promise<void> {
  await http.delete(taskPath(id));
}
