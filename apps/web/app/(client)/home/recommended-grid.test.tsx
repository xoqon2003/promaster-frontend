/**
 * T3.11 — Home Recommended Grid unit tests.
 *
 * Qamrov:
 *  - section a11y: aria-label = "Tavsiya etilgan ustalar"
 *  - "Barchasini ko'rish" linki -> /search?sort=rating
 *  - loading: 8 ta MasterCard skeleton
 *  - success: N ta MasterCard, har biri usta nomi bilan
 *  - empty: "Tez orada tavsiyalar paydo bo'ladi" placeholder
 *  - error: alert + "Qayta urinib ko'ring" tugmasi (refetch chaqiriladi)
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Master } from '@/lib/masters/schemas';

import { RecommendedGrid } from './recommended-grid';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUseRecommended = vi.fn();
vi.mock('@/lib/hooks/use-recommended-masters', () => ({
  useRecommendedMasters: () => mockUseRecommended(),
}));

function makeMaster(id: string, name: string, overrides: Partial<Master> = {}): Master {
  return {
    id,
    name,
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
    ...overrides,
  };
}

const SAMPLE_MASTERS: Master[] = [
  makeMaster('m1', 'Bobur Toshmatov'),
  makeMaster('m2', 'Sherzod Karimov'),
  makeMaster('m3', 'Aziz Yuldashev'),
  makeMaster('m4', 'Dilshod Rahimov'),
];

beforeEach(() => {
  mockUseRecommended.mockReset();
});

// ─── Section semantics ───────────────────────────────────────────────────────

describe('RecommendedGrid — section semantics', () => {
  beforeEach(() => {
    mockUseRecommended.mockReturnValue({
      data: SAMPLE_MASTERS,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("section aria-label='Tavsiya etilgan ustalar' va h2 sarlavha ko'rinadi", () => {
    render(<RecommendedGrid />);

    expect(screen.getByRole('region', { name: 'Tavsiya etilgan ustalar' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Tavsiya etilgan ustalar' }),
    ).toBeInTheDocument();
  });

  it("'Barchasini ko'rish' linki /search?sort=rating ga ishora qiladi", () => {
    render(<RecommendedGrid />);

    const link = screen.getByRole('link', { name: /Barchasini ko'rish/ });
    expect(link).toHaveAttribute('href', '/search?sort=rating');
  });
});

// ─── Loading ─────────────────────────────────────────────────────────────────

describe('RecommendedGrid — loading', () => {
  it("isPending — 8 ta MasterCard skeleton, real card yo'q", () => {
    mockUseRecommended.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = render(<RecommendedGrid />);

    const skeletons = container.querySelectorAll('[data-slot="master-card-skeleton"]');
    expect(skeletons).toHaveLength(8);
    expect(container.querySelectorAll('[data-slot="master-card"]')).toHaveLength(0);
  });
});

// ─── Success ─────────────────────────────────────────────────────────────────

describe('RecommendedGrid — success', () => {
  beforeEach(() => {
    mockUseRecommended.mockReturnValue({
      data: SAMPLE_MASTERS,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("har bir usta uchun MasterCard ko'rsatiladi", () => {
    const { container } = render(<RecommendedGrid />);
    expect(container.querySelectorAll('[data-slot="master-card"]')).toHaveLength(
      SAMPLE_MASTERS.length,
    );
  });

  it('usta nomlari render qilinadi', () => {
    render(<RecommendedGrid />);
    expect(screen.getByText('Bobur Toshmatov')).toBeInTheDocument();
    expect(screen.getByText('Dilshod Rahimov')).toBeInTheDocument();
  });
});

// ─── Empty ───────────────────────────────────────────────────────────────────

describe('RecommendedGrid — empty', () => {
  it("data bo'sh bo'lsa — 'Tez orada tavsiyalar paydo bo'ladi' xabari", () => {
    mockUseRecommended.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = render(<RecommendedGrid />);

    expect(container.querySelector('[data-slot="recommended-grid-empty"]')).toHaveTextContent(
      /Tez orada tavsiyalar/,
    );
    expect(container.querySelectorAll('[data-slot="master-card"]')).toHaveLength(0);
  });
});

// ─── Error ───────────────────────────────────────────────────────────────────

describe('RecommendedGrid — error', () => {
  it("isError — alert + 'Qayta urinib ko'ring' tugmasi", () => {
    mockUseRecommended.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<RecommendedGrid />);

    expect(screen.getByRole('alert')).toHaveTextContent(/yuklab bo'lmadi/i);
    expect(screen.getByRole('button', { name: /Qayta urinib ko'ring/ })).toBeInTheDocument();
  });

  it("'Qayta urinib ko'ring' tugmasi refetch ni chaqiradi", async () => {
    const refetch = vi.fn();
    mockUseRecommended.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    });
    const user = userEvent.setup();

    render(<RecommendedGrid />);

    await user.click(screen.getByRole('button', { name: /Qayta urinib ko'ring/ }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
