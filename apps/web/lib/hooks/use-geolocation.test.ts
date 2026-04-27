/**
 * T3.05 — useGeolocation hook tests.
 *
 * Qamrov:
 *  - idle initial state
 *  - request() → granted (koordinata qaytadi)
 *  - request() → denied (PERMISSION_DENIED)
 *  - request() → unavailable (POSITION_UNAVAILABLE)
 *  - request() → timeout
 *  - Cache: mount'da localStorage'dan o'qish
 *  - Cache: granted bo'lgach yozish
 *  - Cache: 1 soatdan keyin eskirgan (ignored)
 *  - clear() — cache va state reset
 *  - SSR safe (navigator undefined)
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGeolocation } from './use-geolocation';

// ─── navigator.geolocation mock ──────────────────────────────────────────────

type SuccessCb = (pos: GeolocationPosition) => void;
type ErrorCb = (err: GeolocationPositionError) => void;

interface MockGeolocation {
  getCurrentPosition: ReturnType<typeof vi.fn>;
}

function installGeolocation(mock: MockGeolocation | null): void {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: mock,
    configurable: true,
    writable: true,
  });
}

const CACHE_KEY = 'ustatop:geolocation';

// ─── Setup/teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-05-09T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  installGeolocation(null);
  window.localStorage.clear();
});

// ─── Happy path ──────────────────────────────────────────────────────────────

describe('useGeolocation — initial state', () => {
  it("idle bilan boshlanadi (cache yo'q)", () => {
    const geo: MockGeolocation = { getCurrentPosition: vi.fn() };
    installGeolocation(geo);

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.state).toBe('idle');
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("mount'da cache'dan o'qiydi — granted state", () => {
    const geo: MockGeolocation = { getCurrentPosition: vi.fn() };
    installGeolocation(geo);

    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        position: { lat: 41.31, lng: 69.28, accuracy: 50 },
        timestamp: Date.now(),
      }),
    );

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.state).toBe('granted');
    expect(result.current.position).toEqual({ lat: 41.31, lng: 69.28, accuracy: 50 });
  });

  it("1 soatdan eski cache e'tiborga olinmaydi", () => {
    const geo: MockGeolocation = { getCurrentPosition: vi.fn() };
    installGeolocation(geo);

    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        position: { lat: 41.31, lng: 69.28, accuracy: 50 },
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 soat oldin
      }),
    );

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.state).toBe('idle');
    expect(result.current.position).toBeNull();
  });

  it("noto'g'ri JSON cache — idle'ga qaytadi, crash emas", () => {
    const geo: MockGeolocation = { getCurrentPosition: vi.fn() };
    installGeolocation(geo);
    window.localStorage.setItem(CACHE_KEY, 'not-valid-json{{{');

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.state).toBe('idle');
  });
});

// ─── request() ───────────────────────────────────────────────────────────────

describe('useGeolocation.request()', () => {
  it("success — position set, state='granted', cache yoziladi", () => {
    const geo: MockGeolocation = {
      getCurrentPosition: vi.fn((success: SuccessCb) => {
        success({
          coords: {
            latitude: 41.31,
            longitude: 69.28,
            accuracy: 25,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      }),
    };
    installGeolocation(geo);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.request();
    });

    expect(result.current.state).toBe('granted');
    expect(result.current.position).toEqual({ lat: 41.31, lng: 69.28, accuracy: 25 });
    expect(result.current.error).toBeNull();

    // Cache yozildi
    const raw = window.localStorage.getItem(CACHE_KEY);
    expect(raw).not.toBeNull();
    const cached = JSON.parse(raw!);
    expect(cached.position).toEqual({ lat: 41.31, lng: 69.28, accuracy: 25 });
    expect(typeof cached.timestamp).toBe('number');
  });

  it("PERMISSION_DENIED (code=1) — state='denied' + xato xabar", () => {
    const geo: MockGeolocation = {
      getCurrentPosition: vi.fn((_s: SuccessCb, error: ErrorCb) => {
        error({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError);
      }),
    };
    installGeolocation(geo);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.request();
    });

    expect(result.current.state).toBe('denied');
    expect(result.current.error).toEqual({
      kind: 'denied',
      message: 'Joylashuv ruxsati rad etildi. Brauzer sozlamalaridan yoqing.',
    });
    expect(result.current.position).toBeNull();
  });

  it("POSITION_UNAVAILABLE (code=2) — state='unavailable'", () => {
    const geo: MockGeolocation = {
      getCurrentPosition: vi.fn((_s: SuccessCb, error: ErrorCb) => {
        error({ code: 2 } as GeolocationPositionError);
      }),
    };
    installGeolocation(geo);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.request();
    });

    expect(result.current.state).toBe('unavailable');
    expect(result.current.error?.kind).toBe('unavailable');
  });

  it("TIMEOUT (code=3) — state='unavailable', error.kind='timeout'", () => {
    const geo: MockGeolocation = {
      getCurrentPosition: vi.fn((_s: SuccessCb, error: ErrorCb) => {
        error({ code: 3 } as GeolocationPositionError);
      }),
    };
    installGeolocation(geo);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.request();
    });

    expect(result.current.state).toBe('unavailable');
    expect(result.current.error?.kind).toBe('timeout');
  });

  it("request paytida state='requesting' bo'ladi (async callback)", () => {
    let successCb: SuccessCb | null = null;
    const geo: MockGeolocation = {
      getCurrentPosition: vi.fn((success: SuccessCb) => {
        successCb = success; // callback'ni ushlab qolamiz
      }),
    };
    installGeolocation(geo);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.request();
    });

    expect(result.current.state).toBe('requesting');

    // Endi callback'ni chaqiramiz
    act(() => {
      successCb!({
        coords: {
          latitude: 41.3,
          longitude: 69.2,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    expect(result.current.state).toBe('granted');
  });
});

// ─── clear() ─────────────────────────────────────────────────────────────────

describe('useGeolocation.clear()', () => {
  it("state'ni idle'ga qaytaradi, cache'ni tozalaydi", () => {
    const geo: MockGeolocation = {
      getCurrentPosition: vi.fn((success: SuccessCb) => {
        success({
          coords: {
            latitude: 41.3,
            longitude: 69.2,
            accuracy: 25,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      }),
    };
    installGeolocation(geo);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.request();
    });
    expect(result.current.state).toBe('granted');
    expect(window.localStorage.getItem(CACHE_KEY)).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBeNull();
    expect(window.localStorage.getItem(CACHE_KEY)).toBeNull();
  });
});

// ─── SSR / unavailable ───────────────────────────────────────────────────────

describe('useGeolocation — unavailable', () => {
  it("navigator.geolocation yo'q — state='unavailable'", () => {
    installGeolocation(null);

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.state).toBe('unavailable');
    expect(result.current.error?.kind).toBe('unavailable');
  });

  it("unavailable holatida request() qilsa — xato saqlanadi, crash yo'q", () => {
    installGeolocation(null);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.request();
    });

    expect(result.current.state).toBe('unavailable');
  });
});
