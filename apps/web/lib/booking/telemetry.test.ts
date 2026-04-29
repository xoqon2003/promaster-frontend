/**
 * T4.12 — `trackBookingEvent` unit tests.
 *
 * Hook (`useStepTelemetry`) komponent renderiga ehtiyoj qiladi —
 * pure function `trackBookingEvent` testlanadi.
 *
 * R07: Mixpanel SDK yo'q (jsdom default) — silent no-op.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { trackBookingEvent } from './telemetry';

const mockTrack = vi.fn();

beforeEach(() => {
  mockTrack.mockReset();
  if (typeof window !== 'undefined') {
    Reflect.deleteProperty(window, 'mixpanel');
  }
});

afterEach(() => {
  if (typeof window !== 'undefined') {
    Reflect.deleteProperty(window, 'mixpanel');
  }
  vi.clearAllMocks();
});

describe('trackBookingEvent', () => {
  it("Mixpanel yo'q — silent no-op (xato yo'q)", () => {
    expect(() => trackBookingEvent('booking_step_started', { step: 1 })).not.toThrow();
  });

  it('Mixpanel mavjud — track chaqiriladi', () => {
    Object.defineProperty(window, 'mixpanel', {
      configurable: true,
      value: { track: mockTrack },
    });

    trackBookingEvent('booking_step_completed', {
      step: 2,
      durationMs: 30_000,
      categoryId: 'elektrik',
    });

    expect(mockTrack).toHaveBeenCalledWith('booking_step_completed', {
      step: 2,
      durationMs: 30_000,
      categoryId: 'elektrik',
    });
  });

  it('undefined property qiymatlar olib tashlanadi', () => {
    Object.defineProperty(window, 'mixpanel', {
      configurable: true,
      value: { track: mockTrack },
    });

    trackBookingEvent('booking_step_started', {
      step: 1,
      categoryId: undefined,
      userId: 'u_42',
    });

    expect(mockTrack).toHaveBeenCalledWith('booking_step_started', {
      step: 1,
      userId: 'u_42',
    });
  });

  it('track xatolik bersa — throw qilmaydi (silent fallback)', () => {
    Object.defineProperty(window, 'mixpanel', {
      configurable: true,
      value: {
        track: () => {
          throw new Error('Mixpanel internal error');
        },
      },
    });

    expect(() => trackBookingEvent('booking_failed', { errorKind: 'network' })).not.toThrow();
  });

  it('submitted event — bookingId va userId bilan', () => {
    Object.defineProperty(window, 'mixpanel', {
      configurable: true,
      value: { track: mockTrack },
    });

    trackBookingEvent('booking_submitted', {
      bookingId: 'bk_123',
      userId: 'u_42',
      categoryId: 'remont',
    });

    expect(mockTrack).toHaveBeenCalledWith('booking_submitted', {
      bookingId: 'bk_123',
      userId: 'u_42',
      categoryId: 'remont',
    });
  });

  it('failed event — errorKind bilan', () => {
    Object.defineProperty(window, 'mixpanel', {
      configurable: true,
      value: { track: mockTrack },
    });

    trackBookingEvent('booking_failed', { errorKind: 'validation', step: 5 });

    expect(mockTrack).toHaveBeenCalledWith('booking_failed', {
      errorKind: 'validation',
      step: 5,
    });
  });
});
