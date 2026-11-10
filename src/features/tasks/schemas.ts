import { z } from 'zod';

import { TASK_PRIORITIES, TASK_TYPES } from './constants';

const typeValues = TASK_TYPES.map((type) => type.value) as [
  (typeof TASK_TYPES)[number]['value'],
  ...(typeof TASK_TYPES)[number]['value'][],
];
const priorityValues = TASK_PRIORITIES.map((priority) => priority.value) as [
  (typeof TASK_PRIORITIES)[number]['value'],
  ...(typeof TASK_PRIORITIES)[number]['value'][],
];

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the task a name.')
    .max(120, 'Keep it under 120 characters.'),
  type: z.enum(typeValues),
  priority: z.enum(priorityValues),
  /** Optional: tasks may have no due date. */
  dueAt: z.date().nullable(),
  /** Empty means "the caller" (the API default). */
  assigneeId: z.string(),
  contactId: z.string(),
  description: z.string().trim().max(2000, 'Description can be at most 2000 characters.'),
});
