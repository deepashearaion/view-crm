import type { CompanyDto, CustomFieldDefinition } from '@/features/companies';

import { db, newId } from '../db';
import { mock, mockError } from '../router';

type CompanyWrite = Partial<Omit<CompanyDto, 'id' | 'created_at' | 'updated_at'>>;

function asWrite(body: unknown): CompanyWrite {
  if (typeof body !== 'object' || body === null) mockError(400, 'Invalid request body');
  return body;
}

function find(id: string | undefined): CompanyDto {
  const company = db.companies.find((item) => String(item.id) === id);
  if (!company) mockError(404, 'Company not found');
  return company;
}

mock('GET', '/api/companies/fields', () => ({ fields: db.companyFields }));

mock('POST', '/api/companies/fields', ({ body }) => {
  const input = body as Partial<CustomFieldDefinition> | null;
  const label = input?.label?.trim();
  if (!label) mockError(400, 'label is required');
  const id =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || `field_${String(newId())}`;
  if (db.companyFields.some((field) => field.id === id))
    mockError(409, 'A field with this name already exists');
  const field: CustomFieldDefinition = { id, label, type: input?.type ?? 'text' };
  db.companyFields.push(field);
  return { field };
});

mock('GET', '/api/companies', () => ({ companies: db.companies }));
mock('GET', '/api/companies/:id', ({ params }) => ({ company: find(params.id) }));

mock('POST', '/api/companies', ({ body }) => {
  const input = asWrite(body);
  if (!input.name?.trim()) mockError(400, 'name is required');
  const now = new Date().toISOString();
  const company: CompanyDto = {
    email: '',
    mobile: '',
    status: 'new',
    owner_id: null,
    employees: null,
    annual_revenue: null,
    city: '',
    state: '',
    country: '',
    zipcode: '',
    address: '',
    description: '',
    lead_source: '',
    website: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    email_opt_out: false,
    sms_opt_out: false,
    custom_fields: {},
    ...input,
    name: input.name,
    id: newId(),
    created_at: now,
    updated_at: now,
  };
  db.companies.unshift(company);
  return { message: 'Company created successfully', company };
});

mock('PATCH', '/api/companies/:id', ({ params, body }) => {
  const company = find(params.id);
  Object.assign(company, asWrite(body), { updated_at: new Date().toISOString() });
  return { message: 'Company updated successfully', company };
});

mock('DELETE', '/api/companies/:id', ({ params }) => {
  const company = find(params.id);
  db.companies = db.companies.filter((item) => item !== company);
  return { message: 'Company deleted successfully' };
});
