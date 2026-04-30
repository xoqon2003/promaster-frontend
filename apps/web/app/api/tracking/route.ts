/**
 * `POST /api/tracking` — usta GPS ping endpoint (S06 T6.05).
 *
 * `useGeoTracking` (T6.04) hook ushbu endpoint'ga adaptive interval
 * (30s/15s) bilan ping yuboradi. Body Zod orqali validatsiya, auth orqali
 * faqat order'ning proId'si yozishga ruxsatiga ega, rate limit per-pro.
 *
 * **Auth:** session.user.id === order.proId (boshqa userlar 403).
 * **Rate limit:** 1 req/30s per pro (`TokenBucket`). 31-req 429 qaytaradi.
 * **Sentry:** 4xx/5xx avtomat capture (instrumentation.ts orqali, PII
 * scrubbed `sentry.edge.config.ts` BeforeSend hook'ida).
 */
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/orders';
import { trackingPings } from '@/lib/db/schema/tracking-pings';
import { TokenBucket } from '@/lib/ratelimit/token-bucket';

export const runtime = 'edge';

// ─── Rate limiter (singleton per Edge instance) ──────────────────────────────

const trackingLimiter = new TokenBucket({ capacity: 1, intervalMs: 30_000 });

// ─── Request schema ──────────────────────────────────────────────────────────

const TrackingRequestSchema = z.object({
  orderId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().max(10_000),
});

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
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

  const parsed = TrackingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 },
    );
  }
  const { orderId, lat, lng, accuracy } = parsed.data;

  // 3. Order ownership check — usta order'ning proId'si bo'lishi shart
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.proId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Rate limit (per pro)
  const rateLimit = trackingLimiter.consume(`tracking:${userId}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)) },
      },
    );
  }

  // 5. Insert ping
  await db.insert(trackingPings).values({
    orderId,
    proId: userId,
    lat: lat.toString(),
    lng: lng.toString(),
    accuracy: accuracy.toString(),
    recordedAt: new Date(),
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
