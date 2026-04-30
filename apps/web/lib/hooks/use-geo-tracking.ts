/**
 * `useGeoTracking({ target, enabled })` — usta GPS ping streaming (S06 T6.04).
 *
 * `useGeolocation` (T3.05, bir martalik) bilan farqli — bu hook **doimiy
 * watchPosition** ishlatadi va T6.05 `POST /api/tracking` endpointiga
 * adaptive interval bilan ping yuborish uchun mo'ljallangan.
 *
 * Stack qarori D2 (`docs/sprints/S06/planning.md`): adaptive interval —
 * 30s default, masofa target'ga ≤ 500m bo'lsa 15s ga qisqaradi.
 *
 * **Permission state machine:**
 *
 *   prompt → granted   (ruxsat berildi → ping'lar oqadi)
 *          → denied    (manual mode — usta status'ni qo'lda yangilaydi)
 *
 *   unsupported — SSR yoki `navigator.geolocation` yo'q (tarixiy brauzer)
 *
 * **Battery saver:** `requestIdleCallback` (mavjud bo'lsa) ichida ping
 * `onPing` callback chaqiriladi — main thread'ga ortiqcha yuk yo'q.
 *
 * **Cleanup:** `enabled = false` qilinganda yoki unmount'da `clearWatch`
 * chaqiriladi. Caller status `arrived` bo'lganda `enabled = false`
 * qilishi kutiladi.
 *
 * @example
 *   const { permission, lastPing, lastError } = useGeoTracking({
 *     target: { lat: 41.31, lng: 69.27 },  // mijoz manzili
 *     enabled: order.status === 'en_route',
 *     onPing: (ping) => fetch('/api/tracking', {
 *       method: 'POST',
 *       body: JSON.stringify({ orderId, ...ping }),
 *     }),
 *   });
 */
'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GeoTrackingPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface GeoTrackingTarget {
  lat: number;
  lng: number;
}

export interface GeoTrackingPing {
  lat: number;
  lng: number;
  /** `coords.accuracy` metrda. */
  accuracy: number;
  /** Ping recorded vaqti (client-side). */
  recordedAt: Date;
}

export interface UseGeoTrackingOptions {
  /** Mijoz manzili — masofa hisoblash uchun. `null` = adaptive yo'q (30s qattiq). */
  target: GeoTrackingTarget | null;
  /** `false` bo'lsa watcher ishlamaydi (status `arrived` da o'chirish). */
  enabled: boolean;
  /** Har ping'da chaqiriladi. T6.05 `POST /api/tracking` shu yerda. */
  onPing?: (ping: GeoTrackingPing) => void;
}

export interface UseGeoTrackingResult {
  permission: GeoTrackingPermission;
  /** So'nggi yetkazilgan ping (UI debug yoki indikator uchun). */
  lastPing: GeoTrackingPing | null;
  /** So'nggi xato — `permission === 'denied'` bo'lsa user-facing message. */
  lastError: string | null;
  /** Qo'lda ruxsat so'rash — denied'dan qayta urinish kerak bo'lsa. */
  requestPermission: () => void;
}

// ─── Tunables ────────────────────────────────────────────────────────────────

const DEFAULT_INTERVAL_MS = 30_000;
const NEAR_TARGET_INTERVAL_MS = 15_000;
const NEAR_TARGET_THRESHOLD_M = 500;

/** `coords.accuracy` shu radius'dan kattaroq bo'lsa ping tashlab yuboriladi. */
const MAX_ACCURACY_M = 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Haversine masofa metrlarda. Aniqlik shahar miqyosida ~ 1m.
 *
 * Reference: https://en.wikipedia.org/wiki/Haversine_formula
 */
export function haversineMeters(a: GeoTrackingTarget, b: GeoTrackingTarget): number {
  const R = 6_371_000; // Yer radiusi metrda
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function inIdle(callback: () => void): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 1_000 });
  } else {
    callback();
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGeoTracking({
  target,
  enabled,
  onPing,
}: UseGeoTrackingOptions): UseGeoTrackingResult {
  const [permission, setPermission] = useState<GeoTrackingPermission>(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return 'unsupported';
    return 'prompt';
  });
  const [lastPing, setLastPing] = useState<GeoTrackingPing | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Latest onPing'ni ref'da tutamiz — har render'da o'zgarishi mumkin.
  const onPingRef = useRef(onPing);
  onPingRef.current = onPing;

  // So'nggi ping vaqti — adaptive interval throttle uchun.
  const lastPingTimeRef = useRef<number>(0);

  // Watch ID — `clearWatch` uchun.
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (permission === 'unsupported' || permission === 'denied') return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        // Permission shu yerda 'granted' bo'ladi (birinchi muvaffaqiyatli ping)
        setPermission('granted');
        setLastError(null);

        const accuracy = pos.coords.accuracy;
        if (accuracy > MAX_ACCURACY_M) {
          // Past sifatli ping (Wi-Fi/IP geolocation) — tashlab yuboramiz.
          return;
        }

        const now = Date.now();
        const distance = target
          ? haversineMeters({ lat: pos.coords.latitude, lng: pos.coords.longitude }, target)
          : Infinity;
        const interval =
          distance <= NEAR_TARGET_THRESHOLD_M ? NEAR_TARGET_INTERVAL_MS : DEFAULT_INTERVAL_MS;

        if (now - lastPingTimeRef.current < interval) {
          // Throttle — keyingi ping vaqti hali kelmagan.
          return;
        }
        lastPingTimeRef.current = now;

        const ping: GeoTrackingPing = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy,
          recordedAt: new Date(now),
        };
        setLastPing(ping);

        // Battery saver — onPing callback'ni idle vaqtga surib yuboramiz.
        inIdle(() => {
          onPingRef.current?.(ping);
        });
      },
      (err) => {
        if (err.code === 1) {
          setPermission('denied');
          setLastError('Joylashuv ruxsati rad etildi. Brauzer sozlamalaridan yoqing.');
        } else if (err.code === 2) {
          setLastError("Joylashuvni aniqlab bo'lmadi. GPS/Wi-Fi yoqilganini tekshiring.");
        } else if (err.code === 3) {
          setLastError("Joylashuv so'rovi vaqti tugadi. Qayta urinib ko'ring.");
        }
      },
      {
        enableHighAccuracy: true, // usta yo'lda — aniqlik muhim (en_route)
        maximumAge: 0,
      },
    );
    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        // Defensive: test/SSR'da `navigator.geolocation` cleanup vaqtida
        // mavjud bo'lmasligi mumkin. Ish jarayonida watcher allaqachon
        // remote'dan tushib ketgan bo'ladi.
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        watchIdRef.current = null;
      }
    };
    // target o'zgarishi watcher'ni qayta yaratmaydi — masofa har ping'da
    // qayta hisoblanadi va lat/lng `target.lat/lng` ref orqali yangi value'ga
    // ega bo'ladi (closure'da eng so'nggi qiymat).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, permission]);

  function requestPermission(): void {
    if (permission === 'denied') {
      // Brauzer denied'dan keyin `getCurrentPosition` qayta prompt qilmaydi —
      // foydalanuvchi qo'lda sozlamalardan ochishi kerak. Lekin state'ni
      // 'prompt' ga qaytarib `enabled` toggle bilan retry mumkin.
      setPermission('prompt');
      setLastError(null);
    }
  }

  return { permission, lastPing, lastError, requestPermission };
}
