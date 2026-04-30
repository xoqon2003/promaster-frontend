/**
 * `users` jadvali — auth foundation (S05 T5.02).
 *
 * Stack: PostgreSQL + Drizzle ORM.
 * Source-of-truth: stack qarori `docs/sprints/S05/planning.md`.
 *
 * Maydonlar:
 *   - `id`        UUID primary key, server-generated
 *   - `phone`     E.164 (`+998XXXXXXXXX`) — UNIQUE, login identifikator
 *   - `name`      `null` = signup tugamagan (OTP verify bo'lgan, lekin
 *                 rol+ism kiritilmagan). Frontend shu flag bilan
 *                 mavjud user vs yangi user'ni ajratadi (A03 chain).
 *   - `role`      enum: `client | pro | admin`. Default `client`.
 *   - `createdAt` immutable, server timestamp
 *   - `updatedAt` har UPDATE'da yangilanadi (trigger yoki app-level)
 *
 * Indekslar:
 *   - `phone` UNIQUE (auto by `unique()`) — login lookup tez
 *
 * Migration konventsiyasi (R01): additive-only S05-S07. Column o'zgartirish
 * yoki o'chirish — yangi sprint, alohida migration.
 */
import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────

/** Foydalanuvchi roli — middleware role-based guards bilan mos. */
export const userRoleEnum = pgEnum('user_role', ['client', 'pro', 'admin']);

// ─── Table ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  /** O'zbek telefon raqami E.164 — `+998XXXXXXXXX` (13 belgi). */
  phone: varchar('phone', { length: 13 }).notNull().unique(),

  /** `null` = signup form to'ldirilmagan (OTP'dan o'tdi, name+role yo'q). */
  name: varchar('name', { length: 100 }),

  role: userRoleEnum('role').notNull().default('client'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Type exports ────────────────────────────────────────────────────────────

/** SELECT natijasi (DB → app). */
export type User = typeof users.$inferSelect;

/** INSERT input (app → DB). `id`, `createdAt`, `updatedAt` auto. */
export type NewUser = typeof users.$inferInsert;

/** Rol enum — frontend `lib/auth/schemas.ts` bilan mos kelishi kerak (R03). */
export type UserRole = (typeof userRoleEnum.enumValues)[number];
