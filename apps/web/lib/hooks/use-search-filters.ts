'use client';

/**
 * `useSearchFilters()` — Search sahifa filter state'i URL'ga sinxron.
 *
 * Task: T3.04
 *
 * Dizayn:
 *  - URL = source of truth (ulashish, back/forward, refresh — hammasi ishlaydi)
 *  - Default qiymatlar URL'ga yozilmaydi (`clearOnDefault: true`)
 *  - Filter o'zgarganda `page` 1'ga qaytadi (yangi qidiruv — eski sahifa mantiqiy emas)
 *  - `bounds` URL'da yo'q — map viewport client-side state (juda ko'p bayt)
 *
 * Consumer:
 * ```tsx
 * const { filters, apiFilter, setFilters, resetFilters } = useSearchFilters();
 * const { data } = useMasters(apiFilter);
 * ```
 *
 * `filters` nuqs'dan kelgan xom qiymatlar (null'lar bor — string|null).
 * `apiFilter` — `SearchFilterInput` shakliga yaqin, null'lar olib tashlangan,
 *   `useMasters(apiFilter)` ga to'g'ridan-to'g'ri uzatiladi.
 */
import {
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';

import type { FilterableTrustLevel, SearchFilterInput, SortOption } from '@/lib/masters/schemas';

// ─── Parser map ──────────────────────────────────────────────────────────────

const FILTERABLE_TRUST_LEVELS: FilterableTrustLevel[] = ['verified', 'pro', 'premium'];
const SORT_OPTIONS: SortOption[] = ['rating', 'price', 'distance', 'newest'];

const DEFAULT_SORT: SortOption = 'rating';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

/**
 * Filter parser map — `useQueryStates` uchun.
 *
 * `clearOnDefault: true` (global, useQueryStates options) — default qiymatlar
 * URL'da ko'rinmaydi. `withDefault` qiymati esa setState paytida "reset"
 * semantikasini beradi.
 */
const FILTER_PARSERS = {
  q: parseAsString.withDefault(''),
  categoryId: parseAsString,
  rating: parseAsFloat,
  priceFrom: parseAsInteger,
  priceTo: parseAsInteger,
  online: parseAsBoolean,
  trustLevel: parseAsStringEnum<FilterableTrustLevel>(FILTERABLE_TRUST_LEVELS),
  sort: parseAsStringEnum<SortOption>(SORT_OPTIONS).withDefault(DEFAULT_SORT),
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
};

// ─── Derived API filter ──────────────────────────────────────────────────────

/** nuqs qiymatlaridan null'larni olib tashlab, SearchFilterInput shakliga keltiradi. */
function toApiFilter(nuqsValues: NuqsFilterValues): SearchFilterInput {
  const apiFilter: SearchFilterInput = {
    sort: nuqsValues.sort,
    page: nuqsValues.page,
    pageSize: nuqsValues.pageSize,
  };

  if (nuqsValues.q) apiFilter.q = nuqsValues.q;
  if (nuqsValues.categoryId) apiFilter.categoryId = nuqsValues.categoryId;
  if (nuqsValues.rating !== null) apiFilter.rating = nuqsValues.rating;
  if (nuqsValues.priceFrom !== null) apiFilter.priceFrom = nuqsValues.priceFrom;
  if (nuqsValues.priceTo !== null) apiFilter.priceTo = nuqsValues.priceTo;
  if (nuqsValues.online !== null) apiFilter.online = nuqsValues.online;
  if (nuqsValues.trustLevel !== null) apiFilter.trustLevel = nuqsValues.trustLevel;

  return apiFilter;
}

// ─── Types ───────────────────────────────────────────────────────────────────

/** useQueryStates qaytaradigan shakl — null'lar bor. */
type NuqsFilterValues = {
  q: string;
  categoryId: string | null;
  rating: number | null;
  priceFrom: number | null;
  priceTo: number | null;
  online: boolean | null;
  trustLevel: FilterableTrustLevel | null;
  sort: SortOption;
  page: number;
  pageSize: number;
};

/** setFilters uchun partial update (null = clear). */
type SetFiltersInput = Partial<{
  q: string | null;
  categoryId: string | null;
  rating: number | null;
  priceFrom: number | null;
  priceTo: number | null;
  online: boolean | null;
  trustLevel: FilterableTrustLevel | null;
  sort: SortOption | null;
  page: number | null;
  pageSize: number | null;
}>;

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Qidiruv filterlarini URL'dan o'qiydi va yangilaydi.
 *
 * Filter o'zgarishi har doim `page = 1` ga reset qiladi (page propsi
 * `setFilters`'ga kiritilmagan bo'lsa). Pagination tugmasi esa explicit
 * `setFilters({ page: 2 })` bilan chaqiradi — bu conflict yo'q.
 */
export function useSearchFilters() {
  const [filters, setFiltersRaw] = useQueryStates(FILTER_PARSERS, {
    clearOnDefault: true,
    history: 'push',
  });

  /**
   * Filter yangilash — agar `page` explicit berilmagan bo'lsa, avtomatik 1'ga.
   *
   * Sabab: foydalanuvchi "rating 4+" filterini qo'yganda 5-sahifada turgan
   * bo'lsa — 5-sahifada filtrlangan natija hech qanday mantiqqa ega emas.
   */
  const setFilters = useCallback(
    (patch: SetFiltersInput) => {
      const isPaginationOnly = 'page' in patch || 'pageSize' in patch;
      const finalPatch: SetFiltersInput =
        isPaginationOnly || Object.keys(patch).length === 0 ? patch : { ...patch, page: 1 };
      return setFiltersRaw(finalPatch);
    },
    [setFiltersRaw],
  );

  const resetFilters = useCallback(() => {
    return setFiltersRaw({
      q: null,
      categoryId: null,
      rating: null,
      priceFrom: null,
      priceTo: null,
      online: null,
      trustLevel: null,
      sort: null,
      page: null,
      pageSize: null,
    });
  }, [setFiltersRaw]);

  const apiFilter = useMemo(() => toApiFilter(filters), [filters]);

  return {
    filters,
    apiFilter,
    setFilters,
    resetFilters,
  };
}

export type UseSearchFiltersReturn = ReturnType<typeof useSearchFilters>;
