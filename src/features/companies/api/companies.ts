import { http } from '@/services';

import type {
  Company,
  CompanyDto,
  CompanyFormOutput,
  CompanyFormValues,
  CompanyWriteDto,
  CustomFieldDefinition,
  CustomFieldFormValues,
} from '../types';

export function toCompany(dto: CompanyDto): Company {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    mobile: dto.mobile,
    status: dto.status,
    ownerId: dto.owner_id === null ? null : String(dto.owner_id),
    employees: dto.employees,
    annualRevenue: dto.annual_revenue,
    city: dto.city,
    state: dto.state,
    country: dto.country,
    zipcode: dto.zipcode,
    address: dto.address,
    description: dto.description,
    leadSource: dto.lead_source,
    website: dto.website,
    linkedin: dto.linkedin,
    instagram: dto.instagram,
    facebook: dto.facebook,
    twitter: dto.twitter,
    emailOptOut: dto.email_opt_out,
    smsOptOut: dto.sms_opt_out,
    customFields: dto.custom_fields,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function companyToFormValues(company?: Company, defaultOwnerId = ''): CompanyFormValues {
  const count = (value: number | null | undefined) =>
    value === null || value === undefined ? '' : String(value);
  return {
    name: company?.name ?? '',
    email: company?.email ?? '',
    mobile: company?.mobile ?? '',
    status: company?.status ?? 'new',
    ownerId: company ? (company.ownerId ?? '') : defaultOwnerId,
    employees: count(company?.employees),
    annualRevenue: count(company?.annualRevenue),
    city: company?.city ?? '',
    state: company?.state ?? '',
    country: company?.country ?? 'India',
    zipcode: company?.zipcode ?? '',
    address: company?.address ?? '',
    description: company?.description ?? '',
    leadSource: company?.leadSource ?? '',
    website: company?.website ?? '',
    linkedin: company?.linkedin ?? '',
    instagram: company?.instagram ?? '',
    facebook: company?.facebook ?? '',
    twitter: company?.twitter ?? '',
    emailOptOut: company?.emailOptOut ?? false,
    smsOptOut: company?.smsOptOut ?? false,
    customFields: company?.customFields ?? {},
  };
}

export function formValuesToDto(values: CompanyFormOutput): CompanyWriteDto {
  return {
    name: values.name,
    email: values.email,
    mobile: values.mobile,
    status: values.status,
    owner_id: values.ownerId ? Number(values.ownerId) : null,
    employees: values.employees ? Number(values.employees) : null,
    annual_revenue: values.annualRevenue ? Number(values.annualRevenue) : null,
    city: values.city,
    state: values.state,
    country: values.country,
    zipcode: values.zipcode,
    address: values.address,
    description: values.description,
    lead_source: values.leadSource,
    website: values.website,
    linkedin: values.linkedin,
    instagram: values.instagram,
    facebook: values.facebook,
    twitter: values.twitter,
    email_opt_out: values.emailOptOut,
    sms_opt_out: values.smsOptOut,
    custom_fields: values.customFields,
  };
}

export async function fetchCompanies(signal?: AbortSignal): Promise<Company[]> {
  const response = await http.get<{ companies: CompanyDto[] }>('/api/companies', { signal });
  return response.companies.map(toCompany);
}

export async function fetchCompany(id: string, signal?: AbortSignal): Promise<Company> {
  const response = await http.get<{ company: CompanyDto }>(
    `/api/companies/${encodeURIComponent(id)}`,
    { signal },
  );
  return toCompany(response.company);
}

export async function createCompany(body: CompanyWriteDto): Promise<Company> {
  const response = await http.post<{ company: CompanyDto }>('/api/companies', body);
  return toCompany(response.company);
}

export async function updateCompany(id: string, body: CompanyWriteDto): Promise<Company> {
  const response = await http.patch<{ company: CompanyDto }>(
    `/api/companies/${encodeURIComponent(id)}`,
    body,
  );
  return toCompany(response.company);
}

export async function deleteCompany(id: string): Promise<void> {
  await http.delete(`/api/companies/${encodeURIComponent(id)}`);
}

export async function fetchCustomFields(signal?: AbortSignal): Promise<CustomFieldDefinition[]> {
  const response = await http.get<{ fields: CustomFieldDefinition[] }>('/api/companies/fields', {
    signal,
  });
  return response.fields;
}

export async function createCustomField(
  body: CustomFieldFormValues,
): Promise<CustomFieldDefinition> {
  const response = await http.post<{ field: CustomFieldDefinition }>('/api/companies/fields', body);
  return response.field;
}
