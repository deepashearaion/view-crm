import type { TaskDto } from '@/features/tasks';

import { db, newId } from '../db';
import { mock, mockError } from '../router';

type TaskWrite = Partial<Omit<TaskDto, 'id' | 'created_at' | 'updated_at' | 'origin'>>;

function asWrite(body: unknown): TaskWrite {
  if (typeof body !== 'object' || body === null) mockError(400, 'Invalid request body');
  return body;
}

function find(id: string | undefined): TaskDto {
  const task = db.tasks.find((item) => String(item.id) === id);
  if (!task) mockError(404, 'Task not found');
  return task;
}

mock('GET', '/api/tasks', () => ({ tasks: db.tasks }));

mock('POST', '/api/tasks', ({ body }) => {
  const input = asWrite(body);
  if (!input.title?.trim()) mockError(400, 'title is required');
  if (!input.due_at) mockError(400, 'due_at is required');
  const now = new Date().toISOString();
  const task: TaskDto = {
    type: 'call',
    owner_id: null,
    contact_id: null,
    company_id: null,
    description: '',
    completed_at: null,
    ...input,
    title: input.title,
    due_at: input.due_at,
    origin: 'manual',
    id: newId(),
    created_at: now,
    updated_at: now,
  };
  db.tasks.unshift(task);
  return { task };
});

mock('PATCH', '/api/tasks/:id', ({ params, body }) => {
  const task = find(params.id);
  Object.assign(task, asWrite(body), { updated_at: new Date().toISOString() });
  return { task };
});

mock('DELETE', '/api/tasks/:id', ({ params }) => {
  const task = find(params.id);
  db.tasks = db.tasks.filter((item) => item !== task);
  return { message: 'Task deleted' };
});
