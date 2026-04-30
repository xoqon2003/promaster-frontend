/**
 * OtpAdapter factory unit tests.
 *
 * `OTP_PROVIDER` env switcher mock vs eskiz adapter'ni tanlaydi.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { eskizAdapter } from './eskiz-adapter';
import { mockAdapter } from './mock-adapter';
import { __resetOtpAdapter, getOtpAdapter } from './otp-adapter';

beforeEach(() => {
  __resetOtpAdapter();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getOtpAdapter (env switcher)', () => {
  it("default (env yo'q) → mockAdapter", () => {
    vi.stubEnv('OTP_PROVIDER', '');
    expect(getOtpAdapter()).toBe(mockAdapter);
  });

  it('OTP_PROVIDER=mock → mockAdapter', () => {
    vi.stubEnv('OTP_PROVIDER', 'mock');
    expect(getOtpAdapter()).toBe(mockAdapter);
  });

  it('OTP_PROVIDER=eskiz → eskizAdapter', () => {
    vi.stubEnv('OTP_PROVIDER', 'eskiz');
    expect(getOtpAdapter()).toBe(eskizAdapter);
  });

  it('singleton — bir necha chaqiruv bir xil instansiya', () => {
    vi.stubEnv('OTP_PROVIDER', 'mock');
    const a = getOtpAdapter();
    const b = getOtpAdapter();
    expect(a).toBe(b);
  });

  it("noto'g'ri provider → mockAdapter (fallback)", () => {
    vi.stubEnv('OTP_PROVIDER', 'twilio');
    expect(getOtpAdapter()).toBe(mockAdapter);
  });
});
