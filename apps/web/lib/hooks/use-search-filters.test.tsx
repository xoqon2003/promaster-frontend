/**
 * T3.04 — useSearchFilters hook tests.
 *
 * Qamrov:
 *  - URL'dan typed values o'qish (9 ta parser)
 *  - setFilters partial update — URL only changes given keys
 *  - Filter o'zgarganda page → 1 (page explicit bo'lmasa)
 *  - Page o'zgarsa — boshqa filterlar saqlanadi
 *  - resetFilters — hamma default'ga qaytadi
 *  - apiFilter — null'lar olib tashlangan, SearchFilterInput shakli
 *  - Default qiymatlar URL'da ko'rinmaydi (clearOnDefault)
 */
import { act, renderHook } from '@testing-library/react';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it, vi } from 'vitest';

import { useSearchFilters } from './use-search-filters';

// ─── URL → typed values ──────────────────────────────────────────────────────

describe('useSearchFilters — URL parse', () => {
  it("bo'sh URL bilan default qiymatlar", () => {
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(result.current.filters.q).toBe('');
    expect(result.current.filters.categoryId).toBeNull();
    expect(result.current.filters.rating).toBeNull();
    expect(result.current.filters.priceFrom).toBeNull();
    expect(result.current.filters.priceTo).toBeNull();
    expect(result.current.filters.online).toBeNull();
    expect(result.current.filters.trustLevel).toBeNull();
    expect(result.current.filters.sort).toBe('rating');
    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.pageSize).toBe(20);
  });

  it('URL: q, categoryId, rating — string/number parsed', () => {
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: '?q=usta&categoryId=elektrik&rating=4.5',
      }),
    });

    expect(result.current.filters.q).toBe('usta');
    expect(result.current.filters.categoryId).toBe('elektrik');
    expect(result.current.filters.rating).toBe(4.5);
  });

  it('URL: priceFrom, priceTo — integer parsed', () => {
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: '?priceFrom=50000&priceTo=200000',
      }),
    });

    expect(result.current.filters.priceFrom).toBe(50_000);
    expect(result.current.filters.priceTo).toBe(200_000);
  });

  it('URL: online=true/false — boolean parsed', () => {
    const { result: onResult } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?online=true' }),
    });
    expect(onResult.current.filters.online).toBe(true);

    const { result: offResult } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?online=false' }),
    });
    expect(offResult.current.filters.online).toBe(false);
  });

  it('URL: trustLevel — enum parsed, noto`g`ri qiymat null', () => {
    const { result: proResult } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?trustLevel=pro' }),
    });
    expect(proResult.current.filters.trustLevel).toBe('pro');

    // 'basic' filter enum'da yo'q — null bo'lishi kerak
    const { result: badResult } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?trustLevel=basic' }),
    });
    expect(badResult.current.filters.trustLevel).toBeNull();
  });

  it('URL: sort — enum, default=rating', () => {
    const { result: priceResult } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?sort=price' }),
    });
    expect(priceResult.current.filters.sort).toBe('price');

    // Noto'g'ri sort → default
    const { result: badResult } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?sort=invalid' }),
    });
    expect(badResult.current.filters.sort).toBe('rating');
  });

  it('URL: page=3, pageSize=10 — integer parsed', () => {
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?page=3&pageSize=10' }),
    });

    expect(result.current.filters.page).toBe(3);
    expect(result.current.filters.pageSize).toBe(10);
  });
});

// ─── apiFilter (derived) ─────────────────────────────────────────────────────

describe('useSearchFilters.apiFilter', () => {
  it("bo'sh URL — faqat default'lar (sort, page, pageSize)", () => {
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(result.current.apiFilter).toEqual({
      sort: 'rating',
      page: 1,
      pageSize: 20,
    });
  });

  it("filterlar bor — null'lar tozalangan", () => {
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: '?q=elektrik&rating=4.5&online=true',
      }),
    });

    expect(result.current.apiFilter).toEqual({
      q: 'elektrik',
      rating: 4.5,
      online: true,
      sort: 'rating',
      page: 1,
      pageSize: 20,
    });
  });

  it("q bo'sh string — apiFilter'ga kiritilmaydi", () => {
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(result.current.apiFilter.q).toBeUndefined();
  });
});

