'use client';

/**
 * `useWizardStep` — Booking wizard step navigatsiyasi.
 *
 * Task: T4.03
 *
 * URL: `?step=1..6`. Default 1 — URL'ga yozilmaydi (clearOnDefault).
 * Browser back/forward navigatsiyasi avtomatik ishlaydi (nuqs `history`).
 *
 * Validatsiya: foydalanuvchi step=4 dan boshlasa (link orqali), avvalgi
 * stepda majburiy maydonlar bo'sh bo'lishi mumkin. Bu yerda majburiy
 * navigation guard yoq — step komponentlari o'zlari draft to'liqligini
 * tekshirib qaytaradi (`useBookingDraft` orqali).
 *
 * `goBack()` step=1 da `/search` ga qaytaradi (boshqa branchga).
 */
import { parseAsInteger, useQueryState } from 'nuqs';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

export const TOTAL_STEPS = 6;
export const FIRST_STEP = 1;
export const LAST_STEP = TOTAL_STEPS;

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseWizardStepReturn {
  /** Joriy step (1..6). */
  step: WizardStep;
  /** Keyingi step ga o'tish. Oxirgi stepda — no-op. */
  goNext: () => Promise<void>;
  /** Oldingi step. Birinchi stepda `/search` ga router.push. */
  goBack: () => Promise<void>;
  /** Aniq step ga o'tish (Tahrirlash linklari uchun). */
  goToStep: (step: WizardStep) => Promise<void>;
  /** Birinchi step? (back tugma `/search`'ga olib boradi). */
  isFirstStep: boolean;
  /** Oxirgi step? (next tugma submit'ga aylanadi). */
  isLastStep: boolean;
}

function clampStep(value: number): WizardStep {
  if (value < FIRST_STEP) return FIRST_STEP;
  if (value > LAST_STEP) return LAST_STEP;
  return value as WizardStep;
}

export function useWizardStep(): UseWizardStepReturn {
  const router = useRouter();
  const [rawStep, setStep] = useQueryState(
    'step',
    parseAsInteger.withDefault(FIRST_STEP).withOptions({ clearOnDefault: true, history: 'push' }),
  );

  const step = clampStep(rawStep);
  const isFirstStep = step === FIRST_STEP;
  const isLastStep = step === LAST_STEP;

  const goNext = useCallback(async () => {
    if (isLastStep) return;
    await setStep(clampStep(step + 1));
  }, [isLastStep, setStep, step]);

  const goBack = useCallback(async () => {
    if (isFirstStep) {
      router.push('/search');
      return;
    }
    await setStep(clampStep(step - 1));
  }, [isFirstStep, router, setStep, step]);

  const goToStep = useCallback(
    async (target: WizardStep) => {
      await setStep(clampStep(target));
    },
    [setStep],
  );

  return {
    step,
    goNext,
    goBack,
    goToStep,
    isFirstStep,
    isLastStep,
  };
}
