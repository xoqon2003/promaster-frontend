/**
 * OtpAdapter factory — `OTP_PROVIDER` env switcher (S05 T5.03).
 *
 * `OTP_PROVIDER=mock` (default) — in-memory adapter, dev/test uchun
 * `OTP_PROVIDER=eskiz` — real Eskiz SMS + Postgres (production)
 *
 * Eskiz adapter aktivatsiya'gacha mock default barcha env'larda
 * (planning Q1 javob).
 *
 * `auth.ts` Credentials provider shu factory'ni chaqiradi —
 * adapter instansiyasi runtime'da tanlanadi.
 */
import { eskizAdapter } from './eskiz-adapter';
import { mockAdapter, type OtpAdapter } from './mock-adapter';

export type OtpProviderName = 'mock' | 'eskiz';

let cachedAdapter: OtpAdapter | null = null;

/**
 * Aktiv OtpAdapter'ni qaytaradi (singleton).
 *
 * Birinchi chaqiruv'da env o'qiladi va keshlangan instansiya saqlanadi.
 */
export function getOtpAdapter(): OtpAdapter {
  if (cachedAdapter) return cachedAdapter;

  const provider = (process.env.OTP_PROVIDER ?? 'mock') as OtpProviderName;
  switch (provider) {
    case 'eskiz':
      cachedAdapter = eskizAdapter;
      break;
    case 'mock':
    default:
      cachedAdapter = mockAdapter;
      break;
  }
  return cachedAdapter;
}

/** @internal — testlarda factory'ni reset qilish uchun */
export function __resetOtpAdapter(): void {
  cachedAdapter = null;
}
