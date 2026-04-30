/**
 * DB-only auth queries (S05 T5.03).
 *
 * Drizzle queries `users` jadvali ustida. Eskiz/mock adapter'lar bu
 * helperlardan foydalanadi (DRY — DB lookup logikasini takrorlamaslik).
 *
 * Source-of-truth: `lib/db/schema/users.ts`.
 */
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users, type User as DbUser } from '@/lib/db/schema';

import type { SessionUser } from './schemas';

// ─── DB row → SessionUser mapping ────────────────────────────────────────────

/**
 * Drizzle `User` row'ni NextAuth `SessionUser` formatiga aylantiradi.
 *
 * `name` `null` bo'lsa `undefined` qilinadi (SessionUserSchema optional).
 */
export function toSessionUser(row: DbUser): SessionUser {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name ?? undefined,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Telefon raqam bo'yicha mavjud user'ni topadi yoki yangi yaratadi.
 *
 * Concurrent OTP verify (race condition) uchun
 * `INSERT ... ON CONFLICT (phone) DO UPDATE` ishlatiladi (Postgres native).
 */
export async function findOrCreateUserByPhone(phone: string): Promise<SessionUser> {
  const [row] = await db
    .insert(users)
    .values({ phone, role: 'client' })
    .onConflictDoUpdate({
      target: users.phone,
      // No-op update — ON CONFLICT DO NOTHING'da RETURNING bo'sh bo'lishi
      // mumkin (Postgres bug-feature). DO UPDATE SET phone = EXCLUDED.phone
      // RETURNING ishonchli ravishda row qaytaradi.
      set: { phone: phone },
    })
    .returning();

  if (!row) {
    throw new Error(`findOrCreateUserByPhone: no row returned for ${phone}`);
  }
  return toSessionUser(row);
}

/**
 * User'ni ID bo'yicha topadi. Topilmasa `null`.
 *
 * NextAuth `session` callback'da user ma'lumotini yangilash uchun
 * (token'dagi role/name session'ga ko'chiriladi).
 */
export async function findUserById(id: string): Promise<SessionUser | null> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ? toSessionUser(row) : null;
}

/**
 * Signup form submit'da chaqiriladi — user'ning `name` va `role` ni
 * yangilaydi.
 *
 * `null` `name` => "signup tugamagan" deb hisoblanadi (R03 chain).
 * Bu funksiya `name` ni set qilgach, user "to'liq" bo'ladi.
 */
export async function updateUserProfile(
  phone: string,
  patch: { name: string; role: 'client' | 'pro' | 'admin' },
): Promise<SessionUser> {
  const [row] = await db
    .update(users)
    .set({ name: patch.name, role: patch.role, updatedAt: new Date() })
    .where(eq(users.phone, phone))
    .returning();

  if (!row) {
    throw new Error(`updateUserProfile: user not found for ${phone}`);
  }
  return toSessionUser(row);
}
