'use client';

/**
 * `useDebouncedReverseGeo` — Yandex reverse-geocoding (debounce + cache).
 *
 * Task: T4.05
 * R05 mitigation (Yandex rate limit, 25k/sutka)
 *
 * Strategiya:
 *  1. Pin tortilishi tugagandan keyin 800ms kutamiz (debounce)
 *  2. Mahalliy `Map<latlng, address>` cache — 5 daqiqa TTL
 *  3. Cache hit bo'lsa SDK chaqirilmaydi
 *  4. Cache miss → `ymaps.geocode(coords)` → `geoObjects.get(0).getAddressLine()`
 *  5. SDK yo'q bo'lsa (test/SSR) — fallback "Lat, Lng" stringi
 *
 * Cache key: 4 raqamli aniqlik (≈11 metr) — pinning yetarli aniqlik.
 * Bu chegaradan past uchun cache hit kafolatlanadi (mijoz pin'ni yana
 * to'g'rilab-tortish chaqiriqlarida).
 */
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Pin to'xtagandan keyin SDK chaqirgunga qadar kutiladigan vaqt. */
export const REVERSE_GEO_DEBOUNCE_MS = 800;

/** Cache TTL — 5 daqiqa (mijoz odatda 1-2 minutda manzilni tugatadi). */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Coordinata aniqligi cache kalit uchun — 4 raqam (~11m). */
const COORD_PRECISION = 4;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReverseGeoResult {
  address: string;
  /** SDK chaqirildimi yoki cache'dan? Telemetry uchun. */
  source: 'cache' | 'sdk' | 'fallback';
}

export interface UseDebouncedReverseGeoState {
  /** Joriy aniqlangan manzil. */
  address: string | null;
  /** SDK chaqirilayotganda true. */
  isLoading: boolean;
  /** SDK xato berdi (rate limit, network). */
  isError: boolean;
}

// ─── Cache ───────────────────────────────────────────────────────────────────

interface CacheEntry {
  address: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(COORD_PRECISION)},${lng.toFixed(COORD_PRECISION)}`;
}

/** @internal — testlar uchun cache reset. */
export function __resetReverseGeoCache(): void {
  cache.clear();
}

// ─── Yandex SDK type guard ───────────────────────────────────────────────────

interface YmapsGeoObject {
  getAddressLine: () => string;
}

interface YmapsGeocodeResult {
  geoObjects: {
    get: (index: number) => YmapsGeoObject | null;
  };
}

interface YmapsGlobal {
  geocode: (coords: [number, number]) => Promise<YmapsGeocodeResult>;
  ready?: (cb: () => void) => void;
}

declare global {
  interface Window {
    ymaps?: YmapsGlobal;
  }
}

// ─── Reverse geocode (SDK) ───────────────────────────────────────────────────

async function reverseGeoFromSdk(lat: number, lng: number): Promise<string> {
  if (typeof window === 'undefined' || !window.ymaps) {
    // SSR yoki SDK hali yuklanmagan — fallback
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  const result = await window.ymaps.geocode([lat, lng]);
  const first = result.geoObjects.get(0);
  if (!first) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  return first.getAddressLine();
}

/**
 * Cache+SDK orqali manzilni qaytaradi.
 *
 * @internal Komponent darajasida `useDebouncedReverseGeo` hook ishlating.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeoResult> {
  const key = cacheKey(lat, lng);
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return { address: cached.address, source: 'cache' };
  }
  try {
    const address = await reverseGeoFromSdk(lat, lng);
    cache.set(key, { address, expiresAt: now + CACHE_TTL_MS });
    return {
      address,
      source: typeof window !== 'undefined' && window.ymaps ? 'sdk' : 'fallback',
    };
  } catch {
    // Network / rate limit — fallback "lat, lng"
    const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    return { address: fallback, source: 'fallback' };
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Coords o'zgargandan keyin debounce + cache orqali manzil oladi.
 *
 * @example
 * ```tsx
 * const [coords, setCoords] = useState<[number, number] | null>(null);
 * const { address, isLoading } = useDebouncedReverseGeo(coords);
 * ```
 */
export function useDebouncedReverseGeo(
  coords: [number, number] | null,
): UseDebouncedReverseGeoState {
  const [debounced] = useDebounce(coords, REVERSE_GEO_DEBOUNCE_MS);
  const [state, setState] = useState<UseDebouncedReverseGeoState>({
    address: null,
    isLoading: false,
    isError: false,
  });

  // Stable refetch — debounced o'zgarganda chaqiriladi
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    setState({ address: null, isLoading: true, isError: false });
    try {
      const result = await reverseGeocode(lat, lng);
      setState({ address: result.address, isLoading: false, isError: false });
    } catch {
      setState({ address: null, isLoading: false, isError: true });
    }
  }, []);

  useEffect(() => {
    if (!debounced) {
      setState({ address: null, isLoading: false, isError: false });
      return;
    }
    void fetchAddress(debounced[0], debounced[1]);
  }, [debounced, fetchAddress]);

  return state;
}
