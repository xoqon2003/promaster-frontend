/**
 * T4.07 — `Step4Price` unit tests.
 *
 * Qamrov:
 *  - Loading state (master fetch davom etayotganda)
 *  - Error state (masterId yo'q yoki master topilmadi)
 *  - Success: range to'g'ri hisoblanadi
 *  - Disclaimer ko'rinadi
 *  - Cancel tugma — resetDraft + router.push('/search')
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Step4Price } from './step-4-price';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
}));

const mockResetDraft = vi.fn();
const mockUseBookingDraft = vi.fn();
vi.mock('@/lib/hooks/use-booking-draft', () => ({
  useBookingDraft: () => mockUseBookingDraft(),
}));

const mockUseMaster = vi.fn();
vi.mock('@/lib/hooks/use-master', () => ({
  useMaster: (id: string | undefined) => mockUseMaster(id),
}));

// ─── Setup ───────────────────────────────────────────────────────────────────

const VALID_MASTER = {
  id: 'm_1',
  name: 'Bobur Toshmatov',
  rating: 4.8,
  reviewCount: 100,
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
  mockPush.mockReset();
  mockResetDraft.mockReset();
  mockUseBookingDraft.mockReset();
  mockUseMaster.mockReset();

  mockUseBookingDraft.mockReturnValue({
    draft: {
      masterId: 'm_1',
      service: { categoryId: 'elektrik', subServiceId: 'rozetka', description: '' },
    },
    setDraft: vi.fn(),
    resetDraft: mockResetDraft,
    storageMode: 'url',
  });

  mockUseMaster.mockReturnValue({
    data: VALID_MASTER,
    isPending: false,
    isError: false,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Loading ─────────────────────────────────────────────────────────────────

describe('Step4Price — loading', () => {
  it("master fetch davom etayotganda — skeleton ko'rinadi", () => {
    mockUseMaster.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    render(<Step4Price />);
    expect(screen.getByTestId('step-4-price-loading')).toBeInTheDocument();
  });
});

// ─── Error ───────────────────────────────────────────────────────────────────

describe('Step4Price — error', () => {
  it("masterId yo'q — error state", () => {
    mockUseBookingDraft.mockReturnValue({
      draft: { service: { categoryId: 'elektrik', subServiceId: 'x', description: '' } },
      setDraft: vi.fn(),
      resetDraft: mockResetDraft,
      storageMode: 'url',
    });
    mockUseMaster.mockReturnValue({ data: undefined, isPending: false, isError: false });

    render(<Step4Price />);
    expect(screen.getByTestId('step-4-price-error')).toBeInTheDocument();
    expect(screen.getByTestId('step-4-back-to-search')).toBeInTheDocument();
  });

  it('master topilmadi — error state', () => {
    mockUseMaster.mockReturnValue({ data: null, isPending: false, isError: false });

    render(<Step4Price />);
    expect(screen.getByTestId('step-4-price-error')).toBeInTheDocument();
  });

  it("'Qidiruvga qaytish' bossa /search'ga router.push", async () => {
    mockUseMaster.mockReturnValue({ data: null, isPending: false, isError: false });
    const user = userEvent.setup();

    render(<Step4Price />);
    await user.click(screen.getByTestId('step-4-back-to-search'));

    expect(mockPush).toHaveBeenCalledWith('/search');
  });
});

// ─── Success ─────────────────────────────────────────────────────────────────

describe('Step4Price — success', () => {
  it("usta nomi va range ko'rinadi", () => {
    render(<Step4Price />);

    expect(screen.getByTestId('master-name')).toHaveTextContent('Bobur Toshmatov');
    expect(screen.getByTestId('price-range')).toBeInTheDocument();
  });

  it("range hisoblash to'g'ri (elektrik 50K → 50K-225K)", () => {
    render(<Step4Price />);
    const range = screen.getByTestId('price-range');
    // 50_000 — 225_000 (elektrik 1-3h × 1.5)
    expect(range).toHaveTextContent(/50\s?000/);
    expect(range).toHaveTextContent(/225\s?000/);
  });

  it("disclaimer matn ko'rinadi", () => {
    render(<Step4Price />);
    expect(screen.getByTestId('price-disclaimer')).toHaveTextContent(/muloqot keyin/i);
  });
});

// ─── Cancel ──────────────────────────────────────────────────────────────────

describe('Step4Price — cancel', () => {
  it("'Bekor qilish' bossa resetDraft + /search redirect", async () => {
    const user = userEvent.setup();
    render(<Step4Price />);

    await user.click(screen.getByTestId('step-4-cancel-btn'));

    expect(mockResetDraft).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/search');
  });
});
