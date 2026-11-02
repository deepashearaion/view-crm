import type { z } from 'zod';

import type { DealPriority, StageColor, StageKind } from './constants';
import type { dealFormSchema, stageFormSchema } from './schemas';

export type { DealPriority, StageColor, StageKind };

export interface DealStage {
  id: string;
  name: string;
  kind: StageKind;
  /** Win probability 0–100, used for the weighted forecast. */
  probability: number;
  color: StageColor;
}

export interface DealDto {
  id: number;
  title: string;
  value: number;
  stage_id: string;
  owner_id: number | null;
  contact_id: number | null;
  company_id: number | null;
  priority: DealPriority;
  expected_close: string | null;
  created_at: string;
  updated_at: string;
}

export type DealWriteDto = Partial<Omit<DealDto, 'id' | 'created_at' | 'updated_at'>>;

export interface Deal {
  id: string;
  title: string;
  value: number;
  stageId: string;
  ownerId: string | null;
  contactId: string | null;
  companyId: string | null;
  priority: DealPriority;
  expectedClose: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DealFormValues = z.input<typeof dealFormSchema>;
export type DealFormOutput = z.output<typeof dealFormSchema>;
export type StageFormValues = z.input<typeof stageFormSchema>;
export type StageFormOutput = z.output<typeof stageFormSchema>;
