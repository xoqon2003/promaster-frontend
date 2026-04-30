/**
 * `<OrderDetailClient />` — order detail orchestrator (S06 T6.09).
 *
 * Server Component (`page.tsx`) ushbu komponentga initial DB snapshot
 * uzatadi. Keyin shu yerda `useOrderStream` (T6.03) SSE'ga ulanadi va
 * incremental yangilanishlarni state'ga qo'llaydi.
 *
 * **Status-conditional render:**
 *   - `en_route`: LiveTrackingMap (T6.07) ko'rinadi, GPS ping'lar oqadi
 *   - `arrived`/`in_progress`/`completed`: xarita yashiriladi (parent
 *     decision — usta yetib keldi, tracking shart emas)
 *   - `pending`/`accepted`: faqat timeline + cards
 *   - `cancelled`: faqat timeline (cancelled banner ichida)
 *
 * **CTA:** Cancel tugmasi `pending` yoki `accepted` da. Boshqa holatlarda
 * Chat placeholder (S07'da real implementation).
 */
'use client';

import { useState } from 'react';

import type { Order } from '@/lib/db/schema/orders';
import type { OrderStatusHistoryEntry } from '@/lib/db/schema/order-status-history';
import type { TrackingPing } from '@/lib/db/schema/tracking-pings';
import type { SupportedLocale } from '@/lib/format/duration';
import { useOrderStream } from '@/lib/realtime/use-order-stream';

import { LiveTrackingMap } from '@/components/features/live-tracking-map/live-tracking-map';
import { OrderTimeline } from '@/components/features/order-timeline/order-timeline';

import { AddressCard, PriceCard, ScheduledCard } from './order-detail-cards';
import { OrderDetailCta } from './order-detail-cta';
import { OrderDetailHeader } from './order-detail-header';

export interface OrderDetailClientProps {
  initialOrder: Order;
  initialHistory: OrderStatusHistoryEntry[];
  initialLatestPing: TrackingPing | null;
  /** S08 (portfolio) da real keladi — hozir RSC'dan name forwardlash kifoya. */
  proName?: string;
  proRating?: number;
  locale?: SupportedLocale;
}

export function OrderDetailClient({
  initialOrder,
  initialHistory,
  initialLatestPing,
  proName,
  proRating,
  locale = 'uz',
}: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [history, setHistory] = useState<OrderStatusHistoryEntry[]>(initialHistory);
  const [latestPing, setLatestPing] = useState<TrackingPing | null>(initialLatestPing);

  // SSE — server-side yangilanishlar
  useOrderStream(order.id, {
    onOrder: (next) => setOrder(next),
    onStatus: (entry) =>
      setHistory((prev) => {
        // Duplicate guard — server ba'zan re-emit qilishi mumkin
        if (prev.some((e) => e.id === entry.id)) return prev;
        return [...prev, entry];
      }),
    onPing: (ping) => setLatestPing(ping),
  });

  async function handleCancel(reason?: string): Promise<void> {
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'cancelled',
        etag: new Date(order.updatedAt).toISOString(),
        metadata: reason ? { reason } : {},
      }),
    });
    if (!res.ok) {
      throw new Error(`Cancel failed: ${res.status}`);
    }
    // SSE bizni darhol yangilaydi — qo'lda setOrder qilmaymiz, race avoid.
  }

  const showMap = order.status === 'en_route';

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <OrderDetailHeader order={order} proName={proName} proRating={proRating} locale={locale} />

      <OrderTimeline currentStatus={order.status} history={history} locale={locale} />

      {showMap && (
        <LiveTrackingMap
          client={{ lat: Number(order.addressLat), lng: Number(order.addressLng) }}
          pro={latestPing ? { lat: Number(latestPing.lat), lng: Number(latestPing.lng) } : null}
          lastPingAt={latestPing ? new Date(latestPing.recordedAt) : null}
          locale={locale}
        />
      )}

      <AddressCard order={order} locale={locale} />
      <PriceCard order={order} locale={locale} />
      <ScheduledCard order={order} locale={locale} />

      <OrderDetailCta order={order} locale={locale} onCancel={handleCancel} />
    </div>
  );
}
