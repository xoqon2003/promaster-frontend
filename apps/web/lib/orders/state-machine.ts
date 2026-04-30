/**
 * Order status state machine (S06 T6.02 — D6 qaror).
 *
 * Server-side authoritative — `POST /api/orders/[id]/status` (T6.05) faqat
 * `canTransition(currentStatus, newStatus)` `true` bo'lsa o'tishga ruxsat
 * beradi. Aks holda 422 Unprocessable Entity qaytaradi.
 *
 * Frontend ham shu helper'ni ishlatadi (action button enable/disable),
 * lekin **server qaror chiqaradi** — client-side faqat UX ko'rsatish.
 *
 * Lifecycle:
 *
 *   pending ──► accepted ──► en_route ──► arrived ──► in_progress ──► completed
 *      │           │            │            │              │
 *      └───────────┴────────────┴────────────┴──────────────┴──► cancelled
 *
 * Terminal holatlar: `completed`, `cancelled` — ulardan chiqish yo'q.
 *
 * Self-transition (`en_route → en_route`) ruxsat etilmaydi: bu duplicate
 * status_history yozuv yaratardi va frontend timeline'da chalkashlik bo'lardi.
 */
import type { OrderStatus } from '@/lib/db/schema/orders';

/**
 * Joriy holat → ruxsat etilgan keyingi holatlar.
 *
 * Keyingi holat `cancelled` har bir non-terminal status'dan mumkin.
 * `completed` va `cancelled` — terminal (bo'sh massiv).
 */
const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['en_route', 'cancelled'],
  en_route: ['arrived', 'cancelled'],
  arrived: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * Ushbu holatdan boshqasiga o'tish ruxsat etilganmi?
 *
 * @example
 *   canTransition('pending', 'accepted')   // true
 *   canTransition('pending', 'en_route')   // false (skip)
 *   canTransition('completed', 'cancelled') // false (terminal)
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/**
 * Joriy holatdan barcha mumkin bo'lgan keyingi holatlar.
 *
 * Frontend (T6.06 timeline, T6.09 order detail page) ushbu funksiyani
 * action button'larni render qilish uchun ishlatadi.
 */
export function nextStatuses(from: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[from];
}

/** Status terminal (cho'zilmaydi) holatda mi? */
export function isTerminal(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}