// ─── setFilters behaviour ────────────────────────────────────────────────────

describe('useSearchFilters.setFilters', () => {
  it('filter o`zgarganda URL yangilanadi', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '', onUrlUpdate }),
    });

    await act(async () => {
      await result.current.setFilters({ categoryId: 'elektrik' });
    });

    expect(onUrlUpdate).toHaveBeenCalled();
    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('categoryId')).toBe('elektrik');
  });

  it('filter o`zgarganda page avtomatik 1 ga qaytadi', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?page=5', onUrlUpdate }),
    });

    // Page=5 dan boshlangan
    expect(result.current.filters.page).toBe(5);

    await act(async () => {
      await result.current.setFilters({ rating: 4.5 });
    });

    // URL'da rating=4.5 + page clear (default=1)
    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('rating')).toBe('4.5');
    // page=1 default'ga qaytganda clearOnDefault uni URL'dan olib tashlaydi
    expect(event.searchParams.get('page')).toBeNull();
  });

  it('setFilters({ page: 2 }) — boshqa filterlarga tegmaydi', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: '?q=usta&categoryId=elektrik',
        onUrlUpdate,
      }),
    });

    await act(async () => {
      await result.current.setFilters({ page: 2 });
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('page')).toBe('2');
    expect(event.searchParams.get('q')).toBe('usta');
    expect(event.searchParams.get('categoryId')).toBe('elektrik');
  });

  it('setFilters({ pageSize: 50 }) — pagination o`zgarganda page reset emas', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?page=3', onUrlUpdate }),
    });

    await act(async () => {
      await result.current.setFilters({ pageSize: 50 });
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('pageSize')).toBe('50');
    expect(event.searchParams.get('page')).toBe('3');
  });

  it('setFilters null bilan — URL`dan tozalanadi', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: '?categoryId=elektrik',
        onUrlUpdate,
      }),
    });

    await act(async () => {
      await result.current.setFilters({ categoryId: null });
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('categoryId')).toBeNull();
  });
});

// ─── resetFilters ────────────────────────────────────────────────────────────

describe('useSearchFilters.resetFilters', () => {
  it('hamma filterni tozalaydi', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({
        searchParams:
          '?q=usta&categoryId=elektrik&rating=4.5&priceFrom=50000&online=true&trustLevel=pro&sort=price&page=3',
        onUrlUpdate,
      }),
    });

    await act(async () => {
      await result.current.resetFilters();
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('q')).toBeNull();
    expect(event.searchParams.get('categoryId')).toBeNull();
    expect(event.searchParams.get('rating')).toBeNull();
    expect(event.searchParams.get('priceFrom')).toBeNull();
    expect(event.searchParams.get('online')).toBeNull();
    expect(event.searchParams.get('trustLevel')).toBeNull();
    expect(event.searchParams.get('sort')).toBeNull(); // default=rating → clear
    expect(event.searchParams.get('page')).toBeNull(); // default=1 → clear
  });
});

// ─── clearOnDefault ──────────────────────────────────────────────────────────

describe('useSearchFilters — clearOnDefault', () => {
  it('sort=rating (default) URL`ga yozilmaydi', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: '?sort=price',
        onUrlUpdate,
      }),
    });

    await act(async () => {
      await result.current.setFilters({ sort: 'rating' });
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('sort')).toBeNull();
  });

  it('page=1 (default) URL`ga yozilmaydi', async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useSearchFilters(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: '?page=5',
        onUrlUpdate,
      }),
    });

    await act(async () => {
      await result.current.setFilters({ page: 1 });
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('page')).toBeNull();
  });
});
