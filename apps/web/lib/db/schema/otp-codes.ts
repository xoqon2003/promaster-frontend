/**
 * `otp_codes` jadvali — OTP verification state (S05 T5.02).
 *
 * Stack: PostgreSQL + Drizzle ORM.
 * Source-of-truth: stack qarori `docs/sprints/S05/planning.md`.
 *
 * OTP TTL = **2 daqiqa** (Q4 javob, xavfsizroq tanlov). Frontend
 * `otp-form.tsx` 60s'dan keyin "qayta yuborish" tugmasini ko'rsatadi —
 * UX kompensatsiya yetarli.
 *
 * Maydonlar:
 *   - `id`         UUID PK
 *   - `phone`      `+998XXXXXXXXX` — `users.phone` ga FK emas (OTP yuborish
 *                  paytida user hali yaratilmagan bo'lishi mumkin)
 *   - `codeHash`   bcrypt hash — raw kod log/DB'ga tushmasin
 *   - `attempts`   noto'g'ri urinish soni (≥ 3 → bloklash)
 *   - `expiresAt`  yaratilgan vaqt + 2 daqiqa
 *   - `usedAt`     `null` = foydalanilmagan; success'da set qilinadi
 *   - `createdAt`  server timestamp
 *
 * Indekslar:
 *   - `(phone, created_at DESC)` — eng yangi OTP topish (verify lookup)
 *
 * Tozalash strategiyasi (S06+ ga ko'chiriladi): `expiresAt < NOW() - 24h`
 * yozuvlarni cron job bilan o'chirish (Upstash QStash). S05 da DB shishishi
 * sezilarli emas (≤ 1000 row/oy).
 */
import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * OTP TTL — 2 daqiqa millisekundda.
 *
 * Frontend `otp-form.tsx` `OTP_TIMEOUT = 120` (sekund) bilan mos.
 * Backend `eskiz-adapter.ts` (T5.03) shu konstantani ishlatadi.
 */
export const OTP_TTL_MS = 2 * 60 * 1000;

// ─── Table ───────────────────────────────────────────────────────────────────

export const otpCodes = pgTable(
  'otp_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** E.164 telefon — `users.phone` bilan bir xil format, lekin FK yo'q. */
    phone: varchar('phone', { length: 13 }).notNull(),

    /** bcrypt hash — `bcrypt.compare(rawCode, codeHash)` orqali tekshiriladi. */
    codeHash: text('code_hash').notNull(),

    /** Noto'g'ri urinish hisoblagich. ≥ 3 → block (frontend OtpForm flow). */
    attempts: integer('attempts').notNull().default(0),

    /** UTC. Yaratilgan vaqt + OTP_TTL_MS. */
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    /** `null` = foydalanilmagan; verify success'da `NOW()` ga set. */
    usedAt: timestamp('used_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Eng yangi OTP topish — `WHERE phone = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`
    index('otp_codes_phone_created_at_idx').on(table.phone, sql`${table.createdAt} DESC`),
  ],
);

// ─── Type exports ────────────────────────────────────────────────────────────

export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
