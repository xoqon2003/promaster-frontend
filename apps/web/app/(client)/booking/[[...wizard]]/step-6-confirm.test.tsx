/**
 * T4.09 — `Step6Confirm` unit tests.
 *
 * Qamrov:
 *  - Empty draft — bo'sh bloklar "To'ldirilmagan"
 *  - Faqat service to'ldirilgan — boshqa bloklar empty
 *  - To'liq draft — submit tugma enabled, har blok to'ldirilgan
 *  - Tahrirlash bossa onEditStep chaqiriladi
 *  - Submit success — bookingApi.create + router.push('/orders/[id]')
 *  - Submit error — toast + retry
 *  - Helper formatters
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Step6Confirm, __test__ } from './step-6-confirm';
import { SLOT_LEAD_MINUTES } from '@/lib/booking/schemas';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
}));

const mockUseBookingDraft = vi.fn();
vi.mock('@/lib/hooks/use-booking-draft', () => ({
  useBookingDraft: () => mockUseBookingDraft(),
}));

const mockUseCurrentUser = vi.fn();
vi.mock('@/lib/hooks/use-current-user', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

const mockUseMaster = vi.fn();
vi.mock('@/lib/hooks/use-master', () => ({
  useMaster: (id: string | undefined) => mockUseMaster(id),
}));

const mockCreate = vi.fn();
vi.mock('@/lib/booking/api-client', () => ({
  bookingApi: {
    create: (
      ...args: Parameters<(typeof import('@/lib/booking/api-client'))['bookingApi']['create']>
    ) => mockCreate(...args),
    getById: vi.fn(),
    cancel: vi.fn(),
    listByClient: vi.fn(),
  },
}));

// ─── Setup ───────────────────────────────────────────────────────────────────

const FROZEN_NOW = new Date('2026-05-23T10:00:00+05:00');
const FUTURE_SLOT = new Date(
  FROZEN_NOW.getTime() + (SLOT_LEAD_MINUTES + 60) * 60 * 1000,
).toISOString();

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

const COMPLETE_DRAFT = {
  masterId: 'm_1',
  service: {
    categoryId: 'elektrik',
    subServiceId: 'rozetka-almashtirish',
    description: 'Devordagi rozetka',
  },
  addressSlot: {
    location: { lat: 41.31, lng: 69.28, address: 'Toshkent, Chilonzor 12' },
    slotAt: FUTURE_SLOT,
  },
  photos: [],
  contact: {
    fullName: 'Bobur Toshmatov',
    phone: '+998901234567',
  },
};

beforeEach(() => {
  mockPush.mockReset();
  mockUseBookingDraft.mockReset();
  mockUseCurrentUser.mockReset();
  mockUseMaster.mockReset();
  mockCreate.mockReset();

  mockUseCurrentUser.mockReturnValue({
    user: { id: 'u_42', name: 'Bobur', phone: '+998901234567', role: 'client' },
    isLoading: false,
    isAuthenticated: true,
    isClient: true,
    isPro: false,
    isAdmin: false,
  });
  mockUseMaster.mockReturnValue({
    data: VALID_MASTER,
    isPending: false,
    isError: false,
  });
  mockUseBookingDraft.mockReturnValue({
    draft: COMPLETE_DRAFT,
    setDraft: vi.fn(),
    resetDraft: vi.fn(),
    storageMode: 'url',
  });

  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(FROZEN_NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// ─── Empty draft ─────────────────────────────────────────────────────────────

describe('Step6Confirm — empty draft', () => {
  it("bo'sh draft — bloklar empty, submit disabled", () => {
    mockUseBookingDraft.mockReturnValue({
      draft: {},
      setDraft: vi.fn(),
      resetDraft: vi.fn(),
      storageMode: 'empty',
    });
    mockUseMaster.mockReturnValue({ data: undefined, isPending: false, isError: false });

    render(<Step6Confirm onEditStep={vi.fn()} />);

    // Service va addressSlot bo'sh
    expect(screen.getByTestId('summary-block-1')).toHaveAttribute('data-empty', 'true');
    expect(screen.getByTestId('summary-block-2')).toHaveAttribute('data-empty', 'true');
    expect(screen.getByTestId('summary-block-5')).toHaveAttribute('data-empty', 'true');

    // Submit disabled
    expect(screen.getByTestId('step-6-submit-btn')).toBeDisabled();
  });
});

// ─── Complete draft ──────────────────────────────────────────────────────────

describe('Step6Confirm — complete draft', () => {
  it("hamma blok to'ldirilgan, submit enabled", () => {
    render(<Step6Confirm onEditStep={vi.fn()} />);

    expect(screen.getByTestId('summary-block-1')).toHaveAttribute('data-empty', 'false');
    expect(screen.getByTestId('summary-block-5')).toHaveAttribute('data-empty', 'false');
    expect(screen.getByTestId('step-6-submit-btn')).not.toBeDisabled();
  });

  it("service blok'da kategoriya + sub-xizmat", () => {
    render(<Step6Confirm onEditStep={vi.fn()} />);
    expect(screen.getByTestId('summary-service-line')).toHaveTextContent(/Elektrik/);
    expect(screen.getByTestId('summary-service-line')).toHaveTextContent(/Rozetka almashtirish/);
  });

  it("address blok'da manzil + slot", () => {
    render(<Step6Confirm onEditStep={vi.fn()} />);
    expect(screen.getByTestId('summary-address-line')).toHaveTextContent('Chilonzor');
    expect(screen.getByTestId('summary-slot-line')).toBeInTheDocument();
  });

  it("contact blok'da ism + telefon", () => {
    render(<Step6Confirm onEditStep={vi.fn()} />);
    expect(screen.getByTestId('summary-contact-name')).toHaveTextContent('Bobur Toshmatov');
    expect(screen.getByTestId('summary-contact-phone')).toHaveTextContent('+998 90 123 45 67');
  });

  it("price blok'da range", () => {
    render(<Step6Confirm onEditStep={vi.fn()} />);
    const line = screen.getByTestId('summary-price-line');
    expect(line).toHaveTextContent(/50\s?000/);
    expect(line).toHaveTextContent(/225\s?000/);
  });
});

// ─── Tahrirlash ──────────────────────────────────────────────────────────────

describe('Step6Confirm — Tahrirlash', () => {
  it('blok-1 Tahrirlash bossa onEditStep(1) chaqiriladi', async () => {
    const onEditStep = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Step6Confirm onEditStep={onEditStep} />);
    await user.click(screen.getByTestId('summary-edit-1'));

    expect(onEditStep).toHaveBeenCalledWith(1);
  });

  it('blok-5 Tahrirlash → onEditStep(5)', async () => {
    const onEditStep = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Step6Confirm onEditStep={onEditStep} />);
    await user.click(screen.getByTestId('summary-edit-5'));

    expect(onEditStep).toHaveBeenCalledWith(5);
  });
});

// ─── Submit ──────────────────────────────────────────────────────────────────

describe('Step6Confirm — submit', () => {
  it('muvaffaqiyatli submit — /orders/[id] redirect', async () => {
    mockCreate.mockResolvedValue({ id: 'bk_test_001' });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Step6Confirm onEditStep={vi.fn()} />);
    await user.click(screen.getByTestId('step-6-submit-btn'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(COMPLETE_DRAFT, { clientId: 'u_42' });
      expect(mockPush).toHaveBeenCalledWith('/orders/bk_test_001');
    });
  });

  it('network xato — toast + retry tugma', async () => {
    mockCreate.mockRejectedValue(new Error('Network failed'));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Step6Confirm onEditStep={vi.fn()} />);
    await user.click(screen.getByTestId('step-6-submit-btn'));

    await waitFor(() => {
      const alert = screen.getByTestId('submit-error');
      expect(alert).toHaveAttribute('data-error-kind', 'network');
      expect(screen.getByTestId('submit-error-action')).toHaveTextContent(/qayta urinib/i);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('validation xato — Tahrirlash tugma, onEditStep chaqiriladi', async () => {
    mockCreate.mockRejectedValue(
      new Error('BookingDraft validation failed: contact.phone: invalid'),
    );
    const onEditStep = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Step6Confirm onEditStep={onEditStep} />);
    await user.click(screen.getByTestId('step-6-submit-btn'));

    await waitFor(() => {
      const alert = screen.getByTestId('submit-error');
      expect(alert).toHaveAttribute('data-error-kind', 'validation');
    });

    await user.click(screen.getByTestId('submit-error-action'));
    expect(onEditStep).toHaveBeenCalledWith(5);
  });

  it("master-not-found — Qidiruvga qaytish tugma /search ga yo'naltiradi", async () => {
    mockCreate.mockRejectedValue(new Error('Master not found: m_x'));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Step6Confirm onEditStep={vi.fn()} />);
    await user.click(screen.getByTestId('step-6-submit-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('submit-error')).toHaveAttribute(
        'data-error-kind',
        'master-not-found',
      );
    });

    await user.click(screen.getByTestId('submit-error-action'));
    expect(mockPush).toHaveBeenCalledWith('/search');
  });
});

// ─── Auth guard (A02) ────────────────────────────────────────────────────────

describe('Step6Confirm — auth guard', () => {
  it("session yuklanayotganda submit disabled + 'Tekshirilmoqda…'", () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: true,
      isAuthenticated: false,
      isClient: false,
      isPro: false,
      isAdmin: false,
    });

    render(<Step6Confirm onEditStep={vi.fn()} />);

    const btn = screen.getByTestId('step-6-submit-btn');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/tekshirilmoqda/i);
  });

  it("session yo'q (mehmon) — submit disabled, draft to'liq bo'lsa ham", () => {
    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      isAuthenticated: false,
      isClient: false,
      isPro: false,
      isAdmin: false,
    });

    render(<Step6Confirm onEditStep={vi.fn()} />);

    expect(screen.getByTestId('step-6-submit-btn')).toBeDisabled();
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

describe('Step6Confirm — helpers', () => {
  it("formatAmount: 225000 → '225\\s000' (uz-UZ space)", () => {
    // toLocaleString('uz-UZ') NBSP (U+00A0) ishlatadi — \s match qiladi
    expect(__test__.formatAmount(225000)).toMatch(/^225\s000$/);
  });

  it("formatPhoneDisplay: +998901234567 → '+998 90 123 45 67'", () => {
    expect(__test__.formatPhoneDisplay('+998901234567')).toBe('+998 90 123 45 67');
  });

  it("formatSlotLabel: ISO → 'KunNomi, sana oy · HH:MM'", () => {
    const iso = '2026-05-25T15:30:00+05:00';
    const label = __test__.formatSlotLabel(iso);
    expect(label).toMatch(/15:30/);
    expect(label).toMatch(/may|aprel|iyun/i);
  });
});
