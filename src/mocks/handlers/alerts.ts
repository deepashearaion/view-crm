import type { RepAlert } from '@/features/tasks';
import type { ApiResponse } from '@/types';

import { db } from '../db';
import { mock, mockError } from '../router';

mock('GET', '/api/alerts', (): ApiResponse<RepAlert[]> => ({
  data: [...db.alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
}));

mock('PATCH', '/api/alerts/:id', ({ params }): ApiResponse<RepAlert> => {
  const alert = db.alerts.find((item) => item.id === params.id);
  if (!alert) mockError(404, 'Alert not found');
  alert.read = true;
  return { data: alert };
});

mock('POST', '/api/alerts/read-all', () => {
  for (const alert of db.alerts) alert.read = true;
  return undefined;
});
