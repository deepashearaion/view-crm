import { http } from '@/services';

import type {
  Task,
  TaskDto,
  TaskFormOutput,
  TaskFormValues,
  TaskStatus,
  TaskWriteDto,
} from '../types';

const idOrNull = (value: number | null) => (value === null ? null : String(value));
const numberOrNull = (value: string) => (value ? Number(value) : null);

export function toTask(dto: TaskDto): Task {
  return {
    id: String(dto.id),
    title: dto.title,
    type: dto.type,
    dueAt: dto.due_at,
    ownerId: idOrNull(dto.owner_id),
    contactId: idOrNull(dto.contact_id),
    companyId: idOrNull(dto.company_id),
    description: dto.description,
    origin: dto.origin,
    completedAt: dto.completed_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

/** Overdue / upcoming / completed, derived from the dates so it is always current. */
export function taskStatus(
  task: Pick<Task, 'dueAt' | 'completedAt'>,
  now = Date.now(),
): TaskStatus {
  if (task.completedAt) return 'completed';
  return new Date(task.dueAt).getTime() < now ? 'overdue' : 'upcoming';
}

export function taskToFormValues(task?: Task, defaultOwnerId = ''): TaskFormValues {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return {
    title: task?.title ?? '',
    type: task?.type ?? 'call',
    dueAt: task ? new Date(task.dueAt) : tomorrow,
    ownerId: task ? (task.ownerId ?? '') : defaultOwnerId,
    contactId: task?.contactId ?? '',
    companyId: task?.companyId ?? '',
    description: task?.description ?? '',
  };
}

export function formValuesToDto(values: TaskFormOutput): TaskWriteDto {
  return {
    title: values.title,
    type: values.type,
    due_at: values.dueAt.toISOString(),
    owner_id: numberOrNull(values.ownerId),
    contact_id: numberOrNull(values.contactId),
    company_id: numberOrNull(values.companyId),
    description: values.description,
  };
}

export async function fetchTasks(signal?: AbortSignal): Promise<Task[]> {
  const response = await http.get<{ tasks: TaskDto[] }>('/api/tasks', { signal });
  return response.tasks.map(toTask);
}

export async function createTask(body: TaskWriteDto): Promise<Task> {
  const response = await http.post<{ task: TaskDto }>('/api/tasks', body);
  return toTask(response.task);
}

export async function updateTask(id: string, body: TaskWriteDto): Promise<Task> {
  const response = await http.patch<{ task: TaskDto }>(
    `/api/tasks/${encodeURIComponent(id)}`,
    body,
  );
  return toTask(response.task);
}

export async function deleteTask(id: string): Promise<void> {
  await http.delete(`/api/tasks/${encodeURIComponent(id)}`);
}
