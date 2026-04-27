/**
 * T3.10 — Home Categories Rail unit tests.
 *
 * Qamrov:
 *  - loading state: 3 ta skeleton ko'rsatiladi (CategoryCard yo'q)
 *  - success: 10 ta CategoryCard, har biri to'g'ri href bilan link
 *  - error: alert + "Qayta urinib ko'ring" tugmasi (refetch chaqiriladi)
 *  - section a11y: aria-label = "Kategoriyalar"
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Category } from '@/lib/masters/schemas';

import { CategoriesRail } from './categories-rail';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUseCategories = vi.fn();
vi.mock('@/lib/hooks/use-categories', () => ({
  useCategories: () => mockUseCategories(),
}));

const SAMPLE_CATEGORIES: Category[] = [
  { id: 'elektrik', name: 'Elektrik', emoji: '⚡', masterCount: 10 },
  { id: 'santexnik', name: 'Santexnik', emoji: '🔧', masterCount: 10 },
  { id: 'remont', name: "Ta'mirlash", emoji: '🔨', masterCount: 10 },
  { id: 'dizayn', name: 'Dizayn', emoji: '🎨', masterCount: 10 },
  { id: 'tarbiyachi', name: 'Tarbiyachi', emoji: '👶', masterCount: 10 },
  { id: 'repetitor', name: 'Repetitor', emoji: '📚', masterCount: 10 },
  { id: 'tarjimon', name: 'Tarjimon', emoji: '🗣️', masterCount: 10 },
  { id: 'haydovchi', name: 'Haydovchi', emoji: '🚗', masterCount: 10 },
  { id: 'kurer', name: 'Kuryer', emoji: '📦', masterCount: 10 },
  { id: 'nikoh', name: "To'y xizmati", emoji: '💍', masterCount: 10 },
];

beforeEach(() => {
  mockUseCategories.mockReset();
});

// ─── Section semantics ───────────────────────────────────────────────────────

describe('CategoriesRail — section semantics', () => {
  it("section aria-label='Kategoriyalar' va h2 sarlavha ko'rinadi", () => {
    mockUseCategories.mockReturnValue({
      data: SAMPLE_CATEGORIES,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<CategoriesRail />);

    expect(screen.getByRole('region', { name: 'Kategoriyalar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Kategoriyalar' })).toBeInTheDocument();
  });
});

// ─── Loading ─────────────────────────────────────────────────────────────────

describe('CategoriesRail — loading', () => {
  it("isPending — 3 ta skeleton, CategoryCard yo'q", () => {
    mockUseCategories.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = render(<CategoriesRail />);

    const skeletons = container.querySelectorAll('[data-slot="category-card-skeleton"]');
    expect(skeletons).toHaveLength(3);
    expect(container.querySelectorAll('[data-slot="category-card"]')).toHaveLength(0);
  });
});

// ─── Success ─────────────────────────────────────────────────────────────────

describe('CategoriesRail — success', () => {
  beforeEach(() => {
    mockUseCategories.mockReturnValue({
      data: SAMPLE_CATEGORIES,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("10 ta CategoryCard ko'rsatiladi", () => {
    const { container } = render(<CategoriesRail />);
    expect(container.querySelectorAll('[data-slot="category-card"]')).toHaveLength(10);
  });

  it("har card href '/search?categoryId=<id>' ga ishora qiladi", () => {
    render(<CategoriesRail />);

    const elektrikLink = screen.getByRole('link', { name: /Elektrik kategoriyasi/ });
    expect(elektrikLink).toHaveAttribute('href', '/search?categoryId=elektrik');

    const nikohLink = screen.getByRole('link', { name: /To'y xizmati kategoriyasi/ });
    expect(nikohLink).toHaveAttribute('href', '/search?categoryId=nikoh');
  });
});

// ─── Error ───────────────────────────────────────────────────────────────────

describe('CategoriesRail — error', () => {
  it("isError — alert + 'Qayta urinib ko'ring' tugmasi", () => {
    mockUseCategories.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<CategoriesRail />);

    expect(screen.getByRole('alert')).toHaveTextContent(/yuklab bo'lmadi/i);
    expect(screen.getByRole('button', { name: /Qayta urinib ko'ring/ })).toBeInTheDocument();
  });

  it("'Qayta urinib ko'ring' tugmasi refetch ni chaqiradi", async () => {
    const refetch = vi.fn();
    mockUseCategories.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    });
    const user = userEvent.setup();

    render(<CategoriesRail />);

    await user.click(screen.getByRole('button', { name: /Qayta urinib ko'ring/ }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
