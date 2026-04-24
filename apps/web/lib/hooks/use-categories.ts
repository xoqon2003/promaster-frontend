'use client';

/**
 * `useCategories()` — kategoriyalar ro'yxati hooki.
 *
 * Task: T3.03
 * QueryKey: `['masters', 'categories']`
 *
 * Kategoriyalar kam o'zgaradi — `staleTime` global 5 daqiqa etarli. Home
 * Categories Rail va Search filter panel'i bir xil cache'dan foydalanadi.
 */
import { useQuery } from '@tanstack/react-query';

import { mastersApi } from '@/lib/masters/api-client';
import { mastersKeys } from '@/lib/masters/query-keys';
import type { Category } from '@/lib/masters/schemas';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: mastersKeys.categories(),
    queryFn: () => mastersApi.getCategories(),
  });
}
