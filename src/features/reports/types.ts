import type { z } from 'zod';

import type { REPORT_MODULES, REPORT_TYPES } from './constants';
import type { reportFormSchema } from './schemas';

export type ReportModule = (typeof REPORT_MODULES)[number];
export type ReportType = (typeof REPORT_TYPES)[number]['value'];

export interface ReportDto {
  id: number;
  name: string;
  module: ReportModule;
  type: ReportType;
  description: string;
  owner_id: number | null;
  created_at: string;
}

export interface Report {
  id: string;
  name: string;
  module: ReportModule;
  type: ReportType;
  description: string;
  ownerId: string | null;
  createdAt: string;
}

export type ReportFormValues = z.infer<typeof reportFormSchema>;
