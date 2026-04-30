/**
 * `GET /api/orders/[id]/events` — Server-Sent Events stream (S06 T6.03).
 *
 * Stack qarori D1 (`docs/sprints/S06/planning.md`): Vercel Edge Runtime
 * + native SSE. Polling fallback `?fallback=poll` keyingi sprintga
 * qoldirildi (T6.03 acceptance — minimal, lekin kengaytiriladi).
 *
 * **Mexanizmi:**
 *
 *   1. Auth — `session.user.id` order.clientId yoki order.proId bilan
 *      mos kelishi shart. Aks holda 403.
 *   2. Initial flush — joriy order + history + so'nggi tracking ping
 *      bitta paket bo'lib jo'natiladi (frontend dastlabki render uchun).
 *   3. Poll loop — har 5s da DB tekshiriladi:
 *        - `orders.updated_at > lastOrderTick` → `event: order`
 *        - `order_status_history` yangi qatorlar (`> lastHistoryTick`) → `event: status`
 *        - `tracking_pings` yangi pinglar (`> lastPingTick`) → `event: ping`
 *   4. Keep-alive — har 30s da `: ping\n\n` (SSE comment, eventName yo'q)
 *      Vercel proxy idle timeout'idan saqlanish uchun.
 *   5. Graceful close — `request.signal.aborted` poll iteration boshida
 *      tekshiriladi; abort bo'lsa stream darhol yopiladi.
 *
 * **Vercel Hobby 90s limit (R07):** Edge functions max 90s. Client
 * `useOrderStream` (T6.03) `error` event'da exponential backoff bilan
 * avto-reconnect qiladi — uzilish foydalanuvchiga sezilmaydi.
 *
 * **Cost mitigation (R08):** poll interval 5s — D2 adaptive interval
 * client-side GPS uchun, lekin SSE poll qattiq 5s. Bu Neon read query
 * ko'pligini cheklaydi: 1 active stream × 720 query/soat ≈ Neon free
 * tier read budgetida (15K queries/sutka). 100 stream = 72K — Pro tier
 * trigger (S08+ scaling).
 *
 * SSE payload format (named events):
 *
 *   event: order
 *   data: { id, status, updated_at, ... }
 *
 *   event: status
 *   data: { id, order_id, status, actor_id, metadata, created_at }
 *
 *   event: ping
 *   data: { id, order_id, lat, lng, accuracy, recorded_at }
 *
 *   : ping
 *   (keep-alive comment)
 */
import { and, asc, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { orderStatusHistory } from '@/lib/db/schema/order-status-history';
import { orders } from '@/lib/db/schema/orders';
import { trackingPings } from '@/lib/db/schema/tracking-pings';

export const runtime = 'edge';

// ─── Tunables ────────────────────────────────────────────────────────────────

/** DB poll davri — har shu vaqtda yangilanishlar tekshiriladi. */
const POLL_INTERVAL_MS = 5_000;

/** Keep-alive comment — Vercel proxy idle timeout'iga qarshi. */
const KEEPALIVE_INTERVAL_MS = 30_000;

// ─── SSE encoder ─────────────────────────────────────────────────────────────

const ENCODER = new TextEncoder();

function sseEvent(eventName: string, data: unknown): Uint8Array {
  return ENCODER.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
}

function sseComment(text: string): Uint8Array {
  return ENCODER.encode(`: ${text}\n\n`);
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: orderId } = await context.params;

  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Order ownership check (kim ko'rishga ruxsat — clientId yoki proId)
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.clientId !== userId && order.proId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. SSE stream
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // Stream allaqachon yopilgan — ignore.
        }
      };

      // Client uzilish — abort signal'ni eshitamiz.
      request.signal.addEventListener('abort', close);

      // 3a. Initial flush — joriy holat
      try {
        controller.enqueue(sseEvent('order', order));

        const history = await db
          .select()
          .from(orderStatusHistory)
          .where(eq(orderStatusHistory.orderId, orderId))
          .orderBy(asc(orderStatusHistory.createdAt));
        for (const entry of history) {
          controller.enqueue(sseEvent('status', entry));
        }

        const [latestPing] = await db
          .select()
          .from(trackingPings)
          .where(eq(trackingPings.orderId, orderId))
          .orderBy(asc(trackingPings.recordedAt))
          .limit(1);
        if (latestPing) {
          controller.enqueue(sseEvent('ping', latestPing));
        }
      } catch (err) {
        controller.enqueue(
          sseEvent('error', { message: 'initial fetch failed', detail: String(err) }),
        );
        close();
        return;
      }

      // 3b. Cursor'lar — keyingi poll'da faqat yangilanishlar
      let lastOrderTick = order.updatedAt;
      let lastHistoryTick = order.createdAt;
      let lastPingTick = order.createdAt;

      // 3c. Keep-alive timer
      const keepAlive = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(sseComment('ping'));
        } catch {
          close();
        }
      }, KEEPALIVE_INTERVAL_MS);

      // 3d. Poll loop
      const pollTimer = setInterval(async () => {
        if (closed || request.signal.aborted) {
          clearInterval(pollTimer);
          clearInterval(keepAlive);
          close();
          return;
        }

        try {
          // Order changes
          const [fresh] = await db
            .select()
            .from(orders)
            .where(and(eq(orders.id, orderId), gt(orders.updatedAt, lastOrderTick)))
            .limit(1);
          if (fresh) {
            controller.enqueue(sseEvent('order', fresh));
            lastOrderTick = fresh.updatedAt;
          }

          // Status history (new entries)
          const newStatuses = await db
            .select()
            .from(orderStatusHistory)
            .where(
              and(
                eq(orderStatusHistory.orderId, orderId),
                gt(orderStatusHistory.createdAt, lastHistoryTick),
              ),
            )
            .orderBy(asc(orderStatusHistory.createdAt));
          for (const entry of newStatuses) {
            controller.enqueue(sseEvent('status', entry));
            lastHistoryTick = entry.createdAt;
          }

          // Tracking pings (new)
          const newPings = await db
            .select()
            .from(trackingPings)
            .where(
              and(eq(trackingPings.orderId, orderId), gt(trackingPings.recordedAt, lastPingTick)),
            )
            .orderBy(asc(trackingPings.recordedAt));
          for (const ping of newPings) {
            controller.enqueue(sseEvent('ping', ping));
            lastPingTick = ping.recordedAt;
          }
        } catch (err) {
          // Tranzient xato — stream'ni tushirmaymiz, faqat error event jo'natamiz.
          // Client `useOrderStream` `error` da reconnect qiladi.
          controller.enqueue(sseEvent('error', { message: 'poll failed', detail: String(err) }));
        }
      }, POLL_INTERVAL_MS);

      // Note: ReadableStream `cancel` callback kerak emas — abort signal
      // listener close() ni chaqiradi va `closed` flag tufayli interval'lar
      // keyingi tick'da to'xtaydi.
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // CORS — frontend bir xil origin'dan keladi, lekin development'da
      // 3000 vs 6006 (Storybook) farq qilishi mumkin.
      'X-Accel-Buffering': 'no',
    },
  });
}
