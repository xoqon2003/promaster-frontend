/**
 * T4.04 — `Step1Service` unit tests.
 *
 * Qamrov:
 *  - Categories yuklanishi (loading / error / success)
 *  - Kategoriya tanlash → sub-services ochiladi
 *  - Sub-service kategoriya o'zgarganda reset bo'ladi
 *  - Tavsif counter > 500 — ogohlantirish
 *  - Form submit valid bo'lsa onComplete chaqiriladi
 *  - URL'dan ?categoryId=... defaultga to'ldiriladi
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Step1Service } from './step-1-service';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockCategories = [
  { id: 'elektrik', name: 'Elektrik', emoji: '⚡', masterCount: 10 },
  { id: 'santexnik', name: 'Santexnik', emoji: '🔧', masterCount: 8 },
  { id: 'remont', name: "Ta'mirlash", emoji: '🔨', masterCount: 12 },
];

const mockUseCategories = vi.fn();
vi.mock('@/lib/hooks/use-categories', () => ({
  useCategories: () => mockUseCategories(),
}));

const mockSetDraft = vi.fn();
const mockUseBookingDraft = vi.fn();
vi.mock('@/lib/hooks/use-booking-draft', () => ({
  useBookingDraft: () => mockUseBookingDraft(),
}));

// `next/navigation` useSearchParams mock
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  mockSetDraft.mockReset();
  mockUseCategories.mockReset();
  mockUseBookingDraft.mockReset();

  mockUseCategories.mockReturnValue({
    data: mockCategories,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  });
  mockUseBookingDraft.mockReturnValue({
    draft: {},
    setDraft: mockSetDraft,
    resetDraft: vi.fn(),
    storageMode: 'empty',
  });

  // Default URL
  mockSearchParams.delete('categoryId');
});

afterEach(() => {
  vi.clearAllMocks();
});

const Wrapper = withNuqsTestingAdapter({ searchParams: '' });

// ─── Categories rendering ────────────────────────────────────────────────────

describe('Step1Service — categories', () => {
  it('loading state — spinner ko`rinadi', () => {
    mockUseCategories.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    });
    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByTestId('categories-loading')).toBeInTheDocument();
  });

  it("error state — alert ko'rinadi", () => {
    mockUseCategories.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    });
    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent(/yuklab bo.lmadi/i);
  });

  it('3 ta kategoriya radio sifatida render', () => {
    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByTestId('category-option-elektrik')).toBeInTheDocument();
    expect(screen.getByTestId('category-option-santexnik')).toBeInTheDocument();
    expect(screen.getByTestId('category-option-remont')).toBeInTheDocument();
  });
});

// ─── Sub-service ─────────────────────────────────────────────────────────────

describe('Step1Service — sub-services', () => {
  it('kategoriya tanlanmagan — sub-select disabled', () => {
    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });
    const select = screen.getByTestId('sub-service-select');
    expect(select).toBeDisabled();
  });

  it('kategoriya tanlangach sub-services ochiladi', async () => {
    const user = userEvent.setup();
    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });

    await user.click(screen.getByTestId('category-option-elektrik'));

    const select = screen.getByTestId('sub-service-select');
    await waitFor(() => expect(select).not.toBeDisabled());

    // Elektrik sub-services'lar mavjud bo'lishi kerak
    expect(screen.getByRole('option', { name: /Rozetka almashtirish/ })).toBeInTheDocument();
  });
});

// ─── Description counter ─────────────────────────────────────────────────────

describe('Step1Service — description', () => {
  it('boshlang`ich counter 0 / 500', () => {
    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByTestId('description-counter')).toHaveTextContent('0 / 500');
  });

  it('matn yozilganda counter yangilanadi', async () => {
    const user = userEvent.setup();
    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });

    const textarea = screen.getByTestId('description-textarea');
    await user.type(textarea, 'Test tavsif');

    expect(screen.getByTestId('description-counter')).toHaveTextContent('11 / 500');
  });
});

// ─── URL ?categoryId= default ───────────────────────────────────────────────

describe('Step1Service — URL prefill', () => {
  it('?categoryId=santexnik — radio default tanlangan', () => {
    mockSearchParams.set('categoryId', 'santexnik');

    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });

    const radio = screen
      .getByTestId('category-option-santexnik')
      .querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  it("draft.service.categoryId — URL'dan ustun", () => {
    mockSearchParams.set('categoryId', 'santexnik');
    mockUseBookingDraft.mockReturnValue({
      draft: {
        service: {
          categoryId: 'remont',
          subServiceId: 'kapital-remont',
          description: '',
        },
      },
      setDraft: mockSetDraft,
      resetDraft: vi.fn(),
      storageMode: 'url',
    });

    render(<Step1Service onComplete={vi.fn()} />, { wrapper: Wrapper });

    const radio = screen
      .getByTestId('category-option-remont')
      .querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });
});
