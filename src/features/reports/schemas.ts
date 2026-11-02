import { z } from 'zod';

import { REPORT_MODULES } from './constants';

export const reportFormSchema = z.object({
  name: z.string().trim().min(1, 'Name the report.').max(80, 'Keep it under 80 characters.'),
  module: z.enum(REPORT_MODULES),
  type: z.enum(['bar', 'line', 'pie', 'table']),
  description: z.string().trim().max(500, 'Description can be at most 500 characters.'),
});
