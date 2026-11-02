import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createDeal,
  deleteDeal,
  fetchDeals,
  fetchStages,
  saveStages,
  updateDeal,
} from '../api/deals';
import { dealKeys } from '../constants';
import type { Deal, DealWriteDto } from '../types';

export function useDeals() {
  return useQuery({ queryKey: dealKeys.list(), queryFn: ({ signal }) => fetchDeals(signal) });
}

export function useDealStages() {
  return useQuery({
    queryKey: dealKeys.stages(),
    queryFn: ({ signal }) => fetchStages(signal),
    staleTime: 5 * 60_000,
  });
}

function useSetDeal() {
  const queryClient = useQueryClient();
  return (deal: Deal) => {
    queryClient.setQueryData<Deal[]>(dealKeys.list(), (deals = []) =>
      deals.some((item) => item.id === deal.id)
        ? deals.map((item) => (item.id === deal.id ? deal : item))
        : [deal, ...deals],
    );
  };
}

export function useCreateDeal() {
  const setDeal = useSetDeal();
  return useMutation({ mutationFn: createDeal, onSuccess: setDeal });
}

export function useUpdateDeal() {
  const setDeal = useSetDeal();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DealWriteDto }) => updateDeal(id, body),
    onSuccess: setDeal,
  });
}

/** Moves a deal to another stage optimistically (board feels instant). */
export function useMoveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      updateDeal(id, { stage_id: stageId }),
    onMutate: async ({ id, stageId }) => {
      await queryClient.cancelQueries({ queryKey: dealKeys.list() });
      const previous = queryClient.getQueryData<Deal[]>(dealKeys.list());
      queryClient.setQueryData<Deal[]>(dealKeys.list(), (deals) =>
        deals?.map((deal) => (deal.id === id ? { ...deal, stageId } : deal)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(dealKeys.list(), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: dealKeys.list() }),
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDeal,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Deal[]>(dealKeys.list(), (deals) =>
        deals?.filter((deal) => deal.id !== id),
      );
    },
  });
}

export function useSaveStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStages,
    onSuccess: (stages) => {
      queryClient.setQueryData(dealKeys.stages(), stages);
      // Deals in removed stages were reassigned server-side.
      void queryClient.invalidateQueries({ queryKey: dealKeys.list() });
    },
  });
}
