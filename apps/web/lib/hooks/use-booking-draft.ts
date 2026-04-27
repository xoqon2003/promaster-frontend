'use client';

/**
 * `useBookingDraft` — Booking wizard partial state hook.
 *
 * Task: T4.03
 * R01 mitigation (URL state juda uzun)
 *
 * Strategiya:
 *  - Default: nuqs `parseAsJson<BookingDraft>` orqali URL'da saqlash
 *    (`?draft=BASE64`).
 *  - URL JSON 1.5 KB dan oshsa — `sessionStorage`'ga ko'chirib, URL'ga
 *    faqat `?draftKey=KEY` yoziladi.
 *  - Refresh / share-link orqali state to'liq tiklanadi (URL yo'qolsa,
 *    sessionStorage qoladi).
 *
 * Step navigatsiyasi `?step=N` parami orqali alohida hookda boshqariladi
 * (`useWizardStep`).
 *
 * SSR-safe: `sessionStorage` faqat `useEffect` yoki client tomonida
 * o'qiladi.
 */
import { parseAsJson, useQueryStates } from 'nuqs';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { BookingDraftSchema, type BookingDraft } from '@/lib/booking/schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

/** URL JSON state cheklovi — undan oshsa sessionStorage'ga ko'chadi. */
export const URL_THRESHOLD_BYTES = 1500;

/** sessionStorage kalit prefiksi. */
const STORAGE_PREFIX = 'ustatop:booking-draft:';

/** Bo'sh draft default. */
const EMPTY_DRAFT: BookingDraft = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Draft'ni JSON ga aylantirib bayt o'lchamini hisoblaydi.
 * Encoding'da nuqs URL-encode qilishini hisobga olish — taxminiy.
 */
function estimateUrlBytes(draft: BookingDraft): number {
  const json = JSON.stringify(draft);
  return encodeURIComponent(json).length;
}

/** Yangi `draftKey` generatsiya — collision-free. */
function generateDraftKey(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}_${rand}`;
}

// ─── SessionStorage I/O (SSR-safe) ───────────────────────────────────────────

function readFromStorage(key: string): BookingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = BookingDraftSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function writeToStorage(key: string, draft: BookingDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(draft));
  } catch {
    // Quota exceeded yoki disabled — silently ignore (UI default qoladi)
  }
}

function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // ignore
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseBookingDraftReturn {
  draft: BookingDraft;
  /**
   * Draft'ning bir qismini yangilaydi (RHF onChange dan keyin chaqiriladi).
   * `null` qiymat — maydonni o'chiradi.
   */
  setDraft: (patch: Partial<BookingDraft>) => Promise<void>;
  /** Hammasini tozalaydi — URL + sessionStorage. */
  resetDraft: () => Promise<void>;
  /** Joriy state qayerda yashayapti — debugging va telemetry uchun. */
  storageMode: 'url' | 'session' | 'empty';
}

/**
 * Booking draft state'ni nuqs URL ↔ sessionStorage strategiyasi bilan
 * boshqaradi.
 *
 * @example
 * ```tsx
 * const { draft, setDraft } = useBookingDraft();
 * // step 1 form submit'da:
 * await setDraft({ service: { categoryId: 'elektrik', ... } });
 * ```
 */
export function useBookingDraft(): UseBookingDraftReturn {
  const [{ draft: urlDraft, draftKey }, setQuery] = useQueryStates(
    {
      draft: parseAsJson<BookingDraft>((value) => {
        const result = BookingDraftSchema.safeParse(value);
        return result.success ? result.data : EMPTY_DRAFT;
      }).withDefault(EMPTY_DRAFT),
      draftKey: {
        parse: (v) => (typeof v === 'string' && v.length > 0 ? v : null),
        serialize: (v) => v ?? '',
      },
    },
    {
      // Wizard navigatsiyasida history bosa-bosa qilmaslik uchun
      history: 'replace',
      // Default qiymat URL'ga yozilmaydi
      clearOnDefault: true,
    },
  );

  // Kalit bo'lsa sessionStorage'dan o'qiymiz, yoq bo'lsa URL'dan.
  // useMemo bilan stabil reference — pastki render'lar effekt qildirmasin.
  const draft = useMemo<BookingDraft>(() => {
    if (draftKey) {
      const stored = readFromStorage(draftKey);
      if (stored) return stored;
    }
    return urlDraft;
  }, [draftKey, urlDraft]);

  const storageMode: UseBookingDraftReturn['storageMode'] = draftKey
    ? 'session'
    : Object.keys(urlDraft).length > 0
      ? 'url'
      : 'empty';

  // Eng so'nggi draft holati — setDraft callback ichida foydalaniladi
  // (closure'da eskirib qolmaslik uchun).
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const setDraft = useCallback(
    async (patch: Partial<BookingDraft>) => {
      const next: BookingDraft = { ...draftRef.current, ...patch };
      const bytes = estimateUrlBytes(next);

      if (bytes > URL_THRESHOLD_BYTES) {
        // sessionStorage rejimi
        const key = draftKey ?? generateDraftKey();
        writeToStorage(key, next);
        await setQuery({ draft: EMPTY_DRAFT, draftKey: key });
      } else {
        // URL rejimi — eski sessionStorage kalitini tozalash
        if (draftKey) removeFromStorage(draftKey);
        await setQuery({ draft: next, draftKey: null });
      }
    },
    [draftKey, setQuery],
  );

  const resetDraft = useCallback(async () => {
    if (draftKey) removeFromStorage(draftKey);
    await setQuery({ draft: EMPTY_DRAFT, draftKey: null });
  }, [draftKey, setQuery]);

  return { draft, setDraft, resetDraft, storageMode };
}
