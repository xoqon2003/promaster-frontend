'use client';

/**
 * `useMaster(id)` — bitta usta ma'lumotini olish hooki.
 *
 * Task: T3.03
 * QueryKey: `['masters', 'detail', id]`
 *
 * ID bo'sh bo'lsa — `enabled: false` (request yuborilmaydi). Bu quick
 * profile drawer-da foydali: route param hali yo'q bo'lsa fetch'ni
 * kechiktirish kerak.
 */
import { useQuery } from '@tanstack/react-query';

import { mastersApi } from '@/lib/masters/api-client';
import { mastersKeys } from '@/lib/masters/query-keys';
import type { Master } from '@/lib/masters/schemas';

export function useMaster(id: string | undefined) {
  return useQuery<Master | null>({
    queryKey: mastersKeys.detail(id ?? ''),
    queryFn: () => mastersApi.getById(id!),
    enabled: Boolean(id),
  });
}
