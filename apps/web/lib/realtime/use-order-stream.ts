/**
 * `useOrderStream(orderId)` — SSE client wrapper (S06 T6.03).
 *
 * EventSource'ni o'rab oluvchi React hook. Connection state machine,
 * exponential backoff bilan auto-reconnect, va alohida event handlers
 * (`order`, `status`, `ping`) bilan callback qiladi.
 *
 * **Connection state:**
 *
 *   connecting → connected → reconnecting → connected ...
 *                          └──→ reconnecting → ... → failed (max attempts)
 *                          └──→ closed (manual close yoki unmount)
 *
 * **Reconnect strategy (R07 — Vercel 90s timeout):** Exponential
 * backoff: 1s, 2s, 4s, 8s, 16s. Max 5 urinish, undan keyin `failed`
 * holatga o'tadi (manual retry kerak — yoki `error` boundary).
 *
 * **Event payload'lar** server-side `route.ts` jo'natadigan named
 * event'lar bilan mos:
 *   - `order` — `Order` (full row, `updatedAt` cursor uchun)
 *   - `status` — `OrderStatusHistoryEntry`
 *   - `ping` — `TrackingPing`
 *   - `error` — server tomonidagi xato (poll failed, h.k.)
 *
 * @example
 *   const { state, lastError } = useOrderStream(orderId, {
 *     onOrder: (o) => setOrder(o),
 *     onStatus: (s) => setHistory(prev => [...prev, s]),
 *     onPing: (p) => setProLocation({ lat: p.lat, lng: p.lng }),
 *   });
 */
'use client';

import { useEffect, useRef, useState } from 'react';

import type { OrderStatusHistoryEntry } from '@/lib/db/schema/order-status-history';
import type { Order } from '@/lib/db/schema/orders';
import type { TrackingPing } from '@/lib/db/schema/tracking-pings';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderStreamState = 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'closed';

export interface UseOrderStreamOptions {
  /** Yangi order snapshot keldi (yaratilganda + har `updatedAt` o'zgarganda). */
  onOrder?: (order: Order) => void;
  /** Yangi status_history entry — timeline'ga prepend qilish uchun. */
  onStatus?: (entry: OrderStatusHistoryEntry) => void;
  /** Yangi GPS ping — xaritada usta pin'i pozitsiyasini yangilash. */
  onPing?: (ping: TrackingPing) => void;
}

export interface UseOrderStreamResult {
  state: OrderStreamState;
  /** So'nggi xato — debug yoki error boundary uchun. */
  lastError: string | null;
  /** Stream'ni qo'lda yopish (cleanup unmount'da avtomat). */
  close: () => void;
}

// ─── Tunables ────────────────────────────────────────────────────────────────

const MAX_RECONNECT_ATTEMPTS = 5;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 16_000;

/** Exponential backoff — attempt 0..N, capped at BACKOFF_MAX_MS. */
function backoffDelayMs(attempt: number): number {
  return Math.min(BACKOFF_BASE_MS * 2 ** attempt, BACKOFF_MAX_MS);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOrderStream(
  orderId: string,
  options: UseOrderStreamOptions = {},
): UseOrderStreamResult {
  const [state, setState] = useState<OrderStreamState>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);

  // Latest options'larni ref'da saqlaymiz — handler'lar har render'da
  // o'zgarishi mumkin, lekin EventSource ni qayta yaratmaymiz.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Cleanup uchun reference'lar
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const closedByUserRef = useRef(false);

  useEffect(() => {
    closedByUserRef.current = false;

    function connect() {
      if (closedByUserRef.current) return;

      const source = new EventSource(`/api/orders/${orderId}/events`);
      sourceRef.current = source;

      source.addEventListener('open', () => {
        attemptRef.current = 0;
        setState('connected');
        setLastError(null);
      });

      source.addEventListener('order', (event) => {
        try {
          const order = JSON.parse((event as MessageEvent<string>).data) as Order;
          optionsRef.current.onOrder?.(order);
        } catch (err) {
          setLastError(`order parse failed: ${String(err)}`);
        }
      });

      source.addEventListener('status', (event) => {
        try {
          const entry = JSON.parse((event as MessageEvent<string>).data) as OrderStatusHistoryEntry;
          optionsRef.current.onStatus?.(entry);
        } catch (err) {
          setLastError(`status parse failed: ${String(err)}`);
        }
      });

      source.addEventListener('ping', (event) => {
        try {
          const ping = JSON.parse((event as MessageEvent<string>).data) as TrackingPing;
          optionsRef.current.onPing?.(ping);
        } catch (err) {
          setLastError(`ping parse failed: ${String(err)}`);
        }
      });

      source.addEventListener('error', () => {
        // EventSource browser native'i o'zi reconnect qilishga harakat
        // qiladi, lekin Vercel 90s timeout va boshqa transient xato'lar
        // bizning manual backoff'imizni talab qiladi (deterministik test'lar
        // uchun ham).
        source.close();
        sourceRef.current = null;

        if (closedByUserRef.current) return;

        const attempt = attemptRef.current;
        if (attempt >= MAX_RECONNECT_ATTEMPTS) {
          setState('failed');
          setLastError(`giving up after ${attempt} reconnect attempts`);
          return;
        }

        setState('reconnecting');
        const delay = backoffDelayMs(attempt);
        attemptRef.current = attempt + 1;

        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      });
    }

    connect();

    return () => {
      closedByUserRef.current = true;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (sourceRef.current !== null) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps — optionsRef stabil
  }, [orderId]);

  function close() {
    closedByUserRef.current = true;
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (sourceRef.current !== null) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    setState('closed');
  }

  return { state, lastError, close };
}
