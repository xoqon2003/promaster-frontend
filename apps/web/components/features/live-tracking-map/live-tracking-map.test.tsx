/**
 * LiveTrackingMap — Vitest tests (S06 T6.07).
 *
 * Test scope: wrapper logic — connection lost banner, locale, onRetry.
 * Yandex SDK render jsdom'da ishlamaydi (WebGL/canvas), shuning uchun
 * `LiveTrackingMapInner` mock qilinadi.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./live-tracking-map-inner', () => ({
  LiveTrackingMapInner: () => <div data-testid="map-inner-mock">Map</div>,
}));

// next/dynamic SSR'dan tashqari komponentlarni soddalashtirib mock qiladi
vi.mock('next/dynamic', () => ({
  default: () => {
    return function MockedDynamic() {
      return <div data-testid="map-inner-mock">Map</div>;
    };
  },
}));

// Import after vi.mock — required by Vitest hoisting semantics.
import { LiveTrackingMap } from './live-tracking-map';

const CLIENT = { lat: 41.31, lng: 69.27 };
const PRO = { lat: 41.32, lng: 69.275 };
const NOW = new Date('2026-05-09T12:00:00Z');

describe('LiveTrackingMap — banner detection', () => {
  it("ping fresh (<5min) — banner ko'rsatilmaydi", () => {
    const fresh = new Date('2026-05-09T11:58:00Z'); // 2 min oldin
    render(<LiveTrackingMap client={CLIENT} pro={PRO} lastPingAt={fresh} now={NOW} />);
    expect(screen.queryByTestId('connection-lost-banner')).not.toBeInTheDocument();
  });

  it("ping stale (>5min) — banner ko'rinadi", () => {
    const stale = new Date('2026-05-09T11:50:00Z'); // 10 min oldin
    render(<LiveTrackingMap client={CLIENT} pro={PRO} lastPingAt={stale} now={NOW} />);
    expect(screen.getByTestId('connection-lost-banner')).toBeInTheDocument();
    expect(screen.getByText("Aloqa yo'qoldi")).toBeInTheDocument();
  });

  it("ping yo'q (lastPingAt=null) — banner ko'rsatilmaydi", () => {
    render(<LiveTrackingMap client={CLIENT} pro={null} lastPingAt={null} now={NOW} />);
    expect(screen.queryByTestId('connection-lost-banner')).not.toBeInTheDocument();
  });

  it("pro=null bo'lsa banner ko'rsatilmaydi (status pending/accepted)", () => {
    const stale = new Date('2026-05-09T11:50:00Z');
    render(<LiveTrackingMap client={CLIENT} pro={null} lastPingAt={stale} now={NOW} />);
    expect(screen.queryByTestId('connection-lost-banner')).not.toBeInTheDocument();
  });
});

describe('LiveTrackingMap — onRetry', () => {
  it('retry tugmasi bosilganda onRetry chaqiriladi', () => {
    const onRetry = vi.fn();
    const stale = new Date('2026-05-09T11:50:00Z');
    render(
      <LiveTrackingMap client={CLIENT} pro={PRO} lastPingAt={stale} onRetry={onRetry} now={NOW} />,
    );

    const button = screen.getByRole('button', { name: /qayta urinish/i });
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("onRetry yo'q bo'lsa retry tugmasi ko'rsatilmaydi", () => {
    const stale = new Date('2026-05-09T11:50:00Z');
    render(<LiveTrackingMap client={CLIENT} pro={PRO} lastPingAt={stale} now={NOW} />);
    expect(screen.queryByRole('button', { name: /qayta urinish/i })).not.toBeInTheDocument();
  });
});

describe('LiveTrackingMap — locale', () => {
  it('RU locale — banner Russian', () => {
    const stale = new Date('2026-05-09T11:50:00Z');
    render(<LiveTrackingMap client={CLIENT} pro={PRO} lastPingAt={stale} locale="ru" now={NOW} />);
    expect(screen.getByText('Связь потеряна')).toBeInTheDocument();
  });

  it('EN locale — banner English', () => {
    const stale = new Date('2026-05-09T11:50:00Z');
    render(<LiveTrackingMap client={CLIENT} pro={PRO} lastPingAt={stale} locale="en" now={NOW} />);
    expect(screen.getByText('Connection lost')).toBeInTheDocument();
  });
});

describe('LiveTrackingMap — accessibility', () => {
  it('banner role=alert', () => {
    const stale = new Date('2026-05-09T11:50:00Z');
    render(<LiveTrackingMap client={CLIENT} pro={PRO} lastPingAt={stale} now={NOW} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
