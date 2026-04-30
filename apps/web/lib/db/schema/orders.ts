/**
 * `orders` jadvali — order lifecycle root (S06 T6.02).
 *
 * Stack: PostgreSQL + Drizzle ORM.
 * Source-of-truth: `docs/sprints/S06/planning.md` (D6 — server-side state
 * machine + optimistic concurrency via etag = `updatedAt`).
 *
 * Order lifecycle 7 holatda yuradi (state machine `lib/orders/state-machine.ts`):
 *
 *   pending → accepted → en_route → arrived → in_progress → completed
 *      └─────────┴──────────┴──────────┴──────────┴──────────┴── cancelled (terminator)
 *
 * `cancelled` har bosqichdan kirishi mumkin (terminal). `completed` ham terminal.
 *
 * Maydonlar:
 *   - `id`              UUID PK
 *   - `clientId`        FK `users.id` — buyurtma yaratuvchi (mijoz)
 *   - `proId`            FK `users.id` — qabul qilgan usta (`pending` da `null`)
 *   - `status`          enum `order_status` — joriy bosqich
 *   - `serviceCategory` text — booking wizard'dan (masalan: `plumbing`)
 *   - `priceMinor`      integer — eng kichik birlik (UZS — tiyin yo'q, so'mda
 *                       saqlaymiz; masalan 120000 = 120 000 so'm)
 *   - `currency`        text default `'UZS'` — kelajakda RUB/USD uchun
 *   - `addressText`     manzil matni (foydalanuvchi kiritgan)
 *   - `addressLat`      decimal(9,6) — Yandex Maps pin uchun
 *   - `addressLng`      decimal(9,6)
 *   - `scheduledAt`     timestamptz nullable — `null` = "iloji boricha tezroq"
 *   - `createdAt`       immutable, server timestamp
 *   - `updatedAt`       har UPDATE'da yangilanadi → optimistic lock etag (R05)
 *
 * Indekslar:
 *   - `orders_client_id_idx`  — `WHERE client_id = ?` mijoz orders ro'yxati
 *   - `orders_pro_id_idx`     — `WHERE pro_id = ?` usta dashboard
 *
 * Migration konventsiyasi (R10): additive-only S06+. `proId` `pending` da
 * `null` bo'ladi — mijoz buyurtma qo'shganda usta tayinlanmagan; T6.05
 * `accepted` o'tishda set qilinadi.
 */
import {
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from './users';

// ─── Enums ───────────────────────────────────────────────────────────────────

/**
 * Order status — state machine `lib/orders/state-machine.ts` validatsiya qiladi.
 *
 * Frontend `components/features/order-timeline` shu enum'dan foydalanadi.
 * Yangi status qo'shish — schema migration + state machine yangilash + i18n
 * keys + Storybook story (T6.06 acceptance).
 */
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'accepted',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
]);

// ─── Table ───────────────────────────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** FK `users.id` — buyurtma yaratuvchi mijoz. */
    clientId: uuid('client_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    /** FK `users.id` — `pending` holatda `null`, `accepted` da set qilinadi. */
    proId: uuid('pro_id').references(() => users.id, { onDelete: 'restrict' }),

    status: orderStatusEnum('status').notNull().default('pending'),

    /** Booking wizard'dan keladi — masalan `'plumbing'`, `'electrical'`. */
    serviceCategory: text('service_category').notNull(),

    /** Eng kichik birlik. UZS — so'm (tiyin yo'q). */
    priceMinor: integer('price_minor').notNull(),

    /** ISO 4217. Default UZS — RUB/USD kelajak sprintda. */
    currency: text('currency').notNull().default('UZS'),

    /** Foydalanuvchi kiritgan manzil matni. */
    addressText: text('address_text').notNull(),

    /** Yandex Maps pin koordinatalari — 6 decimal ≈ 11 sm aniqlik. */
    addressLat: decimal('address_lat', { precision: 9, scale: 6 }).notNull(),
    addressLng: decimal('address_lng', { precision: 9, scale: 6 }).notNull(),

    /** `null` = "iloji boricha tez" (immediate booking). */
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

    /** Optimistic lock etag (R05). T6.05 endpoint `WHERE updated_at = etag`. */
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('orders_client_id_idx').on(table.clientId),
    index('orders_pro_id_idx').on(table.proId),
  ],
);

// ─── Type exports ────────────────────────────────────────────────────────────

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

/** Status enum literal union — state machine va frontend timeline ishlatadi. */
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

// ─── Zod schemas (drizzle-zod) ───────────────────────────────────────────────

/**
 * Status enum Zod literal union — frontend forms va `useOrderStream`
 * (T6.03) shu bilan validatsiya qiladi.
 */
export const OrderStatusSchema = z.enum(orderStatusEnum.enumValues);

/** SELECT shape — DB → app (TanStack Query, SSE payload). */
export const OrderSchema = createSelectSchema(orders);

/** INSERT shape — POST /api/orders (booking wizard submit, T6.05). */
export const NewOrderSchema = createInsertSchema(orders);
