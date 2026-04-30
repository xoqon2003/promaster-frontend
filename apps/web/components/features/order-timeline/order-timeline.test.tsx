/**
 * OrderTimeline — Vitest unit tests (S06 T6.06).
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { OrderStatusHistoryEntry } from '@/lib/db/schema/order-status-history';

import { OrderTimeline } from './order-timeline';

const NOW = new Date('2026-05-09T12:00:00Z');

function makeHistoryEntry(
  status: OrderStatusHistoryEntry['status'],
  isoTime: string,
): OrderStatusHistoryEntry {
  return {
    id: `h-${status}`,
    orderId: 'order-1',
    status,
    actorId: 'user-1',
    metadata: {},
    createdAt: new Date(isoTime),
  };
}

const FULL_HISTORY: OrderStatusHistoryEntry[] = [
  makeHistoryEntry('pending', '2026-05-09T11:00:00Z'),
  makeHistoryEntry('accepted', '2026-05-09T11:05:00Z'),
  makeHistoryEntry('en_route', '2026-05-09T11:20:00Z'),
];

describe('OrderTimeline — rendering', () => {
  it("6 ta step ko'rsatadi (pending..completed)", () => {
    render(<OrderTimeline currentStatus="pending" history={[]} now={NOW} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });

  it("statuslarni o'zbek tilida render qiladi (default locale)", () => {
    render(<OrderTimeline currentStatus="en_route" history={FULL_HISTORY} now={NOW} />);
    expect(screen.getByText('Kutilmoqda')).toBeInTheDocument();
    expect(screen.getByText('Qabul qilindi')).toBeInTheDocument();
    expect(screen.getByText("Yo'lda")).toBeInTheDocument();
  });

  it("RU locale — kalit'lar Russian", () => {
    render(<OrderTimeline currentStatus="en_route" history={FULL_HISTORY} locale="ru" now={NOW} />);
    expect(screen.getByText('Ожидает')).toBeInTheDocument();
    expect(screen.getByText('В пути')).toBeInTheDocument();
  });

  it('EN locale — keys English', () => {
    render(<OrderTimeline currentStatus="en_route" history={FULL_HISTORY} locale="en" now={NOW} />);
    expect(screen.getByText('En route')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});

describe('OrderTimeline — ARIA + state', () => {
  it("joriy step uchun aria-current='step' qo'yiladi", () => {
    render(<OrderTimeline currentStatus="en_route" history={FULL_HISTORY} now={NOW} />);
    const items = screen.getAllByRole('listitem');
    const currentItem = items.find((el) => el.getAttribute('aria-current') === 'step');
    expect(currentItem).toBeDefined();
    expect(currentItem?.textContent).toContain("Yo'lda");
  });

  it("o'tgan step'lar data-state='done', kelajak 'upcoming'", () => {
    render(<OrderTimeline currentStatus="en_route" history={FULL_HISTORY} now={NOW} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]?.getAttribute('data-state')).toBe('done'); // pending
    expect(items[1]?.getAttribute('data-state')).toBe('done'); // accepted
    expect(items[2]?.getAttribute('data-state')).toBe('current'); // en_route
    expect(items[3]?.getAttribute('data-state')).toBe('upcoming'); // arrived
    expect(items[5]?.getAttribute('data-state')).toBe('upcoming'); // completed
  });

  it("cancelled order — barcha step'lar 'cancelled' state'da + banner", () => {
    render(<OrderTimeline currentStatus="cancelled" history={FULL_HISTORY} now={NOW} />);
    const items = screen.getAllByRole('listitem');
    items.forEach((item) => {
      expect(item.getAttribute('data-state')).toBe('cancelled');
    });
    expect(screen.getByText('Bekor qilindi')).toBeInTheDocument();
  });
});

describe('OrderTimeline — time formatting', () => {
  it("history bor step'larda relative duration ko'rsatadi", () => {
    render(<OrderTimeline currentStatus="en_route" history={FULL_HISTORY} now={NOW} />);
    // pending — 11:00, hozir 12:00 → 1 soat oldin
    expect(screen.getByText(/1 soat/)).toBeInTheDocument();
    // accepted — 11:05, hozir 12:00 → 55 daqiqa
    expect(screen.getByText(/55 daqiqa/)).toBeInTheDocument();
  });

  it("history bo'sh va non-cancelled — 'Tarix hali yo`q' message", () => {
    render(<OrderTimeline currentStatus="pending" history={[]} now={NOW} />);
    expect(screen.getByText(/Tarix hali yo/)).toBeInTheDocument();
  });
});
