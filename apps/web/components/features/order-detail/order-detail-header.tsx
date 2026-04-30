/**
 * Order detail header (S06 T6.09).
 *
 * Order title + status badge + pro card stub. Pro details (photo, rating)
 * S08 (portfolio) sprintda real ma'lumot bilan to'ldiriladi — hozir
 * `proName` placeholder.
 */
'use client';

import { ChevronLeft, Star, UserRound } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { Order } from '@/lib/db/schema/orders';
import type { SupportedLocale } from '@/lib/format/duration';

import { MESSAGES } from './messages';

interface HeaderProps {
  order: Order;
  /** S08 da real `User` keladi — hozir id bilan placeholder. */
  proName?: string;
  proRating?: number;
  locale: SupportedLocale;
}

const STATUS_BADGE_CLASS: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-blue-100 text-blue-800',
  en_route: 'bg-indigo-100 text-indigo-800',
  arrived: 'bg-violet-100 text-violet-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

export function OrderDetailHeader({ order, proName, proRating, locale }: HeaderProps) {
  const m = MESSAGES[locale];

  return (
    <header className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="border-border hover:bg-muted text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border"
          aria-label={m.back}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {order.serviceCategory}
          </p>
          <h1 className="text-foreground font-display truncate text-lg font-semibold">
            #{order.id.slice(0, 8)}
          </h1>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium',
            STATUS_BADGE_CLASS[order.status],
          )}
        >
          {m.statusBadge[order.status]}
        </span>
      </div>

      {/* Pro card */}
      <div className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3">
        <span className="bg-muted text-muted-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <UserRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {m.proCard.proLabel}
          </p>
          <p className="text-foreground truncate text-sm font-medium">
            {proName ?? m.proCard.defaultName}
          </p>
        </div>
        {typeof proRating === 'number' ? (
          <span className="text-foreground inline-flex items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden="true" />
            {proRating.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">{m.proCard.ratingPlaceholder}</span>
        )}
      </div>
    </header>
  );
}
