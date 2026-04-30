/**
 * OrderTimeline i18n messages (S06 T6.06).
 *
 * Loyiha hali `next-intl` bilan boshlanmagan — bu typed dict shu yerda
 * co-locate qilinadi va kelajakda `messages/uz.json` ga ko'chiriladi.
 * Kalit shakli `order.timeline.<status>` — next-intl JSON tartibiga mos.
 */
import type { OrderStatus } from '@/lib/db/schema/orders';
import type { SupportedLocale } from '@/lib/format/duration';

export interface TimelineMessages {
  /** Status uchun ko'rinadigan label. */
  statuses: Record<OrderStatus, string>;
  /** "Bekor qilingan" terminator badge matni. */
  cancelledBadge: string;
  /** History bo'sh bo'lganda placeholder (yangi order, hali transition yo'q). */
  emptyHistory: string;
  /** "12 daqiqa oldin" pattern uchun suffix. */
  agoSuffix: string;
}

export const MESSAGES: Record<SupportedLocale, TimelineMessages> = {
  uz: {
    statuses: {
      pending: 'Kutilmoqda',
      accepted: 'Qabul qilindi',
      en_route: "Yo'lda",
      arrived: 'Yetib keldi',
      in_progress: 'Ish jarayonida',
      completed: 'Tugatildi',
      cancelled: 'Bekor qilindi',
    },
    cancelledBadge: 'Bekor qilindi',
    emptyHistory: 'Tarix hali yo`q',
    agoSuffix: 'oldin',
  },
  ru: {
    statuses: {
      pending: 'Ожидает',
      accepted: 'Принят',
      en_route: 'В пути',
      arrived: 'Прибыл',
      in_progress: 'В работе',
      completed: 'Завершён',
      cancelled: 'Отменён',
    },
    cancelledBadge: 'Отменён',
    emptyHistory: 'Истории пока нет',
    agoSuffix: 'назад',
  },
  en: {
    statuses: {
      pending: 'Pending',
      accepted: 'Accepted',
      en_route: 'En route',
      arrived: 'Arrived',
      in_progress: 'In progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    cancelledBadge: 'Cancelled',
    emptyHistory: 'No history yet',
    agoSuffix: 'ago',
  },
};

/**
 * Timeline'da ko'rinadigan tartib. `cancelled` bu massivda yo'q —
 * cancelled order'lar alohida terminator UI'ga ega.
 */
export const TIMELINE_ORDER: ReadonlyArray<Exclude<OrderStatus, 'cancelled'>> = [
  'pending',
  'accepted',
  'en_route',
  'arrived',
  'in_progress',
  'completed',
];
