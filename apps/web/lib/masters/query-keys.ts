/**
 * Masters domeni uchun TanStack Query kalit'lari — hierarchical factory.
 *
 * Manba: https://tkdodo.eu/blog/effective-react-query-keys
 *
 * Afzalligi: `queryClient.invalidateQueries({ queryKey: mastersKeys.all })`
 * bilan butun domen bir marta invalidate bo'ladi. Ayrim `list` yoki `detail`
 * ni invalidate qilish ham oson.
 */
import type { SearchFilterInput } from './schemas';

export const mastersKeys = {
  all: ['masters'] as const,
  lists: () => [...mastersKeys.all, 'list'] as const,
  list: (filter: SearchFilterInput) => [...mastersKeys.lists(), filter] as const,
  details: () => [...mastersKeys.all, 'detail'] as const,
  detail: (id: string) => [...mastersKeys.details(), id] as const,
  recommended: (opts: { userId?: string; limit?: number }) =>
    [...mastersKeys.all, 'recommended', opts] as const,
  categories: () => ['masters', 'categories'] as const,
};
