import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import {
  createDeal,
  deleteDeal,
  fetchDeal,
  fetchDealHistory,
  fetchDeals,
  fetchForecast,
  moveDeal,
  updateDeal,
} from '../api/deals';
import { fetchStages, syncStages } from '../api/stages';
import { MOVE_SIDE_EFFECT_KEYS, dealKeys, type ForecastParams } from '../constants';
import type { Deal, DealStage, DealUpdateDto, StageFormOutput } from '../types';

/** Every visible deal (paged through client-side; the board filters locally). */
export function useDeals() {
  return useQuery({ queryKey: dealKeys.list(), queryFn: ({ signal }) => fetchDeals(signal) });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: dealKeys.detail(id ?? ''),
    queryFn: ({ signal }) => fetchDeal(id ?? '', signal),
    enabled: Boolean(id),
  });
}

export function useDealStages() {
  return useQuery({
    queryKey: dealKeys.stages(),
    queryFn: ({ signal }) => fetchStages(signal),
    staleTime: 5 * 60_000,
  });
}

/** Stage changes of one deal, oldest first as returned by the API. */
export function useDealHistory(id: string | undefined) {
  return useQuery({
    queryKey: dealKeys.history(id ?? ''),
    queryFn: ({ signal }) => fetchDealHistory(id ?? '', signal),
    enabled: Boolean(id),
  });
}

/** GET /api/v1/deals/forecast: weighted / forecast / commit per month. */
export function useDealForecast(params: ForecastParams) {
  return useQuery({
    queryKey: dealKeys.forecast(params),
    queryFn: ({ signal }) => fetchForecast(params, signal),
  });
}

/** Stage totals and the forecast are computed server-side from deals. */
function invalidateDerived(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: dealKeys.stages() });
  void queryClient.invalidateQueries({ queryKey: [...dealKeys.all, 'forecast'] });
}

function useSetDeal() {
  const queryClient = useQueryClient();
  return (deal: Deal) => {
    queryClient.setQueryData<Deal[]>(dealKeys.list(), (deals = []) =>
      deals.some((item) => item.id === deal.id)
        ? deals.map((item) => (item.id === deal.id ? deal : item))
        : [deal, ...deals],
    );
    queryClient.setQueryData(dealKeys.detail(deal.id), deal);
    invalidateDerived(queryClient);
  };
}

export function useCreateDeal() {
  const setDeal = useSetDeal();
  return useMutation({ mutationFn: createDeal, onSuccess: setDeal });
}

export function useUpdateDeal() {
  const setDeal = useSetDeal();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DealUpdateDto }) => updateDeal(id, body),
    onSuccess: setDeal,
  });
}

export interface MoveDealVariables {
  id: string;
  stageId: string;
  /** Required by lost stages. */
  lostReason?: string;
}

/**
 * POST /deals/{id}/stage, optimistically (the board feels instant) with rollback on error.
 * Winning or losing changes tasks, invoices and contacts server-side, so those refetch too.
 */
export function useMoveDeal() {
  const queryClient = useQueryClient();
  const setDeal = useSetDeal();
  return useMutation({
    mutationFn: ({ id, stageId, lostReason }: MoveDealVariables) =>
      moveDeal(id, {
        stage_id: Number(stageId),
        ...(lostReason ? { lost_reason: lostReason } : {}),
      }),
    onMutate: async ({ id, stageId, lostReason }) => {
      await queryClient.cancelQueries({ queryKey: dealKeys.list() });
      const previous = queryClient.getQueryData<Deal[]>(dealKeys.list());
      const stage = queryClient
        .getQueryData<DealStage[]>(dealKeys.stages())
        ?.find((item) => item.id === stageId);
      queryClient.setQueryData<Deal[]>(dealKeys.list(), (deals) =>
        deals?.map((deal) =>
          deal.id === id
            ? {
                ...deal,
                stageId,
                stageName: stage?.name ?? deal.stageName,
                status: stage?.kind ?? deal.status,
                lostReason: lostReason ?? deal.lostReason,
              }
            : deal,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(dealKeys.list(), context?.previous);
    },
    onSuccess: setDeal,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.all });
      for (const queryKey of MOVE_SIDE_EFFECT_KEYS) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
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
      queryClient.removeQueries({ queryKey: dealKeys.detail(id) });
      invalidateDerived(queryClient);
    },
  });
}

export interface SaveStagesVariables {
  original: DealStage[];
  stages: StageFormOutput['stages'];
  /** Called as each new stage is created, so a retry after a partial failure won't recreate it. */
  onCreated: (rowIndex: number, id: string) => void;
}

/** Diffs the edited list into POST / PATCH / DELETE /api/v1/deal-stages calls. */
export function useSaveStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ original, stages, onCreated }: SaveStagesVariables) =>
      syncStages(original, stages, onCreated),
    // Refetch even after a partial failure, so the next attempt diffs against the server.
    onSettled: async () => {
      void queryClient.invalidateQueries({ queryKey: dealKeys.list() });
      await queryClient.invalidateQueries({ queryKey: dealKeys.stages() });
    },
  });
}
