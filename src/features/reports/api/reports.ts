import { http } from '@/services';

import type { Report, ReportDto, ReportFormValues } from '../types';

export function toReport(dto: ReportDto): Report {
  return {
    id: String(dto.id),
    name: dto.name,
    module: dto.module,
    type: dto.type,
    description: dto.description,
    ownerId: dto.owner_id === null ? null : String(dto.owner_id),
    createdAt: dto.created_at,
  };
}

export async function fetchReports(signal?: AbortSignal): Promise<Report[]> {
  const response = await http.get<{ reports: ReportDto[] }>('/api/reports', { signal });
  return response.reports.map(toReport);
}

export async function createReport(values: ReportFormValues): Promise<Report> {
  const response = await http.post<{ report: ReportDto }>('/api/reports', values);
  return toReport(response.report);
}

export async function deleteReport(id: string): Promise<void> {
  await http.delete(`/api/reports/${encodeURIComponent(id)}`);
}
