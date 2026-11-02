import { http } from '@/services';
import type { ApiResponse } from '@/types';

import type { RepAlert } from '../types';

export async function fetchRepAlerts(signal?: AbortSignal): Promise<RepAlert[]> {
  const response = await http.get<ApiResponse<RepAlert[]>>('/api/alerts', { signal });
  return response.data;
}

export async function markAlertRead(id: string): Promise<RepAlert> {
  const response = await http.patch<ApiResponse<RepAlert>>(
    `/api/alerts/${encodeURIComponent(id)}`,
    {
      read: true,
    },
  );
  return response.data;
}

export async function markAllAlertsRead(): Promise<void> {
  await http.post('/api/alerts/read-all');
}
