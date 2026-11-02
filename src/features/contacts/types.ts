import type { z } from 'zod';

import type { LEAD_STATUSES } from './constants';
import type { contactFormSchema, contactTripSchema } from './schemas';

export type LeadStatusId = (typeof LEAD_STATUSES)[number]['id'];

/** Trip details captured by the travel desk. Not persisted by the backend yet. */
export type ContactTripDetails = z.infer<typeof contactTripSchema>;

/** Contact as returned by the REST API (snake_case). */
export interface ContactDto {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  alternate_mobile: string;
  company_id: number | null;
  lead_status_id: number | null;
  lead_owner_id: number | null;
  destination: string;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
  /** Only stored by the mock API until the backend adds trip columns. */
  trip?: ContactTripDetails;
}

/** Writable fields for POST/PATCH /api/contacts. */
export type ContactWriteDto = Partial<Omit<ContactDto, 'id' | 'created_at' | 'updated_at'>>;

/** Contact as used in the UI (camelCase, derived fields). */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobile: string;
  alternateMobile: string;
  companyId: number | null;
  leadStatusId: number | null;
  leadOwnerId: string | null;
  destination: string;
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  trip?: ContactTripDetails;
}

export type ContactFormValues = z.input<typeof contactFormSchema>;
export type ContactFormOutput = z.output<typeof contactFormSchema>;
