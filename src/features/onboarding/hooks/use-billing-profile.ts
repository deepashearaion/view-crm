import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchBillingProfile, updateBillingProfile } from '../api/billing-profile';
import { billingProfileKeys } from '../constants';

export function useBillingProfile() {
  return useQuery({
    queryKey: billingProfileKeys.all,
    queryFn: ({ signal }) => fetchBillingProfile(signal),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateBillingProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBillingProfile,
    onSuccess: (profile) => queryClient.setQueryData(billingProfileKeys.all, profile),
  });
}
