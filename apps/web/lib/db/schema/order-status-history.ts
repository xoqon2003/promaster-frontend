/**
 * `order_status_history` jadvali — audit trail (S06 T6.02).
 *
 * Stack: PostgreSQL + Drizzle ORM.
 * Source-of-truth: `docs/sprints/S06/planning.md` D6 (state machine).
 *
 * Buyurtma har status o'zgarishida yangi qator qo'shiladi (immutable —
 * UPDATE/DELETE qilinmaydi). Frontend timeline (T6.06) shu jadvaldan
 * o'qiydi: "qabul qilindi 14:23", "yo'lda 14:35".
 *
 * Maydonlar:
 *   - `id`         UUID PK
 *   - `orderId`    FK `orders.id` — kaskad o'chirish (order o'chsa history ham)
 *   - `status`     enum `order_status` — ushbu o'tishdagi yangi holat
 *   - `actorId`    FK `users.id` — kim o'zgartirdi (mijoz yoki usta)
 *   - `metadata`   jsonb — qo'shimcha kontekst (masalan, `cancelled` sababi,
 *                  GPS pin koordinatalari `arrived` paytida, va h.k.)
 *   - `createdAt`  server timestamp — timeline tartibi shu bo'yicha
 *
 * Indekslar:
 *   - `order_status_history_order_id_created_at_idx` — `WHERE order_id = ?
 *     ORDER BY created_at` timeline render uchun (T6.06)
 *
 * Tozalash strategiyasi: tozalanmaydi. Order lifecycle audit trail GDPR/legal
 * uchun kerak (S08+ Wallet sprintda escrow dispute hal qilish uchun
 * foydalaniladi).
 */
import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { orders, orderStatusEnum } from './orders';
import { users } from './users';

// ─── Table ───────────────────────────────────────────────────────────────────

export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** FK `orders.id`. Order o'chsa history ham o'chadi (kaskad). */
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),

    /** O'tishdagi YANGI holat — `from_status` saqlanmaydi (oldingi qator). */
    status: orderStatusEnum('status').notNull(),

    /** FK `users.id` — actor (mijoz yoki usta). */
    actorId: uuid('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    /**
     * Qo'shimcha kontekst (free-form jsonb):
     *   - `cancelled`: `{ reason: 'mijoz_so\'radi' }`
     *   - `arrived`: `{ lat, lng, accuracy }` — usta GPS pin
     *   - `accepted`: `{ etaMinutes: 15 }` — usta bahosi
     */
    metadata: jsonb('metadata')
      .notNull()
      .default(sql`'{}'::jsonb`),

    /** Timeline tartibi shu bo'yicha (T6.06). */
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('order_status_history_order_id_created_at_idx').on(
      table.orderId,
      sql`${table.createdAt} ASC`,
    ),
  ],
);

// ─── Type exports ────────────────────────────────────────────────────────────

export type OrderStatusHistoryEntry = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistoryEntry = typeof orderStatusHistory.$inferInsert;

// ─── Zod schemas (drizzle-zod) ───────────────────────────────────────────────

/** Timeline render input — `OrderStatusHistoryEntry[]` (T6.06). */
export const OrderStatusHistorySchema = createSelectSchema(orderStatusHistory);

/** State transition insert — T6.05 endpoint validatsiyasi. */
export const NewOrderStatusHistorySchema = createInsertSchema(orderStatusHistory);
