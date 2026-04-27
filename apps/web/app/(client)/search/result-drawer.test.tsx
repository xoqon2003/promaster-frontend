/**
 * T3.17 — ResultDrawer unit tests.
 *
 * Qamrov:
 *  - masterId yo'q bo'lsa drawer yopiq
 *  - masterId bor bo'lsa drawer ochiq, usta nomi ko'rinadi
 *  - Loading state: skeleton
 *  - "To'liq profil" linki /client/masters/[id] ga
 *  - "Yopish" tugmasi masterId ni null qiladi (URL clear)
 *  - portfolio va reviews section render qilinadi
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Master } from '@/lib/masters/schemas';

import { ResultDrawer } from './result-drawer';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUseMaster = vi.fn();
vi.mock('@/lib/hooks/use-master', () => ({
  useMaster: (id: string | undefined) => mockUseMaster(id),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SAMPLE_MASTER: Master = {
  id: 'm42',
  name: 'Bobur Toshmatov',
  rating: 4.8,
  reviewCount: 124,
  trustLevel: 'verified',
  categoryId: 'elektrik',
  categoryName: 'Elektrik',
  priceFrom: 50_000,
  currency: 'UZS',
  isOnline: true,
  responseTime: '~15 daqiqa',
  location: { lat: 41.31, lng: 69.28, address: 'Toshkent' },
};

beforeEach(() => {
  mockUseMaster.mockReset();
  mockUseMaster.mockReturnValue({ data: null, isPending: false });
});

// ─── Drawer open/close ───────────────────────────────────────────────────────

describe('ResultDrawer — open/close', () => {
  it("masterId yo'q bo'lsa drawer yopiq (dialog ko'rinmaydi)", () => {
    render(<ResultDrawer />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it("masterId bor bo'lsa drawer ochiq", () => {
    mockUseMaster.mockReturnValue({ data: SAMPLE_MASTER, isPending: false });

    render(<ResultDrawer />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?masterId=m42' }),
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('"Yopish" tugmasi bosilganda URL temizlanadi va dialog yopiladi', async () => {
    mockUseMaster.mockReturnValue({ data: SAMPLE_MASTER, isPending: false });
    const user = userEvent.setup();

    render(<ResultDrawer />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?masterId=m42' }),
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Yopish/ }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

// ─── Loading state ───────────────────────────────────────────────────────────

describe('ResultDrawer — loading', () => {
  it("isPending — skeleton ko'rinadi, usta nomi yo'q", () => {
    mockUseMaster.mockReturnValue({ data: null, isPending: true });

    render(<ResultDrawer />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?masterId=m42' }),
    });

    // SheetContent portal orqali document.body ga mount bo'ladi
    expect(document.querySelector('[data-slot="result-drawer-skeleton"]')).toBeInTheDocument();
    expect(screen.queryByTestId('drawer-master-name')).toBeNull();
  });
});

// ─── Content ──────────────────────────────────────────────────────────────────

describe('ResultDrawer — content', () => {
  beforeEach(() => {
    mockUseMaster.mockReturnValue({ data: SAMPLE_MASTER, isPending: false });
  });

  it("usta nomi ko'rinadi", () => {
    render(<ResultDrawer />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?masterId=m42' }),
    });

    expect(screen.getByTestId('drawer-master-name')).toHaveTextContent('Bobur Toshmatov');
  });

  it("3 ta portfolio placeholder ko'rinadi", () => {
    render(<ResultDrawer />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?masterId=m42' }),
    });

    const portfolio = screen.getByTestId('drawer-portfolio');
    expect(portfolio.children).toHaveLength(3);
  });

  it("3 ta review ko'rinadi", () => {
    render(<ResultDrawer />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?masterId=m42' }),
    });

    const reviews = screen.getByTestId('drawer-reviews');
    expect(reviews.querySelectorAll('li')).toHaveLength(3);
  });

  it("\"To'liq profil\" linki to'g'ri URL ga ishora qiladi", () => {
    render(<ResultDrawer />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?masterId=m42' }),
    });

    const link = screen.getByTestId('drawer-full-profile-btn');
    expect(link).toHaveAttribute('href', '/client/masters/m42');
  });
});
