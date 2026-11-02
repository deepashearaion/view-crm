import type { ReportDto } from '@/features/reports';

import { db, newId } from '../db';
import { mock, mockError } from '../router';

mock('GET', '/api/reports', () => ({ reports: db.reports }));

mock('POST', '/api/reports', ({ body }) => {
  const input = body as Partial<ReportDto> | null;
  if (!input?.name?.trim() || !input.module || !input.type)
    mockError(400, 'name, module and type are required');
  const report: ReportDto = {
    id: newId(),
    name: input.name.trim(),
    module: input.module,
    type: input.type,
    description: input.description ?? '',
    owner_id: 7,
    created_at: new Date().toISOString(),
  };
  db.reports.unshift(report);
  return { report };
});

mock('DELETE', '/api/reports/:id', ({ params }) => {
  const report = db.reports.find((item) => String(item.id) === params.id);
  if (!report) mockError(404, 'Report not found');
  db.reports = db.reports.filter((item) => item !== report);
  return { message: 'Report deleted' };
});
