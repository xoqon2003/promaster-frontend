/**
 * T3.14 — SortDropdown unit tests.
 *
 * Qamrov:
 *  - Trigger render + joriy sort qiymati ko'rsatiladi
 *  - 4 ta sort option mavjud (trigger bosilganda)
 *  - "Eng yaqin" — geoState='idle' da disabled
 *  - "Eng yaqin" — geoState='granted' da enabled
 *  - Sort tanlash → setFilters({ sort }) chaqiriladi
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SortDropdown } from './sort-dropdown';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSetFilters = vi.fn();
const mockUseSearchFilters = vi.fn();
vi.mock('@/lib/hooks/use-search-filters', () => ({
  useSearchFilters: () => mockUseSearchFilters(),
}));

const mockUseGeolocation = vi.fn();
vi.mock('@/lib/hooks/use-geolocation', () => ({
  useGeolocation: () => mockUseGeolocation(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeFilters(sort: string = 'rating') {
  return {
    filters: {
      q: '',
      categoryId: null,
      rating: null,
      priceFrom: null,
      priceTo: null,
      online: null,
      trustLevel: null,
      sort: sort as 'rating' | 'price' | 'distance' | 'newest',
      page: 1,
      pageSize: 20,
    },
    apiFilter: {},
    setFilters: mockSetFilters,
    resetFilters: vi.fn(),
  };
}

beforeEach(() => {
  mockSetFilters.mockReset();
  mockUseSearchFilters.mockReset();
  mockUseGeolocation.mockReset();

  mockUseSearchFilters.mockReturnValue(makeFilters());
  mockUseGeolocation.mockReturnValue({ state: 'idle', position: null, request: vi.fn() });
});

// ─── Render ───────────────────────────────────────────────────────────────────

describe('SortDropdown — render', () => {
  it("trigger aria-label='Saralash tartibi' bilan render qilinadi", () => {
    render(<SortDropdown />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.getByTestId('sort-dropdown-trigger')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Saralash tartibi/ })).toBeInTheDocument();
  });

  it("default sort='rating' triggerda ko'rinadi", () => {
    render(<SortDropdown />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.getByTestId('sort-current-label')).toHaveTextContent(/Reyting/);
  });

  it("sort='price' bo'lsa trigger 'Narx past' ko'rsatadi", () => {
    mockUseSearchFilters.mockReturnValue(makeFilters('price'));

    render(<SortDropdown />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    expect(screen.getByTestId('sort-current-label')).toHaveTextContent(/Narx/);
  });
});

// ─── Options ──────────────────────────────────────────────────────────────────

describe('SortDropdown — options', () => {
  it("trigger bosilganda 4 ta option ko'rinadi", async () => {
    const user = userEvent.setup();
    render(<SortDropdown />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByTestId('sort-dropdown-trigger'));

    expect(screen.getByTestId('sort-option-rating')).toBeInTheDocument();
    expect(screen.getByTestId('sort-option-price')).toBeInTheDocument();
    expect(screen.getByTestId('sort-option-distance')).toBeInTheDocument();
    expect(screen.getByTestId('sort-option-newest')).toBeInTheDocument();
  });

  it("geoState='idle' da 'Eng yaqin' disabled", async () => {
    const user = userEvent.setup();
    render(<SortDropdown />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByTestId('sort-dropdown-trigger'));

    const distanceOption = screen.getByTestId('sort-option-distance');
    expect(distanceOption).toHaveAttribute('aria-disabled', 'true');
  });

  it("geoState='granted' da 'Eng yaqin' enabled", async () => {
    mockUseGeolocation.mockReturnValue({
      state: 'granted',
      position: { lat: 41.31, lng: 69.28, accuracy: 10 },
      request: vi.fn(),
    });
    const user = userEvent.setup();

    render(<SortDropdown />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByTestId('sort-dropdown-trigger'));

    const distanceOption = screen.getByTestId('sort-option-distance');
    expect(distanceOption).not.toHaveAttribute('aria-disabled', 'true');
  });
});

// ─── Tanlash → setFilters ─────────────────────────────────────────────────────

describe('SortDropdown — tanlash', () => {
  it("'Narx past' tanlansa setFilters({ sort: 'price' }) chaqiriladi", async () => {
    const user = userEvent.setup();
    render(<SortDropdown />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByTestId('sort-dropdown-trigger'));
    await user.click(screen.getByTestId('sort-option-price'));

    expect(mockSetFilters).toHaveBeenCalledWith({ sort: 'price' });
  });

  it("'Eng yangi' tanlansa setFilters({ sort: 'newest' }) chaqiriladi", async () => {
    const user = userEvent.setup();
    render(<SortDropdown />, { wrapper: withNuqsTestingAdapter({ searchParams: '' }) });

    await user.click(screen.getByTestId('sort-dropdown-trigger'));
    await user.click(screen.getByTestId('sort-option-newest'));

    expect(mockSetFilters).toHaveBeenCalledWith({ sort: 'newest' });
  });
});
