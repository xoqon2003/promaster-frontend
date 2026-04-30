/**
 * `tracking_pings` jadvali — GPS ping stream (S06 T6.02).
 *
 * Stack: PostgreSQL + Drizzle ORM.
 * Source-of-truth: `docs/sprints/S06/planning.md` D2 (adaptive interval),
 * D5 (24h retention).
 *
 * Usta `useGeoTracking` hook (T6.04) har 30s/15s da `POST /api/tracking`
 * (T6.05) chaqiradi → bu jadvalga insert. SSE endpoint (T6.03) so'nggi pin'ni
 * mijozga oqim qiladi.
 *
 * **Retention 24 soat (D5):** Vercel Cron job sutkasiga bir marta
 * `DELETE FROM tracking_pings WHERE recorded_at < NOW() - INTERVAL '24 hours'`.
 * Implementation T6.03 ichida (cron route — alohida task emas).
 *
 * Maydonlar:
 *   - `id`         UUID PK
 *   - `orderId`    FK `orders.id` — kaskad o'chirish
 *   - `proId`     FK `users.id` — usta (denormalized — auth check tez)
 *   - `lat`        decimal(9,6) — 6 decimal ≈ 11 sm
 *   - `lng`        decimal(9,6)
 *   - `accuracy`   decimal(5,1) — metr (browser geolocation `coords.accuracy`)
 *   - `recordedAt` timestamptz — ping client-side vaqti, server saqlash emas
 *
 * Indekslar:
 *   - `tracking_pings_order_id_recorded_at_idx` — SSE polling
 *     `WHERE order_id = ? AND recorded_at > ? ORDER BY recorded_at DESC LIMIT 1`
 *
 * **Cost mitigation (R08):** Adaptive interval (D2) + retention 24h
 * cumulative DB hajmini cheklaydi. 1000 active order × 24h × 30s ping
 * ≈ 2.88M qator/sutka — Neon free tier 3GB chegarasidan past.
 */
import { sql } from 'drizzle-orm';
import { decimal, index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { orders } from './orders';
import { users } from './users';

// ─── Table ───────────────────────────────────────────────────────────────────

export const trackingPings = pgTable(
  'tracking_pings',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** FK `orders.id`. Order o'chsa ping'lar ham o'chadi. */
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),

    /** FK `users.id` — denormalized: auth check `WHERE pro_id = session.user.id`. */
    proId: uuid('pro_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    /** Browser `navigator.geolocation` koordinatalari. */
    lat: decimal('lat', { precision: 9, scale: 6 }).notNull(),
    lng: decimal('lng', { precision: 9, scale: 6 }).notNull(),

    /** `coords.accuracy` metrda. Frontend filter: > 100m ping hisobga olinmaydi. */
    accuracy: decimal('accuracy', { precision: 5, scale: 1 }).notNull(),

    /** Client-side recorded vaqt — ping latency hisoblash uchun. */
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    // SSE polling — eng yangi ping topish (`order_id` filter, `recorded_at` sort).
    index('tracking_pings_order_id_recorded_at_idx').on(
      table.orderId,
      sql`${table.recordedAt} DESC`,
    ),
  ],
);

// ─── Type exports ────────────────────────────────────────────────────────────

export type TrackingPing = typeof trackingPings.$inferSelect;
export type NewTrackingPing = typeof trackingPings.$inferInsert;

// ─── Zod schemas (drizzle-zod) ───────────────────────────────────────────────

/** SSE payload — `data: { ...TrackingPing }` (T6.03). */
export const TrackingPingSchema = createSelectSchema(trackingPings);

/** POST /api/tracking body — T6.05 endpoint validatsiyasi. */
export const NewTrackingPingSchema = createInsertSchema(trackingPings);
