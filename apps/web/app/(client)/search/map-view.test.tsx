/**
 * T3.16 — MapView unit tests.
 *
 * YandexMapInner dynamic import orqali yuklanadi — testda mock.
 *
 * Qamrov:
 *  - data-testid="map-view" container render qilinadi
 *  - onSwitchToList prop bor bo'lsa "Ro'yxat" tugmasi ko'rinadi
 *  - "Ro'yxat" tugmasi bosilganda onSwitchToList chaqiriladi
 *  - Bounds change → "Bu hududda qidirish" tugmasi paydo bo'ladi
 *  - "Bu hududda qidirish" bosilganda tugma yashiriladi
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it, vi } from 'vitest';

import { MapView } from './map-view';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// YandexMapInner — Yandex Maps SDK jsdom'da ishlamaydi, mock
vi.mock('./yandex-map', () => ({
  YandexMapInner: ({
    onBoundsChange,
  }: {
    onBoundsChange: (b: { north: number; south: number; east: number; west: number }) => void;
    onPinClick: (id: string) => void;
    masters: unknown[];
  }) => (
    <div data-testid="yandex-map-mock">
      <button
        type="button"
        data-testid="trigger-bounds-change"
        onClick={() => onBoundsChange({ north: 41.4, south: 41.2, east: 69.4, west: 69.1 })}
      >
        Simulate bounds
      </button>
    </div>
  ),
}));

// nuqs useQueryState — masterId URL param
vi.mock('nuqs', async () => {
  const actual = await vi.importActual<typeof import('nuqs')>('nuqs');
  return {
    ...actual,
    useQueryState: vi.fn().mockReturnValue([null, vi.fn()]),
  };
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const defaultProps = {
  masters: [],
  onSwitchToList: vi.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MapView — render', () => {
  it('data-testid="map-view" container render qilinadi', () => {
    render(<MapView {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.getByTestId('map-view')).toBeInTheDocument();
  });

  it("onSwitchToList prop bor bo'lsa 'Ro'yxat' tugmasi ko'rinadi", () => {
    render(<MapView {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.getByTestId('switch-to-list-btn')).toBeInTheDocument();
  });

  it("onSwitchToList prop yo'q bo'lsa tugma ko'rinmaydi", () => {
    render(<MapView masters={[]} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.queryByTestId('switch-to-list-btn')).toBeNull();
  });
});

describe('MapView — switch to list', () => {
  it("'Ro'yxat' bosilganda onSwitchToList chaqiriladi", async () => {
    const onSwitchToList = vi.fn();
    const user = userEvent.setup();

    render(<MapView masters={[]} onSwitchToList={onSwitchToList} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    await user.click(screen.getByTestId('switch-to-list-btn'));
    expect(onSwitchToList).toHaveBeenCalledTimes(1);
  });
});

describe('MapView — bounds change', () => {
  it("boshlang'ichda 'Bu hududda qidirish' tugmasi ko'rinmaydi", () => {
    render(<MapView {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    expect(screen.queryByTestId('search-in-area-btn')).toBeNull();
  });

  it("bounds o'zgarganda 'Bu hududda qidirish' tugmasi paydo bo'ladi", async () => {
    const user = userEvent.setup();

    render(<MapView {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    await user.click(screen.getByTestId('trigger-bounds-change'));

    expect(screen.getByTestId('search-in-area-btn')).toBeInTheDocument();
  });

  it("'Bu hududda qidirish' bosilganda tugma yashiriladi", async () => {
    const user = userEvent.setup();

    render(<MapView {...defaultProps} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: '' }),
    });

    await user.click(screen.getByTestId('trigger-bounds-change'));
    expect(screen.getByTestId('search-in-area-btn')).toBeInTheDocument();

    await user.click(screen.getByTestId('search-in-area-btn'));
    expect(screen.queryByTestId('search-in-area-btn')).toBeNull();
  });
});
