import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { MockApiService } from '../lib/mockApi';
import type { SearchParams } from '../types';

export function usePokemonSearch(params: SearchParams) {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'search', params.name, params.pageSize],
    queryFn: ({ pageParam = 1 }) =>
      MockApiService.searchPokemon({
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
    queryFn: () => MockApiService.getPokemonDetail(nameOrId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!nameOrId,
  });
}
