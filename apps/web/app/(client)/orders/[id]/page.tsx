/**
 * `/orders/[id]` — order detail Server Component (S06 T6.09).
 *
 * RSC qatlam: auth check + initial DB fetch (order, history, latestPing)
 * parallel. Hydratsiya uchun barcha ma'lumotlar `<OrderDetailClient />`
 * ga props sifatida uzatiladi — undan keyin SSE (T6.03) incremental
 * yangilanishlarni boshqaradi.
 *
 * **Auth/authz:**
 *   - Session yo'q → `/login?callbackUrl=/orders/[id]` redirect
 *   - Order topilmadi → 404 (`notFound()`)
 *   - User ne clientId, ne proId → 404 (existence leak'ni oldini olish)
 */
import { asc, desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';
import { OrderDetailClient } from '@/components/features/order-detail/order-detail-client';
import { db } from '@/lib/db';
import { orderStatusHistory } from '@/lib/db/schema/order-status-history';
import { orders } from '@/lib/db/schema/orders';
import { trackingPings } from '@/lib/db/schema/tracking-pings';

export const metadata: Metadata = {
  title: 'Buyurtma · UstaTop',
  // Order detail har 5s yangilanadi — search engine indexing kerak emas
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id: orderId } = await params;

  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/orders/${orderId}`);
  }
  const userId = session.user.id;

  // 2. Order fetch + history + latest ping (parallel)
  const [order, history, [latestPing]] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(asc(orderStatusHistory.createdAt)),
    db
      .select()
      .from(trackingPings)
      .where(eq(trackingPings.orderId, orderId))
      .orderBy(desc(trackingPings.recordedAt))
      .limit(1),
  ]);

  // 3. Existence + ownership — boshqa userlarga 404 (leak avoid)
  if (!order) notFound();
  if (order.clientId !== userId && order.proId !== userId) notFound();

  return (
    <OrderDetailClient
      initialOrder={order}
      initialHistory={history}
      initialLatestPing={latestPing ?? null}
    />
  );
}
