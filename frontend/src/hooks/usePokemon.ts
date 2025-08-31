import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { SearchParams } from '../types';

export function usePokemonSearch(params: SearchParams) {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'search', params.name, params.pageSize],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.searchPokemon({
        ...params,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      const { page, pageSize, total } = lastPage;
      const hasMore = page * pageSize < total;
      return hasMore ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

export function usePokemonDetail(nameOrId: string | number) {
  return useQuery({
    queryKey: ['pokemon', 'detail', nameOrId],
    queryFn: () => apiClient.getPokemonDetail(nameOrId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!nameOrId,
  });
}

// Pokemon detail tab hooks
export function usePokemonOverview(nameOrId: string | number) {
  return useQuery({
    queryKey: ['pokemon', 'overview', nameOrId],
    queryFn: () => apiClient.getPokemonOverview(nameOrId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!nameOrId,
  });
}

export function usePokemonAbilities(nameOrId: string | number) {
  return useQuery({
    queryKey: ['pokemon', 'abilities', nameOrId],
    queryFn: () => apiClient.getPokemonAbilities(nameOrId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!nameOrId,
  });
}

export function usePokemonMoves(nameOrId: string | number) {
  return useQuery({
    queryKey: ['pokemon', 'moves', nameOrId],
    queryFn: () => apiClient.getPokemonMoves(nameOrId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!nameOrId,
  });
}

export function usePokemonForms(nameOrId: string | number) {
  return useQuery({
    queryKey: ['pokemon', 'forms', nameOrId],
    queryFn: () => apiClient.getPokemonForms(nameOrId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!nameOrId,
  });
}
