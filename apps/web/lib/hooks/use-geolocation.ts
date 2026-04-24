'use client';

/**
 * `useGeolocation()` — brauzer `navigator.geolocation` wrapper.
 *
 * Task: T3.05
 *
 * State machine:
 *   idle          — hech narsa so'ralmadi
 *   requesting    — ruxsat prompti yoki koordinata olinyapti
 *   granted       — koordinatalar qo'lga tushdi
 *   denied        — foydalanuvchi rad etdi (yoki permissions.query'ga ko'ra
 *                   oldindan rad etilgan)
 *   unavailable   — SSR, `navigator.geolocation` yo'q, yoki timeout
 *
 * Cache (1 soat):
 *   localStorage['ustatop:geolocation'] = { position, timestamp }
 *   Sabab: geolocation prompt har sahifada ko'rsatilmasligi uchun.
 *   Foydalanuvchi shaharda ~1 soat ichida kam joy o'zgartiradi (marketplace
 *   kontekstida — "yaqin atrofdagi usta" taxminiy yetarli).
 */
import { useCallback, useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GeolocationState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  /** Xatolik radiusi metrlarda (GPS: ~5m, Wi-Fi: ~50m, IP: ~km). */
  accuracy: number;
}

export interface GeolocationError {
  /** 'denied' | 'unavailable' | 'timeout' */
  kind: 'denied' | 'unavailable' | 'timeout';
  /** User-friendly xabar (uz). */
  message: string;
}

export interface UseGeolocationResult {
  state: GeolocationState;
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  /** Ruxsat so'raydi va koordinata oladi. */
  request: () => void;
  /** Cache'ni tozalaydi va state'ni `idle`'ga qaytaradi. */
  clear: () => void;
}

// ─── Cache ───────────────────────────────────────────────────────────────────

const CACHE_KEY = 'ustatop:geolocation';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 soat

interface CacheEntry {
  position: GeolocationPosition;
  timestamp: number;
}

function readCache(): GeolocationPosition | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry;
    if (typeof entry !== 'object' || entry === null) return null;
    if (typeof entry.timestamp !== 'number') return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;

    return entry.position;
  } catch {
    return null;
  }
}

function writeCache(position: GeolocationPosition): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = { position, timestamp: Date.now() };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Quota yoki private mode — baribir davom etamiz, hook ishlaydi, faqat
    // keyingi sahifada yana so'raladi.
  }
}

function clearCache(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

// ─── Error mapping ───────────────────────────────────────────────────────────

function mapGeolocationError(error: GeolocationPositionError): GeolocationError {
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return {
        kind: 'denied',
        message: 'Joylashuv ruxsati rad etildi. Brauzer sozlamalaridan yoqing.',
      };
    case 2: // POSITION_UNAVAILABLE
      return {
        kind: 'unavailable',
        message: "Joylashuvni aniqlab bo'lmadi. GPS yoki Wi-Fi yoqilganini tekshiring.",
      };
    case 3: // TIMEOUT
      return {
        kind: 'timeout',
        message: 'Joylashuv so`rovi vaqti tugadi. Qayta urinib ko`ring.',
      };
    default:
      return {
        kind: 'unavailable',
        message: "Noma'lum xatolik yuz berdi.",
      };
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

const REQUEST_TIMEOUT_MS = 10_000;

export function useGeolocation(): UseGeolocationResult {
  const [state, setState] = useState<GeolocationState>('idle');
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);

  // SSR-safe: mount paytida cache'dan o'qish
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState('unavailable');
      setError({
        kind: 'unavailable',
        message: 'Brauzeringiz joylashuvni qo`llab-quvvatlamaydi.',
      });
      return;
    }

    const cached = readCache();
    if (cached) {
      setPosition(cached);
      setState('granted');
    }
  }, []);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState('unavailable');
      setError({
        kind: 'unavailable',
        message: 'Brauzeringiz joylashuvni qo`llab-quvvatlamaydi.',
      });
      return;
    }

    setState('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: GeolocationPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setPosition(next);
        setState('granted');
        writeCache(next);
      },
      (err) => {
        const mapped = mapGeolocationError(err);
        setError(mapped);
        setState(mapped.kind === 'denied' ? 'denied' : 'unavailable');
      },
      {
        enableHighAccuracy: false, // shahar miqyosida kerak emas — tez va batareya-do'st
        timeout: REQUEST_TIMEOUT_MS,
        maximumAge: CACHE_TTL_MS, // brauzer o'z cache'i 1 soat
      },
    );
  }, []);

  const clear = useCallback(() => {
    clearCache();
    setPosition(null);
    setError(null);
    setState('idle');
  }, []);

  return { state, position, error, request, clear };
}
