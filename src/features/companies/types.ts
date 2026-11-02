import type { z } from 'zod';

import type { CompanyStatus, CustomFieldType } from './constants';
import type { companyFormSchema, customFieldSchema } from './schemas';

export type { CompanyStatus, CustomFieldType };

export type CustomFieldValue = string | boolean;

/** Company as returned by /api/companies (snake_case, like the rest of the API). */
export interface CompanyDto {
  id: number;
  name: string;
  email: string;
  mobile: string;
  status: CompanyStatus;
  owner_id: number | null;
  employees: number | null;
  annual_revenue: number | null;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  address: string;
  description: string;
  lead_source: string;
  website: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  twitter: string;
  email_opt_out: boolean;
  sms_opt_out: boolean;
  custom_fields: Record<string, CustomFieldValue>;
  created_at: string;
  updated_at: string;
}

export type CompanyWriteDto = Partial<Omit<CompanyDto, 'id' | 'created_at' | 'updated_at'>>;

export interface Company {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: CompanyStatus;
  ownerId: string | null;
  employees: number | null;
  annualRevenue: number | null;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  address: string;
  description: string;
  leadSource: string;
  website: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  twitter: string;
  emailOptOut: boolean;
  smsOptOut: boolean;
  customFields: Record<string, CustomFieldValue>;
  createdAt: string;
  updatedAt: string;
}

/** User-defined extra column for companies. */
export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: CustomFieldType;
}

export type CompanyFormValues = z.input<typeof companyFormSchema>;
export type CompanyFormOutput = z.output<typeof companyFormSchema>;
export type CustomFieldFormValues = z.infer<typeof customFieldSchema>;
