export const COMPANY_STATUSES = [
  { value: 'new', label: 'New', variant: 'outline' },
  { value: 'cold', label: 'Cold', variant: 'cold' },
  { value: 'warm', label: 'Warm', variant: 'warm' },
  { value: 'hot', label: 'Hot', variant: 'hot' },
  { value: 'contacted', label: 'Contacted', variant: 'human' },
  { value: 'qualified', label: 'Qualified', variant: 'ai' },
  { value: 'proposal_sent', label: 'Proposal sent', variant: 'decision' },
] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number]['value'];

export function companyStatusByValue(value: string | null | undefined) {
  return COMPANY_STATUSES.find((status) => status.value === value);
}

export const COMPANY_SOURCES = [
  'Website',
  'LinkedIn',
  'Cold Call',
  'Referral',
  'Advertisement',
  'Partner',
  'Trade Show',
  'Others',
] as const;

export const CUSTOM_FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'checkbox', label: 'Yes / No' },
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number]['value'];

export const companyKeys = {
  all: ['companies'] as const,
  list: () => [...companyKeys.all, 'list'] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
  fields: () => [...companyKeys.all, 'fields'] as const,
};
