/**
 * T4.05 — `reverseGeocode` cache + fallback testlar.
 *
 * Hook `useDebouncedReverseGeo` debounce orqali React'da ishlaydi —
 * unit'da pure function `reverseGeocode` testlanadi.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetReverseGeoCache, reverseGeocode } from './use-debounced-reverse-geo';

const TASHKENT_COORDS: [number, number] = [41.31, 69.28];

beforeEach(() => {
  __resetReverseGeoCache();
});

afterEach(() => {
  // window.ymaps mock'ni tozalash
  if (typeof window !== 'undefined') {
    Reflect.deleteProperty(window, 'ymaps');
  }
});

describe('reverseGeocode', () => {
  it("SDK yo'q (jsdom) — fallback 'lat, lng' qaytadi", async () => {
    const result = await reverseGeocode(TASHKENT_COORDS[0], TASHKENT_COORDS[1]);
    expect(result.address).toBe('41.3100, 69.2800');
    expect(result.source).toBe('fallback');
  });

  it("SDK mavjud — getAddressLine() chaqiriladi, source='sdk'", async () => {
    const mockGeocode = vi.fn().mockResolvedValue({
      geoObjects: {
        get: () => ({ getAddressLine: () => 'Toshkent, Chilonzor 12' }),
      },
    });
    Object.defineProperty(window, 'ymaps', {
      configurable: true,
      value: { geocode: mockGeocode },
    });

    const result = await reverseGeocode(41.31, 69.28);
    expect(result.address).toBe('Toshkent, Chilonzor 12');
    expect(result.source).toBe('sdk');
    expect(mockGeocode).toHaveBeenCalledWith([41.31, 69.28]);
  });

  it('ikkinchi chaqiriq — cache dan, SDK chaqirilmaydi', async () => {
    const mockGeocode = vi.fn().mockResolvedValue({
      geoObjects: {
        get: () => ({ getAddressLine: () => 'Toshkent' }),
      },
    });
    Object.defineProperty(window, 'ymaps', {
      configurable: true,
      value: { geocode: mockGeocode },
    });

    const r1 = await reverseGeocode(41.31, 69.28);
    const r2 = await reverseGeocode(41.31, 69.28);

    expect(r1.source).toBe('sdk');
    expect(r2.source).toBe('cache');
    expect(mockGeocode).toHaveBeenCalledTimes(1);
  });

  it("4 raqamdan past o'zgarish — bir xil cache key", async () => {
    const mockGeocode = vi.fn().mockResolvedValue({
      geoObjects: {
        get: () => ({ getAddressLine: () => 'Toshkent' }),
      },
    });
    Object.defineProperty(window, 'ymaps', {
      configurable: true,
      value: { geocode: mockGeocode },
    });

    // 41.31001 va 41.31004 — toFixed(4) bir xil "41.3100"
    await reverseGeocode(41.31001, 69.28001);
    await reverseGeocode(41.31004, 69.28004);

    expect(mockGeocode).toHaveBeenCalledTimes(1); // bir xil key (4 raqamli)
  });

  it('SDK xato (rate limit) — fallback', async () => {
    const mockGeocode = vi.fn().mockRejectedValue(new Error('Rate limit exceeded'));
    Object.defineProperty(window, 'ymaps', {
      configurable: true,
      value: { geocode: mockGeocode },
    });

    const result = await reverseGeocode(41.31, 69.28);
    expect(result.address).toBe('41.3100, 69.2800');
    expect(result.source).toBe('fallback');
  });

  it('geoObjects.get(0) null — fallback', async () => {
    const mockGeocode = vi.fn().mockResolvedValue({
      geoObjects: {
        get: () => null,
      },
    });
    Object.defineProperty(window, 'ymaps', {
      configurable: true,
      value: { geocode: mockGeocode },
    });

    const result = await reverseGeocode(41.31, 69.28);
    expect(result.address).toBe('41.3100, 69.2800');
  });
});
