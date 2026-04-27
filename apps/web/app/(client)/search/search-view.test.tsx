/**
 * T3.12 — Search View skeleton unit tests.
 *
 * Qamrov:
 *  - SearchBar URL'dagi `q` bilan to'ldirilgan
 *  - SearchBar submit -> setFilters({ q })
 *  - View toggle radiogroup, default = grid
 *  - View toggle map -> setView('map') chaqiriladi va MapView placeholder ko'rinadi
 *  - Result summary: pending / error / total ta usta topildi
 *  - Sidebar (FilterPanel placeholder) renders
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchView } from './search-view';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockSetFilters = vi.fn();
const mockUseSearchFilters = vi.fn();
vi.mock('@/lib/hooks/use-search-filters', () => ({
  useSearchFilters: () => mockUseSearchFilters(),
}));

const mockUseMasters = vi.fn();
vi.mock('@/lib/hooks/use-masters', () => ({
  useMasters: () => mockUseMasters(),
}));

// SortDropdown — SearchView'da ham mock kerak (useGeolocation ishlatadi)
vi.mock('@/components/features/sort-dropdown', () => ({
  SortDropdown: () => <div data-testid="sort-dropdown-mock">Sort</div>,
}));

// ResultDrawer — useMaster + nuqs ichki hook'lari, testda mock
vi.mock('./result-drawer', () => ({
  ResultDrawer: () => <div data-testid="result-drawer-mock" />,
}));

// MapView — SSR-safe dynamic import, testda mock
vi.mock('./map-view', () => ({
  MapView: () => (
    <div data-slot="map-view-placeholder" data-testid="map-view-mock">
      Map
    </div>
  ),
}));

// ResultGrid — SearchView'da mock (o'z hook'larini chaqirmaydi, props orqali)
vi.mock('./result-grid', () => ({
  ResultGrid: ({
    isPending,
    isError,
  }: {
    isPending: boolean;
    isError: boolean;
    data?: unknown;
  }) => (
    <div data-testid="result-grid-mock">
      {isPending && <span>Loading...</span>}
      {isError && <span>Error</span>}
    </div>
  ),
}));

// FilterPanel ichki hook'lari — SearchView'da ham mock kerak
const mockUseCategories = vi.fn();
vi.mock('@/lib/hooks/use-categories', () => ({
  useCategories: () => mockUseCategories(),
}));

const mockUseGeolocation = vi.fn();
vi.mock('@/lib/hooks/use-geolocation', () => ({
  useGeolocation: () => mockUseGeolocation(),
}));

function defaultFiltersReturn(overrides: { q?: string } = {}) {
  return {
    filters: {
      q: overrides.q ?? '',
      categoryId: null,
      rating: null,
      priceFrom: null,
      priceTo: null,
      online: null,
      trustLevel: null,
      sort: 'rating' as const,
      page: 1,
      pageSize: 20,
    },
    apiFilter: {
      sort: 'rating' as const,
      page: 1,
      pageSize: 20,
      ...(overrides.q ? { q: overrides.q } : {}),
    },
    setFilters: mockSetFilters,
    resetFilters: vi.fn(),
  };
}

function defaultMastersReturn(
  overrides: { isPending?: boolean; isError?: boolean; total?: number; mastersCount?: number } = {},
) {
  const total = overrides.total ?? 0;
  const mastersCount = overrides.mastersCount ?? 0;
  return {
    data:
      overrides.isPending || overrides.isError
        ? undefined
        : {
            masters: Array.from({ length: mastersCount }, (_, i) => ({ id: `m${i}` })),
            total,
            page: 1,
            pageSize: 20,
            hasMore: total > mastersCount,
          },
    isPending: overrides.isPending ?? false,
    isError: overrides.isError ?? false,
  };
}

beforeEach(() => {
  mockSetFilters.mockReset();
  mockUseSearchFilters.mockReset();
  mockUseMasters.mockReset();
  mockUseCategories.mockReset();
  mockUseGeolocation.mockReset();

  // FilterPanel ichki hook'lari uchun minimal default'lar
  mockUseCategories.mockReturnValue({ data: [], isPending: false });
  mockUseGeolocation.mockReturnValue({ state: 'idle', position: null, request: vi.fn() });
});

// ─── SearchBar integration ───────────────────────────────────────────────────

describe('SearchView — SearchBar', () => {
  it("URL'dagi q SearchBar input'ga avtomatik to'ldiriladi", () => {
    mockUseSearchFilters.mockReturnValue(defaultFiltersReturn({ q: 'elektrik' }));
    mockUseMasters.mockReturnValue(defaultMastersReturn({ total: 12 }));

    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?q=elektrik' }),
    });

    expect(screen.getByRole('combobox')).toHaveValue('elektrik');
  });

  it('submit -> setFilters({ q }) chaqiriladi', async () => {
    mockUseSearchFilters.mockReturnValue(defaultFiltersReturn());
    mockUseMasters.mockReturnValue(defaultMastersReturn({ total: 0 }));
    const user = userEvent.setup();

    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    const input = screen.getByRole('combobox');
    await user.type(input, 'santexnik{Enter}');

    expect(mockSetFilters).toHaveBeenCalledWith({ q: 'santexnik' });
  });
});

// ─── View toggle ─────────────────────────────────────────────────────────────

describe('SearchView — view toggle', () => {
  beforeEach(() => {
    mockUseSearchFilters.mockReturnValue(defaultFiltersReturn());
    mockUseMasters.mockReturnValue(defaultMastersReturn({ total: 5, mastersCount: 5 }));
  });

  it("default view = grid (radio Ro'yxat tanlangan, ResultGrid placeholder)", () => {
    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    const gridRadio = screen.getByRole('radio', { name: /Ro'yxat/ });
    const mapRadio = screen.getByRole('radio', { name: /Xarita/ });
    expect(gridRadio).toHaveAttribute('aria-checked', 'true');
    expect(mapRadio).toHaveAttribute('aria-checked', 'false');
    expect(document.querySelector('[data-testid="result-grid-mock"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="map-view-placeholder"]')).toBeNull();
  });

  it("view=map URL bilan ochilsa MapView placeholder ko'rinadi", () => {
    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '?view=map' }),
    });

    expect(document.querySelector('[data-slot="map-view-placeholder"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="result-grid-mock"]')).toBeNull();
  });

  it("Xarita radio bosilsa MapView placeholder ko'rinadi", async () => {
    const user = userEvent.setup();

    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    // Boshlang'ichda grid placeholder
    expect(document.querySelector('[data-testid="result-grid-mock"]')).not.toBeNull();

    await user.click(screen.getByRole('radio', { name: /Xarita/ }));

    expect(document.querySelector('[data-slot="map-view-placeholder"]')).not.toBeNull();
  });
});

// ─── Result summary ──────────────────────────────────────────────────────────

describe('SearchView — result summary', () => {
  beforeEach(() => {
    mockUseSearchFilters.mockReturnValue(defaultFiltersReturn());
  });

  it("pending — 'Yuklanmoqda...'", () => {
    mockUseMasters.mockReturnValue(defaultMastersReturn({ isPending: true }));

    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.getByTestId('search-result-summary')).toHaveTextContent(/Yuklanmoqda/);
  });

  it("error — 'Natijalarni yuklab bo'lmadi'", () => {
    mockUseMasters.mockReturnValue(defaultMastersReturn({ isError: true }));

    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.getByTestId('search-result-summary')).toHaveTextContent(/yuklab bo'lmadi/);
  });

  it("success — 'N ta usta topildi'", () => {
    mockUseMasters.mockReturnValue(defaultMastersReturn({ total: 124, mastersCount: 20 }));

    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.getByTestId('search-result-summary')).toHaveTextContent('124 ta usta topildi');
  });
});

// ─── Layout structure ────────────────────────────────────────────────────────

describe('SearchView — layout', () => {
  it('sidebar (FilterPanel) va main hududlar mavjud', () => {
    mockUseSearchFilters.mockReturnValue(defaultFiltersReturn());
    mockUseMasters.mockReturnValue(defaultMastersReturn({ total: 0 }));

    render(<SearchView />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.getByRole('complementary', { name: 'Filterlar' })).toBeInTheDocument();
    expect(document.querySelector('[data-slot="filter-panel"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="search-main"]')).not.toBeNull();
  });
});
