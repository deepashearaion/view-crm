import { useQuery } from '@tanstack/react-query';

import { fetchCalls } from '../api/calls';

export function useCalls() {
  return useQuery({ queryKey: ['calls'], queryFn: ({ signal }) => fetchCalls(signal) });
}
