/**
 * `<LiveTrackingMap />` — Yandex Maps real-time tracking wrapper (S06 T6.07).
 *
 * Order detail page (T6.09) shu komponentni `status === 'en_route'` da
 * render qiladi. Inner Yandex SDK dynamic import — initial JS bundle'ga
 * ta'sir yo'q (R02).
 *
 * **Connection lost banner:** `lastPingAt` 5+ min eski bo'lsa, qizil
 * banner xarita yuqorisida ko'rinadi. Foydalanuvchi `onRetry` callback
 * orqali stream'ni qayta tiklashi mumkin (parent `useOrderStream`'ni
 * `close()` + qayta mount qilishi mumkin).
 *
 * **Loading skeleton:** Yandex SDK ~250KB, asinxron yuklash davomida
 * skeleton ko'rsatiladi.
 *
 * @example
 *   <LiveTrackingMap
 *     client={{ lat: order.addressLat, lng: order.addressLng }}
 *     pro={lastPing ? { lat: lastPing.lat, lng: lastPing.lng } : null}
 *     lastPingAt={lastPing?.recordedAt ?? null}
 *     onRetry={() => streamRef.current?.reconnect()}
 *   />
 */
'use client';

import dynamic from 'next/dynamic';
import { AlertTriangle } from 'lucide-react';

import { formatRelativeFromNow, type SupportedLocale } from '@/lib/format/duration';

import { MESSAGES } from './messages';

// Yandex SDK ~250KB — faqat tracking page'da yuklanadi (ssr: false majburiy
// chunki YMaps `window` ga tayanadi).
const LiveTrackingMapInner = dynamic(
  () => import('./live-tracking-map-inner').then((m) => m.LiveTrackingMapInner),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

// ─── Tunables ────────────────────────────────────────────────────────────────

const STALE_PING_THRESHOLD_MS = 5 * 60 * 1000;

// ─── Props ───────────────────────────────────────────────────────────────────

export interface LiveTrackingMapCoords {
  lat: number;
  lng: number;
}

export interface LiveTrackingMapProps {
  client: LiveTrackingMapCoords;
  pro: LiveTrackingMapCoords | null;
  /** SSE'dan kelgan so'nggi ping vaqti — null bo'lsa hali ping yo'q. */
  lastPingAt: Date | null;
  /** Connection lost banner'da retry tugmasi bossa chaqiriladi. */
  onRetry?: () => void;
  locale?: SupportedLocale;
  /** Test/Storybook deterministik now. */
  now?: Date;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LiveTrackingMap({
  client,
  pro,
  lastPingAt,
  onRetry,
  locale = 'uz',
  now = new Date(),
}: LiveTrackingMapProps) {
  const m = MESSAGES[locale];

  const isStale =
    pro !== null &&
    lastPingAt !== null &&
    now.getTime() - lastPingAt.getTime() > STALE_PING_THRESHOLD_MS;

  return (
    <div className="border-border bg-muted relative aspect-[4/3] w-full overflow-hidden rounded-2xl border">
      <LiveTrackingMapInner client={client} pro={pro} />

      {isStale && lastPingAt && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive absolute top-3 right-3 left-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm backdrop-blur-sm"
          data-testid="connection-lost-banner"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{m.connectionLost}</p>
            <p className="text-xs opacity-80">
              {formatRelativeFromNow(lastPingAt, locale, now)} {m.connectionLostHint}
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              {m.retry}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function MapSkeleton() {
  return (
    <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-sm">
      <span className="motion-safe:animate-pulse">Xarita yuklanmoqda...</span>
    </div>
  );
}
