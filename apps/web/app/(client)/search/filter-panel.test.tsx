/**
 * T3.13 — FilterPanel unit tests.
 *
 * Qamrov:
 *  - Kategoriya radio list (Barchasi + kategoriyalar)
 *  - Kategoriya tanlash -> setFilters({ categoryId })
 *  - Rating chip toggle -> setFilters({ rating })
 *  - Trust chip toggle -> setFilters({ trustLevel })
 *  - Online toggle -> setFilters({ online })
 *  - "Tozalash" tugmasi -> resetFilters, active filter 0 da disabled
 *  - Active filter count badge
 *  - Masofa slider faqat geoState='granted' da ko'rinadi
 *  - PriceRange slider'lar mavjudligi
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Category } from '@/lib/masters/schemas';

import { FilterPanel } from './filter-panel';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSetFilters = vi.fn();
const mockResetFilters = vi.fn();
const mockUseSearchFilters = vi.fn();
vi.mock('@/lib/hooks/use-search-filters', () => ({
  useSearchFilters: () => mockUseSearchFilters(),
}));

const mockUseCategories = vi.fn();
vi.mock('@/lib/hooks/use-categories', () => ({
  useCategories: () => mockUseCategories(),
}));

const mockUseGeolocation = vi.fn();
vi.mock('@/lib/hooks/use-geolocation', () => ({
  useGeolocation: () => mockUseGeolocation(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SAMPLE_CATEGORIES: Category[] = [
  { id: 'elektrik', name: 'Elektrik', emoji: '⚡', masterCount: 42 },
  { id: 'santexnik', name: 'Santexnik', emoji: '🔧', masterCount: 28 },
];

function defaultFilters(overrides: Record<string, unknown> = {}) {
  return {
    filters: {
      q: '',
      categoryId: null,
      rating: null,
      priceFrom: null,
      priceTo: null,
      online: null,
      trustLevel: null,
      sort: 'rating' as const,
      page: 1,
      pageSize: 20,
      ...overrides,
    },
    apiFilter: {},
    setFilters: mockSetFilters,
    resetFilters: mockResetFilters,
  };
}

beforeEach(() => {
  mockSetFilters.mockReset();
  mockResetFilters.mockReset();
  mockUseSearchFilters.mockReset();
  mockUseCategories.mockReset();
  mockUseGeolocation.mockReset();

  mockUseCategories.mockReturnValue({
    data: SAMPLE_CATEGORIES,
    isPending: false,
  });
  mockUseGeolocation.mockReturnValue({ state: 'idle', position: null, request: vi.fn() });
});

// ─── Kategoriya ───────────────────────────────────────────────────────────────

describe('FilterPanel — kategoriya', () => {
  it("'Barchasi' va 2 ta kategoriya radio ko'rinadi", () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    const radios = screen.getAllByRole('radio');
    // Barchasi + 2 kategoriya
    expect(radios.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByLabelText('Barcha kategoriyalar')).toBeInTheDocument();
    expect(screen.getByLabelText(/Elektrik kategoriyasi/)).toBeInTheDocument();
  });

  it('kategoriya tanlashda setFilters chaqiriladi', async () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    const user = userEvent.setup();

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByLabelText(/Elektrik kategoriyasi/));
    expect(mockSetFilters).toHaveBeenCalledWith({ categoryId: 'elektrik' });
  });

  it("'Barchasi' tanlashda categoryId null qilinadi", async () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters({ categoryId: 'elektrik' }));
    const user = userEvent.setup();

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByLabelText('Barcha kategoriyalar'));
    expect(mockSetFilters).toHaveBeenCalledWith({ categoryId: null });
  });
});

// ─── Rating chips ─────────────────────────────────────────────────────────────

describe('FilterPanel — reyting chips', () => {
  it("4 ta reyting chip ko'rinadi", () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    const container = document.querySelector('[data-testid="rating-chips"]');
    expect(container?.querySelectorAll('[data-slot="filter-chip"]').length).toBe(4);
  });

  it('reyting chip bosilganda setFilters chaqiriladi', async () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    const user = userEvent.setup();

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByRole('switch', { name: '4+' }));
    expect(mockSetFilters).toHaveBeenCalledWith({ rating: 4 });
  });

  it('faol reyting chip qayta bosilganda null qilinadi', async () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters({ rating: 4.5 }));
    const user = userEvent.setup();

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByRole('switch', { name: '4.5+' }));
    expect(mockSetFilters).toHaveBeenCalledWith({ rating: null });
  });
});

// ─── Trust chips ──────────────────────────────────────────────────────────────

describe('FilterPanel — trust chips', () => {
  it("3 ta trust chip ko'rinadi", () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    const container = document.querySelector('[data-testid="trust-chips"]');
    expect(container?.querySelectorAll('[data-slot="filter-chip"]').length).toBe(3);
  });

  it('Pro chip bosilganda setFilters chaqiriladi', async () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    const user = userEvent.setup();

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByRole('switch', { name: 'Pro' }));
    expect(mockSetFilters).toHaveBeenCalledWith({ trustLevel: 'pro' });
  });
});

// ─── Online toggle ────────────────────────────────────────────────────────────

describe('FilterPanel — online toggle', () => {
  it("online chip ko'rinadi, bosilganda setFilters chaqiriladi", async () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    const user = userEvent.setup();

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    const onlineChip = screen.getByRole('switch', { name: 'Hozir onlayn' });
    expect(onlineChip).toBeInTheDocument();

    await user.click(onlineChip);
    expect(mockSetFilters).toHaveBeenCalledWith({ online: true });
  });
});

// ─── Tozalash tugmasi ────────────────────────────────────────────────────────

describe('FilterPanel — tozalash', () => {
  it('filter yo\'q bo\'lsa "Tozalash" tugmasi disabled', () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.getByTestId('reset-filters-btn')).toBeDisabled();
  });

  it('filter bor bo\'lsa "Tozalash" tugmasi enabled va resetFilters chaqiriladi', async () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters({ rating: 4 }));
    const user = userEvent.setup();

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    const btn = screen.getByTestId('reset-filters-btn');
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(mockResetFilters).toHaveBeenCalledTimes(1);
  });
});

// ─── Active filter count ──────────────────────────────────────────────────────

describe('FilterPanel — active filter count', () => {
  it("filter yo'q bo'lsa badge ko'rinmaydi", () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.queryByTestId('active-filter-count')).toBeNull();
  });

  it('2 ta filter bo\'lsa "2 ta faol filter" badge ko\'rinadi', () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters({ rating: 4, online: true }));

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.getByTestId('active-filter-count')).toHaveTextContent('2 ta faol filter');
  });
});

// ─── Price sliders ────────────────────────────────────────────────────────────

describe('FilterPanel — price sliders', () => {
  it('priceFrom va priceTo slider mavjud', () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.getByTestId('price-from-slider')).toBeInTheDocument();
    expect(screen.getByTestId('price-to-slider')).toBeInTheDocument();
  });
});

// ─── Geolocation — distance slider ───────────────────────────────────────────

describe('FilterPanel — masofa (geolocation)', () => {
  it("geoState='idle' da distance slider ko'rinmaydi", () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    mockUseGeolocation.mockReturnValue({ state: 'idle', position: null, request: vi.fn() });

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.queryByTestId('distance-slider')).toBeNull();
  });

  it("geoState='granted' da distance slider ko'rinadi", () => {
    mockUseSearchFilters.mockReturnValue(defaultFilters());
    mockUseGeolocation.mockReturnValue({
      state: 'granted',
      position: { lat: 41.31, lng: 69.28, accuracy: 10 },
      request: vi.fn(),
    });

    render(<FilterPanel />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.getByTestId('distance-slider')).toBeInTheDocument();
  });
});
