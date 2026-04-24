/**
 * R05 Alpha Test — nuqs + Next 15 + React 19 compat smoke.
 *
 * Bu fayl faqat typecheck + build verification uchun. Agar nuqs Next 15 App
 * Router va React 19 bilan moslashsa, bu fayl muvaffaqiyatli kompilyatsiya
 * qilinadi. Keyingi qadamda T3.04 (use-search-params hook) to'liq yoziladi,
 * bu fayl esa o'chiriladi.
 */
'use client';

import {
  useQueryState,
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
  parseAsFloat,
} from 'nuqs';

// Single-value query state
export function useSearchQuery() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  return { q, setQ };
}

// Multi-value query states (search filters)
export function useSearchFilters() {
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(''),
    categoryId: parseAsString,
    rating: parseAsFloat,
    priceFrom: parseAsInteger,
    priceTo: parseAsInteger,
    online: parseAsBoolean,
    sort: parseAsString.withDefault('rating'),
    page: parseAsInteger.withDefault(1),
    view: parseAsString.withDefault('list'),
  });

  const resetFilters = () =>
    setFilters({
      q: '',
      categoryId: null,
      rating: null,
      priceFrom: null,
      priceTo: null,
      online: null,
      sort: 'rating',
      page: 1,
      view: 'list',
    });

  return { filters, setFilters, resetFilters };
}

// Type assertion — ensure nuqs types flow through
export type SearchFilters = ReturnType<typeof useSearchFilters>['filters'];
