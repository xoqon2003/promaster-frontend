/**
 * T3.15 — ResultGrid unit tests.
 *
 * Qamrov:
 *  - loading: 8 ta MasterCard skeleton
 *  - success: N ta MasterCard, har biri usta nomi bilan
 *  - empty: "Natija topilmadi" state
 *  - error: alert + "Qayta urinib ko'ring" → onRetry chaqiriladi
 *  - hasMore=true → "Ko'proq ko'rsatish" tugmasi
 *  - hasMore=false → tugma yo'q
 *  - "Ko'proq ko'rsatish" bosilganda onLoadMore chaqiriladi
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Master, SearchResponse } from '@/lib/masters/schemas';

import { ResultGrid } from './result-grid';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeMaster(id: string, name: string): Master {
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
  };
}

function makeResponse(
  masters: Master[],
  overrides: Partial<Omit<SearchResponse, 'masters'>> = {},
): SearchResponse {
  return {
    masters,
    total: masters.length,
    page: 1,
    pageSize: 20,
    hasMore: false,
    ...overrides,
  };
}

const SAMPLE_MASTERS = [
  makeMaster('m1', 'Bobur Toshmatov'),
  makeMaster('m2', 'Sherzod Karimov'),
  makeMaster('m3', 'Aziz Yuldashev'),
];

const defaultProps = {
  data: makeResponse(SAMPLE_MASTERS),
  isPending: false,
  isError: false,
  onRetry: vi.fn(),
  onLoadMore: vi.fn(),
};

// ─── Loading ──────────────────────────────────────────────────────────────────

describe('ResultGrid — loading', () => {
  it("isPending — 8 ta skeleton ko'rinadi, MasterCard yo'q", () => {
    const { container } = render(
      <ResultGrid {...defaultProps} data={undefined} isPending={true} />,
    );

    expect(container.querySelectorAll('[data-slot="master-card-skeleton"]')).toHaveLength(8);
    expect(container.querySelectorAll('[data-slot="master-card"]')).toHaveLength(0);
  });
});

// ─── Success ──────────────────────────────────────────────────────────────────

describe('ResultGrid — success', () => {
  it('3 ta usta uchun MasterCard render qilinadi', () => {
    const { container } = render(<ResultGrid {...defaultProps} />);

    expect(container.querySelectorAll('[data-slot="master-card"]')).toHaveLength(3);
  });

  it("usta nomlari ko'rinadi", () => {
    render(<ResultGrid {...defaultProps} />);

    expect(screen.getByText('Bobur Toshmatov')).toBeInTheDocument();
    expect(screen.getByText('Aziz Yuldashev')).toBeInTheDocument();
  });
});

// ─── Empty ────────────────────────────────────────────────────────────────────

describe('ResultGrid — empty', () => {
  it("masters bo'sh bo'lsa \"Natija topilmadi\" ko'rinadi", () => {
    const { container } = render(<ResultGrid {...defaultProps} data={makeResponse([])} />);

    expect(container.querySelector('[data-slot="result-grid-empty"]')).toHaveTextContent(
      /Natija topilmadi/,
    );
    expect(container.querySelectorAll('[data-slot="master-card"]')).toHaveLength(0);
  });
});

// ─── Error ────────────────────────────────────────────────────────────────────

describe('ResultGrid — error', () => {
  it("isError — alert + retry tugmasi ko'rinadi", () => {
    render(<ResultGrid {...defaultProps} data={undefined} isError={true} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/yuklab bo'lmadi/i);
    expect(screen.getByRole('button', { name: /Qayta urinib ko'ring/ })).toBeInTheDocument();
  });

  it('retry bosilganda onRetry chaqiriladi', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<ResultGrid {...defaultProps} data={undefined} isError={true} onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /Qayta urinib ko'ring/ }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

// ─── Pagination ───────────────────────────────────────────────────────────────

describe('ResultGrid — pagination', () => {
  it("hasMore=false — 'Ko'proq' tugmasi yo'q", () => {
    render(
      <ResultGrid {...defaultProps} data={makeResponse(SAMPLE_MASTERS, { hasMore: false })} />,
    );

    expect(screen.queryByTestId('load-more-btn')).toBeNull();
  });

  it("hasMore=true — 'Ko'proq ko'rsatish' tugmasi ko'rinadi", () => {
    render(<ResultGrid {...defaultProps} data={makeResponse(SAMPLE_MASTERS, { hasMore: true })} />);

    expect(screen.getByTestId('load-more-btn')).toBeInTheDocument();
    expect(screen.getByTestId('load-more-btn')).toHaveTextContent(/Ko'proq/);
  });

  it("'Ko'proq ko'rsatish' bosilganda onLoadMore chaqiriladi", async () => {
    const onLoadMore = vi.fn();
    const user = userEvent.setup();

    render(
      <ResultGrid
        {...defaultProps}
        data={makeResponse(SAMPLE_MASTERS, { hasMore: true })}
        onLoadMore={onLoadMore}
      />,
    );

    await user.click(screen.getByTestId('load-more-btn'));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
