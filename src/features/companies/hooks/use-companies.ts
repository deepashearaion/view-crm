import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  createCompany,
  createCustomField,
  deleteCompany,
  fetchCompanies,
  fetchCompany,
  fetchCustomFields,
  updateCompany,
} from '../api/companies';
import { companyKeys } from '../constants';
import type { Company, CompanyWriteDto, CustomFieldDefinition } from '../types';

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: ({ signal }) => fetchCompanies(signal),
  });
}

/** Map of company id → company, e.g. to show names for contacts' company_id. */
export function useCompanyLookup(): Map<string, Company> {
  const { data } = useCompanies();
  return useMemo(() => new Map((data ?? []).map((company) => [company.id, company])), [data]);
}

export function useCompany(id: string | null) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: companyKeys.detail(id ?? ''),
    queryFn: ({ signal }) => fetchCompany(id ?? '', signal),
    enabled: id !== null,
    initialData: () =>
      queryClient.getQueryData<Company[]>(companyKeys.list())?.find((company) => company.id === id),
  });
}

function useUpsert() {
  const queryClient = useQueryClient();
  return (company: Company) => {
    queryClient.setQueryData<Company[]>(companyKeys.list(), (companies = []) =>
      companies.some((item) => item.id === company.id)
        ? companies.map((item) => (item.id === company.id ? company : item))
        : [company, ...companies],
    );
    queryClient.setQueryData(companyKeys.detail(company.id), company);
  };
}

export function useCreateCompany() {
  const upsert = useUpsert();
  return useMutation({ mutationFn: createCompany, onSuccess: upsert });
}

export function useUpdateCompany() {
  const upsert = useUpsert();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CompanyWriteDto }) => updateCompany(id, body),
    onSuccess: upsert,
  });
}

export function useDeleteCompanies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map(deleteCompany));
      return {
        succeeded: ids.filter((_, index) => results[index]?.status === 'fulfilled'),
        failed: ids.filter((_, index) => results[index]?.status === 'rejected'),
      };
    },
    onSuccess: ({ succeeded }) => {
      const removed = new Set(succeeded);
      queryClient.setQueryData<Company[]>(companyKeys.list(), (companies) =>
        companies?.filter((company) => !removed.has(company.id)),
      );
    },
  });
}

export function useCustomFields() {
  return useQuery({
    queryKey: companyKeys.fields(),
    queryFn: ({ signal }) => fetchCustomFields(signal),
    staleTime: 5 * 60_000,
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomField,
    onSuccess: (field) => {
      queryClient.setQueryData<CustomFieldDefinition[]>(companyKeys.fields(), (fields = []) => [
        ...fields,
        field,
      ]);
    },
  });
}
