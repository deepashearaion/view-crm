import { http } from '@/services';

import type { SalesDashboard, SalesDashboardDto } from '../types';

const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

export async function fetchSalesDashboard(signal?: AbortSignal): Promise<SalesDashboard> {
  const dto = await http.get<Partial<SalesDashboardDto>>('/api/dashboard/sales', { signal });
  return {
    openDeals: num(dto.total_open_deals),
    openDealValue: num(dto.total_open_deal_value),
    won: num(dto.total_won),
    lost: num(dto.total_loss),
    newCustomers: num(dto.total_new_customers),
    arr: num(dto.total_arr),
    mrr: num(dto.total_mrr),
  };
}
