/**
 * Mock OTP Adapter — development va test muhiti uchun.
 *
 * Production'da bu fayl o'rniga `sms-adapter.ts` ishlatiladi.
 * Interface bir xil → faqat import path o'zgaradi.
 *
 * Mock OTP: har doim "123456" (dev env)
 */

import type { SessionUser } from './schemas';

// ─── Adapter Interface ────────────────────────────────────────────────────────

export interface OtpAdapter {
  sendOtp(phone: string): Promise<{ expiresAt: number }>;
  verifyOtp(phone: string, code: string): Promise<SessionUser | null>;
  refreshUser(id: string): Promise<SessionUser | null>;
}

// ─── In-memory user store ─────────────────────────────────────────────────────

const users = new Map<string, SessionUser>();

function findOrCreate(phone: string): SessionUser {
  const existing = users.get(phone);
  if (existing) return existing;

  const user: SessionUser = {
    id: `mock_${phone.replace(/\D/g, '')}`,
    phone,
    role: 'client', // default rol — signup'da o'zgartiriladi
    createdAt: new Date().toISOString(),
  };
  users.set(phone, user);
  return user;
}

// ─── Mock Adapter ─────────────────────────────────────────────────────────────

const VALID_OTP = process.env.MOCK_OTP ?? '123456';

export const mockAdapter: OtpAdapter = {
  async sendOtp(phone: string) {
    // Real implementatsiyada: SMS yuborish
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[MockAuth] OTP ${VALID_OTP} → ${phone}`);
    }
    return { expiresAt: Date.now() + 120_000 }; // 2 daqiqa
  },

  async verifyOtp(phone: string, code: string) {
    if (code !== VALID_OTP) return null;
    return findOrCreate(phone);
  },

  async refreshUser(id: string) {
    for (const user of users.values()) {
      if (user.id === id) return user;
    }
    return null;
  },
};

// ─── Update user (signup'da ishlatiladi) ─────────────────────────────────────

export function updateMockUser(
  phone: string,
  patch: Partial<Pick<SessionUser, 'name' | 'role'>>,
): SessionUser {
  const user = findOrCreate(phone);
  const updated: SessionUser = { ...user, ...patch };
  users.set(phone, updated);
  return updated;
}
