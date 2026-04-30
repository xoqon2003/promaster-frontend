/**
 * `POST /api/orders/[id]/status` — order status transition (S06 T6.05).
 *
 * Mijoz yoki usta status'ni o'zgartiradi. State machine `lib/orders/state-machine.ts`
 * `canTransition` orqali server-side authoritative check (D6). Optimistic
 * concurrency: client `etag` (joriy `updatedAt`) yuboradi — agar DB'da
 * boshqa transition allaqachon yozilgan bo'lsa, mismatch → 409 (R05).
 *
 * **Auth:** actor in (order.clientId, order.proId), aks holda 403.
 * **State machine:** invalid transition → 422.
 * **Race condition:** etag mismatch → 409 (frontend reload + retry).
 *
 * Tarixiy ma'lumot — har transition `order_status_history` ga immutable
 * yozuv qoldiradi (timeline render uchun, T6.06).
 */
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { orderStatusHistory } from '@/lib/db/schema/order-status-history';
import { OrderStatusSchema, orders } from '@/lib/db/schema/orders';
import { canTransition } from '@/lib/orders/state-machine';

export const runtime = 'edge';

// ─── Request schema ──────────────────────────────────────────────────────────

const StatusTransitionSchema = z.object({
  status: OrderStatusSchema,
  /** ISO 8601 — order.updatedAt joriy qiymati (optimistic lock token). */
  etag: z.string().datetime({ offset: true }),
  /** Ixtiyoriy metadata — `cancelled` reason, `accepted` etaMinutes, h.k. */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: orderId } = await context.params;

  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Body parsing + validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = StatusTransitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 },
    );
  }
  const { status: newStatus, etag, metadata } = parsed.data;

  // 3. Order fetch
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // 4. Auth: actor in (clientId, proId)
  if (order.clientId !== userId && order.proId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 5. State machine validation
  if (!canTransition(order.status, newStatus)) {
    return NextResponse.json(
      {
        error: 'Invalid transition',
        from: order.status,
        to: newStatus,
      },
      { status: 422 },
    );
  }

  // 6. Optimistic concurrency — etag (`updated_at`) DB qiymati bilan mos kelishi kerak
  const etagDate = new Date(etag);
  const now = new Date();

  const updated = await db
    .update(orders)
    .set({ status: newStatus, updatedAt: now })
    .where(and(eq(orders.id, orderId), eq(orders.updatedAt, etagDate)))
    .returning({ id: orders.id, updatedAt: orders.updatedAt });

  if (updated.length === 0) {
    // Boshqa actor allaqachon o'zgartirgan — frontend reload + retry kerak.
    return NextResponse.json(
      {
        error: 'Conflict',
        message: 'Order was modified by another actor. Reload and retry.',
      },
      { status: 409 },
    );
  }

  // 7. Audit trail — immutable history yozuv
  await db.insert(orderStatusHistory).values({
    orderId,
    status: newStatus,
    actorId: userId,
    metadata: metadata ?? {},
  });

  return NextResponse.json(
    { ok: true, status: newStatus, updatedAt: updated[0]!.updatedAt },
    { status: 200 },
  );
}
