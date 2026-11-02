import { useQuery } from '@tanstack/react-query';

import { fetchSalesDashboard } from '../api/sales';

export function useSalesDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'sales'],
    queryFn: ({ signal }) => fetchSalesDashboard(signal),
    refetchInterval: 60_000,
  });
}
