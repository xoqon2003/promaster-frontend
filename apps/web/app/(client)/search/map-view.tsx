'use client';

/**
 * `MapView` — Xarita ko'rinish wrapper komponenti.
 *
 * Task: T3.16
 *
 * YandexMapInner'ni `next/dynamic` orqali `ssr: false` bilan yuklaydi —
 * Yandex Maps SDK browser'da ishlaydi, SSR'da crash beradi.
 *
 * Qo'shimcha:
 *  - Loading fallback: shimmer placeholder
 *  - "Bu hududda qidirish" tugmasi — faqat bounds o'zgargan bo'lsa ko'rinadi
 *  - Pin click → ?masterId=xxx URL'ga (T3.17 drawer trigger)
 *  - Mobile: toliq ekran, "Ro'yxat" tugmasi yuqorida
 *
 * SSR crash muhofazasi:
 *  - `dynamic(..., { ssr: false })` — asosiy himoya
 *  - `typeof window === 'undefined'` guard component ichida
 */
import dynamic from 'next/dynamic';
import { useQueryState, parseAsString } from 'nuqs';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Bounds, Master } from '@/lib/masters/schemas';

// ─── Dynamic import (ssr: false) ─────────────────────────────────────────────

const YandexMapInner = dynamic(
  () => import('./yandex-map').then((m) => ({ default: m.YandexMapInner })),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  },
);

// ─── Sub-components ──────────────────────────────────────────────────────────

function MapLoadingFallback() {
  return (
    <div
      data-slot="map-loading"
      className="bg-muted flex h-full w-full items-center justify-center rounded-2xl"
      aria-busy="true"
      aria-label="Xarita yuklanmoqda"
    >
      <Spinner size="lg" />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapViewProps {
  masters: Master[];
  onSwitchToList?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MapView({ masters, onSwitchToList }: MapViewProps) {
  // URL'ga masterId yoziladi — T3.17 QuickProfileDrawer trigger
  const [, setMasterId] = useQueryState('masterId', parseAsString);

  // Bounds o'zgarganini track qilamiz — tugma ko'rsatish uchun
  const [boundsChanged, setBoundsChanged] = useState(false);
  const [pendingBounds, setPendingBounds] = useState<Bounds | null>(null);

  const handlePinClick = useCallback(
    (masterId: string) => {
      void setMasterId(masterId);
    },
    [setMasterId],
  );

  const handleBoundsChange = useCallback((bounds: Bounds) => {
    setPendingBounds(bounds);
    setBoundsChanged(true);
  }, []);

  const handleSearchInArea = useCallback(() => {
    // T3.16: bounds qidiruvga qo'shiladi — hozircha faqat tugmani yashirish
    // Real API tayyor bo'lganda bounds filter qo'shiladi
    setBoundsChanged(false);
    setPendingBounds(null);
    // TODO: setFilters({ bounds: pendingBounds }) — T3.18 da boglanadi
    void pendingBounds; // lint: used
  }, [pendingBounds]);

  return (
    <div
      data-slot="map-view"
      data-testid="map-view"
      className="relative h-[500px] overflow-hidden rounded-2xl lg:h-[600px]"
    >
      {/* Mobile: "Ro'yxat" switch tugmasi */}
      {onSwitchToList && (
        <div className="absolute top-3 left-1/2 z-10 -translate-x-1/2 lg:hidden">
          <Button
            size="sm"
            variant="outline"
            data-testid="switch-to-list-btn"
            className="bg-card shadow-md"
            onClick={onSwitchToList}
          >
            Ro&apos;yxat
          </Button>
        </div>
      )}

      {/* "Bu hududda qidirish" tugmasi */}
      {boundsChanged && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <Button
            size="sm"
            data-testid="search-in-area-btn"
            className="shadow-md"
            onClick={handleSearchInArea}
          >
            Bu hududda qidirish
          </Button>
        </div>
      )}

      {/* Yandex Maps (SSR safe) */}
      <YandexMapInner
        masters={masters}
        onPinClick={handlePinClick}
        onBoundsChange={handleBoundsChange}
      />
    </div>
  );
}
