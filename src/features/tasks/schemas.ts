import { z } from 'zod';

import { TASK_TYPES } from './constants';

const typeValues = TASK_TYPES.map((type) => type.value) as [
  (typeof TASK_TYPES)[number]['value'],
  ...(typeof TASK_TYPES)[number]['value'][],
];

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the task a name.')
    .max(120, 'Keep it under 120 characters.'),
  type: z.enum(typeValues),
  dueAt: z.date({ error: 'Pick a due date and time.' }),
  ownerId: z.string(),
  contactId: z.string(),
  companyId: z.string(),
  description: z.string().trim().max(2000, 'Description can be at most 2000 characters.'),
});
