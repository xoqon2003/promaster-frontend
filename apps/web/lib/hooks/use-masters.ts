'use client';

/**
 * `useMasters(filter)` — qidiruv natijalarini olish hooki.
 *
 * Task: T3.03
 * QueryKey: `['masters', 'list', filter]`
 * StaleTime: global 5 daqiqa (client-providers'da)
 *
 * Filter obyekti queryKey'ning bir qismi — har filter o'zgarganda yangi
 * fetch (va alohida cache slot) bo'ladi. Bu tabiiy — foydalanuvchi filter
 * qo'yishi bilan eski natija kerak emas.
 */
import { useQuery } from '@tanstack/react-query';

import { mastersApi } from '@/lib/masters/api-client';
import { mastersKeys } from '@/lib/masters/query-keys';
import type { SearchFilterInput, SearchResponse } from '@/lib/masters/schemas';

export function useMasters(filter: SearchFilterInput = {}) {
  return useQuery<SearchResponse>({
    queryKey: mastersKeys.list(filter),
    queryFn: () => mastersApi.search(filter),
  });
}
