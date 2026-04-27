'use client';

/**
 * `useRecommendedMasters({ userId?, limit? })` — Home "Tavsiya etilgan" grid.
 *
 * Task: T3.03
 * QueryKey: `['masters', 'recommended', { userId, limit }]`
 *
 * Hozircha mock adapter verified+ ustalar orasidan rating desc bo'yicha
 * top-N qaytaradi. Real API tayyor bo'lganda `userId` ML modelga uzatiladi
 * va personalizatsiya ishlaydi.
 */
import { useQuery } from '@tanstack/react-query';

import { mastersApi } from '@/lib/masters/api-client';
import { mastersKeys } from '@/lib/masters/query-keys';
import type { Master } from '@/lib/masters/schemas';

export interface UseRecommendedMastersOptions {
  userId?: string;
  limit?: number;
}

export function useRecommendedMasters(opts: UseRecommendedMastersOptions = {}) {
  const { userId, limit = 8 } = opts;
  const resolved = { userId, limit };

  return useQuery<Master[]>({
    queryKey: mastersKeys.recommended(resolved),
    queryFn: () => mastersApi.getRecommended(resolved),
  });
}
