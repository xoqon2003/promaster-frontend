/**
 * Real OTP adapter — Eskiz SMS + Postgres OTP storage (S05 T5.03).
 *
 * Mock adapter (in-memory) o'rniga production usage. `OTP_PROVIDER=eskiz`
 * env switcher orqali tanlanadi.
 *
 * Flow:
 *   sendOtp(phone):
 *     1. crypto.randomInt(0, 999999) — 6 raqamli kod
 *     2. bcrypt.hash(code, 10) — DB'ga raw kod tushmaydi
 *     3. INSERT otp_codes { phone, code_hash, expires_at = NOW + 2 min }
 *     4. Eskiz.sendSms(phone, "Promaster: <code>")
 *     5. Return { expiresAt }
 *
 *   verifyOtp(phone, code):
 *     1. Eng yangi otp_codes (phone, used_at IS NULL, expires_at > NOW)
 *     2. attempts >= 3 → null (block)
 *     3. bcrypt.compare(code, code_hash):
 *        - mismatch: attempts++, return null
 *        - match: used_at = NOW, findOrCreateUser(phone), return user
 *
 *   refreshUser(id): findUserById (DRY — db-adapter)
 *
 * Security:
 *   - Raw kod hech qachon log/DB'ga tushmaydi (faqat bcrypt hash)
 *   - bcrypt cost 10 (adaptive — modern HW'da ~100ms)
 *   - Attempts counter brute-force ni cheklaydi
 *   - 2 daqiqa TTL (xavfsizroq tanlov, Q4 javob)
 */
import { hash, compare } from 'bcryptjs';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';

import { db } from '@/lib/db';
import { otpCodes, OTP_TTL_MS } from '@/lib/db/schema';

import { findOrCreateUserByPhone, findUserById } from './db-adapter';
import { getEskizClient } from './eskiz-client';
import type { OtpAdapter } from './mock-adapter';

// ─── Constants ───────────────────────────────────────────────────────────────

const BCRYPT_COST = 10;
const MAX_ATTEMPTS = 3;
const OTP_LENGTH = 6;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * 6 raqamli OTP kod — `crypto.randomInt` orqali xavfsiz random.
 *
 * Web Crypto API (Edge runtime'da ham, Node'da ham). `randomInt` Node-only
 * bo'lgani uchun `getRandomValues` ishlatamiz.
 */
function generateCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // `buf[0]` 0..2^32-1 → modulo 1_000_000 → 6 raqamli (0..999999)
  return ((buf[0] ?? 0) % 1_000_000).toString().padStart(OTP_LENGTH, '0');
}

function buildSmsMessage(code: string): string {
  return `Promaster: tasdiqlash kodi ${code}. Hech kim bilan ulashmang.`;
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

export const eskizAdapter: OtpAdapter = {
  async sendOtp(phone) {
    const code = generateCode();
    const codeHash = await hash(code, BCRYPT_COST);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // 1. DB'ga yangi OTP yozish (eski OTP'lar joyida qoladi —
    //    `verifyOtp` doim eng yangi'ni o'qiydi)
    await db.insert(otpCodes).values({ phone, codeHash, expiresAt });

    // 2. SMS yuborish (timeout 5s, 1 retry — eskiz-client ichida)
    await getEskizClient().sendSms(phone, buildSmsMessage(code));

    return { expiresAt: expiresAt.getTime() };
  },

  async verifyOtp(phone, code) {
    // 1. Eng yangi foydalanilmagan + amal qiluvchi OTP
    const [latest] = await db
      .select()
      .from(otpCodes)
      .where(
        and(eq(otpCodes.phone, phone), isNull(otpCodes.usedAt), gt(otpCodes.expiresAt, new Date())),
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!latest) return null; // OTP yo'q yoki muddati o'tgan
    if (latest.attempts >= MAX_ATTEMPTS) return null; // Brute-force block

    const matches = await compare(code, latest.codeHash);
    if (!matches) {
      // Noto'g'ri — attempts++ va null
      await db
        .update(otpCodes)
        .set({ attempts: latest.attempts + 1 })
        .where(eq(otpCodes.id, latest.id));
      return null;
    }

    // To'g'ri — used_at set + user yaratish/topish
    await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, latest.id));

    return findOrCreateUserByPhone(phone);
  },

  async refreshUser(id) {
    return findUserById(id);
  },
};
