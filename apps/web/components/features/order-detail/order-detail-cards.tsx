/**
 * Order detail cards (S06 T6.09) — Address, Price, Scheduled.
 *
 * Kichik prezentatsion komponent'lar — order detail page kompozitsiyasi
 * uchun. State'siz, faqat props.
 */
'use client';

import { Calendar, MapPin, Wallet } from 'lucide-react';

import type { Order } from '@/lib/db/schema/orders';
import type { SupportedLocale } from '@/lib/format/duration';

import { MESSAGES, formatPriceMinor } from './messages';

interface CardProps {
  order: Order;
  locale: SupportedLocale;
}

export function AddressCard({ order, locale }: CardProps) {
  const m = MESSAGES[locale].addressCard;
  return (
    <div className="border-border bg-card rounded-2xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-muted-foreground text-xs tracking-wide uppercase">{m.title}</h3>
          <p className="text-foreground mt-1 text-sm">{order.addressText}</p>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {Number(order.addressLat).toFixed(4)}, {Number(order.addressLng).toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PriceCard({ order, locale }: CardProps) {
  const m = MESSAGES[locale].priceCard;
  return (
    <div className="border-border bg-card rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <span className="bg-muted text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Wallet className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-muted-foreground text-xs tracking-wide uppercase">{m.title}</h3>
          <p className="text-foreground mt-1 text-base font-semibold">
            {formatPriceMinor(order.priceMinor, m.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ScheduledCard({ order, locale }: CardProps) {
  const m = MESSAGES[locale].scheduledCard;
  const display = order.scheduledAt
    ? new Date(order.scheduledAt).toLocaleString(
        locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US',
        { dateStyle: 'medium', timeStyle: 'short' },
      )
    : m.immediate;

  return (
    <div className="border-border bg-card rounded-2xl border p-4">
      <div className="flex items-center gap-3">
        <span className="bg-muted text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <Calendar className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-muted-foreground text-xs tracking-wide uppercase">{m.title}</h3>
          <p className="text-foreground mt-1 text-sm">{display}</p>
        </div>
      </div>
    </div>
  );
}
