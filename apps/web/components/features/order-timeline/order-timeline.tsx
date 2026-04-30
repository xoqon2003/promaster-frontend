/**
 * `<OrderTimeline />` — order lifecycle timeline (S06 T6.06).
 *
 * Vertikal 6-bosqichli timeline (pending → completed). `cancelled` —
 * terminator banner timeline ostida, qaysi bosqichdan kirgani ko'rinadi.
 *
 * **Holatlar:**
 *   - O'tgan step: yashil ✓ + `data-state="done"`
 *   - Joriy step: brand ranglarda + `aria-current="step"` + pulse animatsiya
 *     (`prefers-reduced-motion` da o'chadi)
 *   - Kelajak step: kulrang dot + `data-state="upcoming"`
 *   - Cancelled order: barcha step'lar disabled + qizil banner
 *
 * **A11y:**
 *   - `role="list"` + `role="listitem"` har step
 *   - `aria-current="step"` joriy step uchun
 *   - Step nomi visible text (decorative icon `aria-hidden`)
 *
 * **i18n:** `messages.ts` co-located dict (uz/ru/en). next-intl
 * bootstrap qilingach JSON ga ko'chiriladi.
 *
 * @example
 *   <OrderTimeline
 *     currentStatus={order.status}
 *     history={statusHistory}
 *     locale="uz"
 *   />
 */
'use client';

import { CheckCircle2, Circle, Loader2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { OrderStatusHistoryEntry } from '@/lib/db/schema/order-status-history';
import type { OrderStatus } from '@/lib/db/schema/orders';
import { formatRelativeFromNow, type SupportedLocale } from '@/lib/format/duration';

import { MESSAGES, TIMELINE_ORDER } from './messages';

export interface OrderTimelineProps {
  currentStatus: OrderStatus;
  /** Sorted ascending by createdAt (T6.03 SSE shu tartibda yetkazadi). */
  history: OrderStatusHistoryEntry[];
  locale?: SupportedLocale;
  /**
   * Test/Storybook'da `formatRelativeFromNow` deterministik bo'lishi uchun.
   * Production'da default = `new Date()`.
   */
  now?: Date;
}

export function OrderTimeline({ currentStatus, history, locale = 'uz', now }: OrderTimelineProps) {
  const m = MESSAGES[locale];
  const isCancelled = currentStatus === 'cancelled';

  // History'dan har status uchun yetib kelgan vaqtni topamiz (mapping).
  const reachedAt = new Map<OrderStatus, Date>();
  for (const entry of history) {
    reachedAt.set(entry.status, new Date(entry.createdAt));
  }

  const currentIdx = isCancelled
    ? -1 // cancelled bo'lsa "joriy step" yo'q
    : TIMELINE_ORDER.indexOf(currentStatus as Exclude<OrderStatus, 'cancelled'>);

  return (
    <section aria-label="Order timeline" className="border-border bg-card rounded-2xl border p-5">
      <ol role="list" className="relative space-y-6">
        {TIMELINE_ORDER.map((status, idx) => {
          const reached = reachedAt.get(status);
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;

          const state: 'done' | 'current' | 'upcoming' | 'cancelled' = isCancelled
            ? 'cancelled'
            : isPast
              ? 'done'
              : isCurrent
                ? 'current'
                : 'upcoming';

          return (
            <li
              key={status}
              role="listitem"
              data-state={state}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex items-start gap-3"
            >
              {/* Connector chizig'i — oxirgisidan tashqari */}
              {idx < TIMELINE_ORDER.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-6 left-3 h-full w-px',
                    isPast && !isCancelled ? 'bg-emerald-500' : 'bg-border',
                  )}
                />
              )}

              {/* Step icon */}
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  state === 'done' && 'bg-emerald-500 text-white',
                  state === 'current' &&
                    'bg-primary text-primary-foreground motion-safe:animate-pulse',
                  state === 'upcoming' && 'border-border bg-background border',
                  state === 'cancelled' && 'bg-muted text-muted-foreground',
                )}
              >
                {state === 'done' && <CheckCircle2 className="h-4 w-4" />}
                {state === 'current' && (
                  <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" />
                )}
                {state === 'upcoming' && <Circle className="h-3 w-3 fill-current opacity-30" />}
                {state === 'cancelled' && <Circle className="h-3 w-3 opacity-40" />}
              </span>

              {/* Step text */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    state === 'current' && 'text-foreground',
                    state === 'done' && 'text-foreground',
                    state === 'upcoming' && 'text-muted-foreground',
                    state === 'cancelled' && 'text-muted-foreground line-through',
                  )}
                >
                  {m.statuses[status]}
                </p>
                {reached && state !== 'upcoming' && state !== 'cancelled' && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    <time dateTime={reached.toISOString()}>
                      {reached.toISOString().slice(11, 16)}
                    </time>
                    <span className="mx-1">·</span>
                    {formatRelativeFromNow(reached, locale, now)} {m.agoSuffix}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {isCancelled && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm">
          <X className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-medium">{m.cancelledBadge}</span>
        </div>
      )}

      {history.length === 0 && !isCancelled && (
        <p className="text-muted-foreground mt-4 text-sm">{m.emptyHistory}</p>
      )}
    </section>
  );
}
