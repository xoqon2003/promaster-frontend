'use client';

/**
 * Booking telemetriyasi — Mixpanel orqali event tracking.
 *
 * Task: T4.12
 * R07 mitigation (Mixpanel SDK SSR crash):
 *  - `window` guard har funksiyada
 *  - lazy init `useEffect` ichida
 *  - SDK yo'q bo'lsa (test/SSR) — no-op (silent)
 *
 * Eventlar:
 *  - booking_step_started     — step ekran ochildi
 *  - booking_step_completed   — step muvaffaqiyatli to'ldirildi (goNext)
 *  - booking_step_abandoned   — step tashlanib boshqasiga o'tildi (goBack)
 *  - booking_submitted        — buyurtma muvaffaqiyatli yaratildi
 *  - booking_failed           — submit xatolik berdi (kind bilan)
 *
 * Properties: step, durationMs, categoryId (agar bilingan), kind (xato turi),
 * userId (login bo'lsa).
 */
import { useEffect, useRef } from 'react';

import { type WizardStep } from '@/lib/hooks/use-wizard-step';
import { type SubmitErrorKind } from './submit-error';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BookingEventName =
  | 'booking_step_started'
  | 'booking_step_completed'
  | 'booking_step_abandoned'
  | 'booking_submitted'
  | 'booking_failed';

export interface BookingEventProperties {
  step?: WizardStep;
  /** Step boshidan oxirigacha o'tgan vaqt — ms. */
  durationMs?: number;
  categoryId?: string;
  /** Failed event uchun — submit-error.kind. */
  errorKind?: SubmitErrorKind;
  /** Yaratilgan booking ID (submitted event'da). */
  bookingId?: string;
  userId?: string;
}

// ─── Mixpanel SDK type guard ─────────────────────────────────────────────────

interface MixpanelGlobal {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  identify?: (userId: string) => void;
}

declare global {
  interface Window {
    mixpanel?: MixpanelGlobal;
  }
}

// ─── Track function ──────────────────────────────────────────────────────────

/**
 * Booking event'ni Mixpanel'ga yuboradi.
 *
 * SSR/SDK yo'q bo'lsa silent no-op. Real Mixpanel `mixpanel.init()` bilan
 * `client-providers.tsx`'da yoki shu kabi bootstrap'da bog'lanadi (S04
 * doirasida hali init kerak emas — interface tayyor).
 */
export function trackBookingEvent(
  name: BookingEventName,
  properties: BookingEventProperties = {},
): void {
  if (typeof window === 'undefined') return;
  const mp = window.mixpanel;
  if (!mp || typeof mp.track !== 'function') return;

  // properties undefined qiymatlarni tashlamasligi uchun toza obyekt
  const cleanProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) cleanProps[key] = value;
  }

  try {
    mp.track(name, cleanProps);
  } catch (err) {
    // Telemetry xatosi UI ni buzmasin — silent log
    console.warn('[telemetry] track failed:', err);
  }
}

// ─── Step lifecycle hook ─────────────────────────────────────────────────────

/**
 * Step ekran ochilgan vaqtni o'lchaydi va `step_started`/`step_completed`
 * event'larini yuboradi.
 *
 * @param step Joriy step raqami
 * @param categoryId Optional — telemetry property uchun
 *
 * @example
 * ```tsx
 * function Step1Service() {
 *   const { onComplete } = useStepTelemetry(1, draft.service?.categoryId);
 *   // ... onComplete'ni form submit'da chaqirish kerak
 * }
 * ```
 */
export function useStepTelemetry(
  step: WizardStep,
  categoryId?: string,
): {
  /** Step muvaffaqiyatli to'ldirilganda chaqirilsin. */
  emitCompleted: () => void;
} {
  const startedAtRef = useRef<number>(Date.now());

  // Step kirgan vaqtdagi event
  useEffect(() => {
    startedAtRef.current = Date.now();
    trackBookingEvent('booking_step_started', { step, categoryId });

    // Unmount: agar emitCompleted chaqirilmagan bo'lsa, abandoned hisoblanadi
    return () => {
      // useEffect cleanup'da `started` ref hali bor — durationni hisoblaymiz
      const durationMs = Date.now() - startedAtRef.current;
      // Faqat 1 soniyadan ko'proq kuzatilgan bo'lsa abandoned (flicker'larsiz)
      if (durationMs > 1000) {
        trackBookingEvent('booking_step_abandoned', { step, durationMs, categoryId });
      }
    };
  }, [step, categoryId]);

  return {
    emitCompleted: () => {
      const durationMs = Date.now() - startedAtRef.current;
      trackBookingEvent('booking_step_completed', { step, durationMs, categoryId });
    },
  };
}
