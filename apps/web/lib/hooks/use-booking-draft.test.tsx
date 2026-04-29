/**
 * T4.03 — `useBookingDraft` hook tests.
 *
 * Qamrov:
 *  - Empty URL — bo'sh draft, storageMode='empty'
 *  - URL'da qisqa draft — JSON parse, storageMode='url'
 *  - setDraft — partial merge, URL'ga yangi JSON yoziladi
 *  - resetDraft — URL tozalanadi
 *  - Long draft — sessionStorage'ga ko'chadi (>1.5KB)
 *  - sessionStorage rejimida draftKey URL'da
 *  - Invalid JSON — bo'sh draft (Zod safeParse fail)
 */
import { act, renderHook } from '@testing-library/react';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { URL_THRESHOLD_BYTES, useBookingDraft } from './use-booking-draft';

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Har test boshida sessionStorage tozalanadi
  if (typeof window !== 'undefined') {
    window.sessionStorage.clear();
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Empty / parse ───────────────────────────────────────────────────────────

describe('useBookingDraft — initial', () => {
  it("bo'sh URL — bo'sh draft, storageMode='empty'", () => {
    const { result } = renderHook(() => useBookingDraft(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(result.current.draft).toEqual({});
    expect(result.current.storageMode).toBe('empty');
  });

  it("URL'dagi draft o'qiladi (qisqa)", () => {
    const draft = { masterId: 'm_1' };
    const encoded = encodeURIComponent(JSON.stringify(draft));

    const { result } = renderHook(() => useBookingDraft(), {
      wrapper: withNuqsTestingAdapter({ searchParams: `?draft=${encoded}` }),
    });

    expect(result.current.draft.masterId).toBe('m_1');
    expect(result.current.storageMode).toBe('url');
  });

  it("invalid JSON — bo'sh draft (Zod safeParse fail)", () => {
    const { result } = renderHook(() => useBookingDraft(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?draft=not-valid-json' }),
    });

    // nuqs parseAsJson invalid bo'lsa default qaytadi
    expect(result.current.draft).toEqual({});
  });
});

// ─── setDraft (URL rejimi) ───────────────────────────────────────────────────

describe('useBookingDraft.setDraft — URL rejimi', () => {
  it("masterId qo'shiladi → URL'da yoziladi", async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useBookingDraft(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '', onUrlUpdate }),
    });

    await act(async () => {
      await result.current.setDraft({ masterId: 'm_42' });
    });

    expect(onUrlUpdate).toHaveBeenCalled();
    const event = onUrlUpdate.mock.lastCall![0];
    const draftParam = event.searchParams.get('draft');
    expect(draftParam).toBeTruthy();
    expect(JSON.parse(draftParam!)).toEqual({ masterId: 'm_42' });
  });

  it('partial merge — eski maydonlar saqlanadi', async () => {
    const initial = { masterId: 'm_1' };
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useBookingDraft(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: `?draft=${encodeURIComponent(JSON.stringify(initial))}`,
        onUrlUpdate,
      }),
    });

    await act(async () => {
      await result.current.setDraft({
        service: { categoryId: 'elektrik', subServiceId: 'rozetka', description: '' },
      });
    });

    const event = onUrlUpdate.mock.lastCall![0];
    const draftParam = event.searchParams.get('draft');
    const parsed = JSON.parse(draftParam!);
    expect(parsed.masterId).toBe('m_1');
    expect(parsed.service?.categoryId).toBe('elektrik');
  });
});

// ─── resetDraft ──────────────────────────────────────────────────────────────

describe('useBookingDraft.resetDraft', () => {
  it("URL'dan draft olib tashlanadi", async () => {
    const onUrlUpdate = vi.fn();
    const initial = { masterId: 'm_1' };
    const { result } = renderHook(() => useBookingDraft(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: `?draft=${encodeURIComponent(JSON.stringify(initial))}`,
        onUrlUpdate,
      }),
    });

    await act(async () => {
      await result.current.resetDraft();
    });

    const event = onUrlUpdate.mock.lastCall![0];
    expect(event.searchParams.get('draft')).toBeNull();
    expect(event.searchParams.get('draftKey')).toBeNull();
  });
});

// ─── sessionStorage rejimi (long draft) ──────────────────────────────────────

describe('useBookingDraft — sessionStorage fallback', () => {
  it(`draft > ${URL_THRESHOLD_BYTES} bayt — sessionStorage'ga ko'chadi`, async () => {
    const onUrlUpdate = vi.fn();
    const { result } = renderHook(() => useBookingDraft(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '', onUrlUpdate }),
    });

    // Cheklovdan oshib ketadigan katta description bilan service
    const longDescription = 'a'.repeat(2000);

    await act(async () => {
      await result.current.setDraft({
        service: {
          categoryId: 'elektrik',
          subServiceId: 'rozetka',
          description: longDescription,
        },
      });
    });

    const event = onUrlUpdate.mock.lastCall![0];
    const draftParam = event.searchParams.get('draft');
    const draftKey = event.searchParams.get('draftKey');

    // Draft URL'da emas (yoki bo'sh), draftKey paydo bo'lgan
    expect(draftKey).toBeTruthy();
    if (draftParam) {
      // nuqs draft parametri default bilan yoziladi — bo'sh JSON ham bo'lishi mumkin
      const parsed = JSON.parse(draftParam);
      expect(parsed.service).toBeUndefined();
    }

    // sessionStorage'da draft saqlangan
    const storageKey = `ustatop:booking-draft:${draftKey}`;
    const stored = window.sessionStorage.getItem(storageKey);
    expect(stored).toBeTruthy();
    const parsedStored = JSON.parse(stored!);
    expect(parsedStored.service.description).toBe(longDescription);
  });
});
