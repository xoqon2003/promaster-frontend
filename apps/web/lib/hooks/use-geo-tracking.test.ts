/**
 * T6.04 — `useGeoTracking` Vitest unit tests.
 *
 * Mock `navigator.geolocation.watchPosition` orqali deterministik
 * permission flow + adaptive interval throttle tekshiriladi.
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { haversineMeters, useGeoTracking } from './use-geo-tracking';

// ─── navigator.geolocation mock ──────────────────────────────────────────────

type SuccessCb = (pos: GeolocationPosition) => void;
type ErrorCb = (err: GeolocationPositionError) => void;

interface WatchEntry {
  id: number;
  success: SuccessCb;
  error: ErrorCb | undefined;
  cleared: boolean;
}

interface MockGeolocation {
  watchPosition: ReturnType<typeof vi.fn>;
  clearWatch: ReturnType<typeof vi.fn>;
  watches: WatchEntry[];
}

function makeMock(): MockGeolocation {
  const watches: WatchEntry[] = [];
  return {
    watches,
    watchPosition: vi.fn((success: SuccessCb, error: ErrorCb | undefined) => {
      const id = watches.length + 1;
      watches.push({ id, success, error, cleared: false });
      return id;
    }),
    clearWatch: vi.fn((id: number) => {
      const w = watches.find((w) => w.id === id);
      if (w) w.cleared = true;
    }),
  };
}

function installGeolocation(mock: MockGeolocation | null): void {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: mock,
    configurable: true,
    writable: true,
  });
}

function makePosition(lat: number, lng: number, accuracy = 10): GeolocationPosition {
  return {
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: Date.now(),
    toJSON: () => ({}),
  } as GeolocationPosition;
}

function makeError(code: 1 | 2 | 3): GeolocationPositionError {
  return {
    code,
    message: '',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError;
}

// ─── Setup/teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-05-09T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  installGeolocation(null);
});

// ─── Tests ───────────────────────────────────────────────────────────────────

const TARGET = { lat: 41.31, lng: 69.27 }; // Tashkent
// ~ 200m shimol-sharqdagi pozitsiya (target ga yaqin — 15s interval kutiladi)
const NEAR = { lat: 41.3118, lng: 69.2718 };
// ~ 5km uzoqdagi pozitsiya (30s interval kutiladi)
const FAR = { lat: 41.36, lng: 69.32 };

describe('useGeoTracking — permission flow', () => {
  it("dastlab 'prompt' (geolocation mavjud)", () => {
    installGeolocation(makeMock());
    const { result } = renderHook(() => useGeoTracking({ target: TARGET, enabled: true }));
    expect(result.current.permission).toBe('prompt');
  });

  it("`navigator.geolocation` yo'q → 'unsupported'", () => {
    installGeolocation(null);
    const { result } = renderHook(() => useGeoTracking({ target: TARGET, enabled: true }));
    expect(result.current.permission).toBe('unsupported');
  });

  it("birinchi muvaffaqiyatli ping → 'granted'", () => {
    const geo = makeMock();
    installGeolocation(geo);

    const { result } = renderHook(() => useGeoTracking({ target: TARGET, enabled: true }));

    act(() => {
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng));
    });

    expect(result.current.permission).toBe('granted');
  });

  it("PERMISSION_DENIED → 'denied' + lastError set", () => {
    const geo = makeMock();
    installGeolocation(geo);

    const { result } = renderHook(() => useGeoTracking({ target: TARGET, enabled: true }));

    act(() => {
      geo.watches[0]!.error?.(makeError(1));
    });

    expect(result.current.permission).toBe('denied');
    expect(result.current.lastError).toMatch(/ruxsat/i);
  });

  it("POSITION_UNAVAILABLE — permission 'prompt'da qoladi, faqat lastError", () => {
    const geo = makeMock();
    installGeolocation(geo);

    const { result } = renderHook(() => useGeoTracking({ target: TARGET, enabled: true }));

    act(() => {
      geo.watches[0]!.error?.(makeError(2));
    });

    expect(result.current.permission).toBe('prompt');
    expect(result.current.lastError).toMatch(/GPS|Wi-Fi/i);
  });
});

describe('useGeoTracking — enabled gate', () => {
  it("enabled=false bo'lsa watchPosition chaqirilmaydi", () => {
    const geo = makeMock();
    installGeolocation(geo);

    renderHook(() => useGeoTracking({ target: TARGET, enabled: false }));

    expect(geo.watchPosition).not.toHaveBeenCalled();
  });

  it('enabled=true bo`lsa watchPosition chaqiriladi', () => {
    const geo = makeMock();
    installGeolocation(geo);

    renderHook(() => useGeoTracking({ target: TARGET, enabled: true }));

    expect(geo.watchPosition).toHaveBeenCalledOnce();
  });

  it('unmount clearWatch chaqiradi', () => {
    const geo = makeMock();
    installGeolocation(geo);

    const { unmount } = renderHook(() => useGeoTracking({ target: TARGET, enabled: true }));

    unmount();
    expect(geo.clearWatch).toHaveBeenCalledWith(geo.watches[0]!.id);
    expect(geo.watches[0]!.cleared).toBe(true);
  });
});

describe('useGeoTracking — adaptive interval', () => {
  it('NEAR target (≤500m) — 15s interval', () => {
    const geo = makeMock();
    installGeolocation(geo);

    const onPing = vi.fn();
    renderHook(() => useGeoTracking({ target: TARGET, enabled: true, onPing }));

    // Birinchi ping — darhol o'tadi
    act(() => {
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(1);

    // 14s o'tdi — hali interval'ga yetmagan (15s NEAR uchun)
    act(() => {
      vi.setSystemTime(new Date('2026-05-09T10:00:14Z'));
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(1);

    // 15s o'tdi — yangi ping qabul qilinadi
    act(() => {
      vi.setSystemTime(new Date('2026-05-09T10:00:16Z'));
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(2);
  });

  it('FAR target (>500m) — 30s interval', () => {
    const geo = makeMock();
    installGeolocation(geo);

    const onPing = vi.fn();
    renderHook(() => useGeoTracking({ target: TARGET, enabled: true, onPing }));

    act(() => {
      geo.watches[0]!.success(makePosition(FAR.lat, FAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(1);

    // 16s — NEAR uchun yetadi, lekin FAR uchun yo'q
    act(() => {
      vi.setSystemTime(new Date('2026-05-09T10:00:16Z'));
      geo.watches[0]!.success(makePosition(FAR.lat, FAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(1);

    // 30s — yetadi
    act(() => {
      vi.setSystemTime(new Date('2026-05-09T10:00:31Z'));
      geo.watches[0]!.success(makePosition(FAR.lat, FAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(2);
  });
});

describe('useGeoTracking — accuracy filter', () => {
  it("accuracy > 100m bo'lsa ping tashlab yuboriladi", () => {
    const geo = makeMock();
    installGeolocation(geo);

    const onPing = vi.fn();
    renderHook(() => useGeoTracking({ target: TARGET, enabled: true, onPing }));

    act(() => {
      // 150m accuracy — past sifatli IP/Wi-Fi geolocation
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng, 150));
    });
    expect(onPing).not.toHaveBeenCalled();

    // 50m accuracy — qabul qilinadi
    act(() => {
      vi.setSystemTime(new Date('2026-05-09T10:00:01Z'));
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng, 50));
    });
    expect(onPing).toHaveBeenCalledOnce();
  });
});

describe('useGeoTracking — target=null (no adaptive)', () => {
  it("target null bo'lsa qattiq 30s interval", () => {
    const geo = makeMock();
    installGeolocation(geo);

    const onPing = vi.fn();
    renderHook(() => useGeoTracking({ target: null, enabled: true, onPing }));

    act(() => {
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(1);

    // NEAR ga juda yaqin (target null bo'lgani uchun masofa Infinity → 30s)
    act(() => {
      vi.setSystemTime(new Date('2026-05-09T10:00:16Z'));
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(1);

    act(() => {
      vi.setSystemTime(new Date('2026-05-09T10:00:31Z'));
      geo.watches[0]!.success(makePosition(NEAR.lat, NEAR.lng));
    });
    expect(onPing).toHaveBeenCalledTimes(2);
  });
});

describe('haversineMeters', () => {
  it('bir xil nuqtalar — 0 metr', () => {
    expect(haversineMeters(TARGET, TARGET)).toBe(0);
  });

  it('NEAR (~ 200m) ≤ 500m', () => {
    const d = haversineMeters(TARGET, NEAR);
    expect(d).toBeGreaterThan(50);
    expect(d).toBeLessThanOrEqual(500);
  });

  it('FAR (~ 5km) > 500m', () => {
    const d = haversineMeters(TARGET, FAR);
    expect(d).toBeGreaterThan(500);
  });
});
