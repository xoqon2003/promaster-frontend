'use client';

/**
 * `YandexMapInner` — @pbe/react-yandex-maps komponenti.
 *
 * Task: T3.16
 *
 * Bu fayl FAQAT dynamic import orqali yuklanadi (ssr: false).
 * SSR da import qilinmasin — `typeof window` guard ham bor.
 *
 * Tarkib:
 *  - YMaps provider (API key: NEXT_PUBLIC_YANDEX_MAPS_KEY)
 *  - Map (Toshkent markazi, default zoom 11)
 *  - Clusterer + Placemark'lar
 *  - Pin hover → useSearchMapStore.hoveredMasterId
 *  - Pin click → onPinClick(masterId)
 *  - Bounds change (debounce 800ms) → onBoundsChange(bounds)
 */
import { useCallback } from 'react';
import { Clusterer, Map, Placemark, YMaps } from '@pbe/react-yandex-maps';
import { useDebounce } from 'use-debounce';

import { useSearchMapStore } from '@/lib/stores/search-map.store';
import type { Bounds, Master } from '@/lib/masters/schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Toshkent markazi */
const TASHKENT_CENTER: [number, number] = [41.2995, 69.2401];
const DEFAULT_ZOOM = 11;
const BOUNDS_DEBOUNCE_MS = 800;
const YANDEX_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YandexMapProps {
  masters: Master[];
  onPinClick: (masterId: string) => void;
  onBoundsChange: (bounds: Bounds) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Yandex Maps bounds → Bounds schema formatiga o'tkazish */
function toBounds(ymapsBounds: number[][]): Bounds {
  return {
    south: ymapsBounds[0]![0]!,
    west: ymapsBounds[0]![1]!,
    north: ymapsBounds[1]![0]!,
    east: ymapsBounds[1]![1]!,
  };
}

/** Usta pin rangi — hovered bo'lsa brand-500, aks holda muted */
function getPinColor(masterId: string, hoveredId: string | null): string {
  return hoveredId === masterId ? '#F97316' : '#6366F1';
}

// ─── Component ───────────────────────────────────────────────────────────────

export function YandexMapInner({ masters, onPinClick, onBoundsChange }: YandexMapProps) {
  const hoveredMasterId = useSearchMapStore((s) => s.hoveredMasterId);
  const setHoveredMasterId = useSearchMapStore((s) => s.setHoveredMasterId);

  // Bounds change'ni debounce qilamiz — har pixel harakatda emas, turar joyda
  const [debouncedBoundsChange] = useDebounce(
    useCallback(
      (rawBounds: number[][]) => {
        onBoundsChange(toBounds(rawBounds));
      },
      [onBoundsChange],
    ),
    BOUNDS_DEBOUNCE_MS,
  );

  const handleBoundsChange = useCallback(
    (e: { originalEvent: { newBounds: number[][] } }) => {
      debouncedBoundsChange(e.originalEvent.newBounds);
    },
    [debouncedBoundsChange],
  );

  return (
    <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'ru_RU' }}>
      <Map
        defaultState={{ center: TASHKENT_CENTER, zoom: DEFAULT_ZOOM }}
        width="100%"
        height="100%"
        onBoundsChange={handleBoundsChange}
        data-testid="yandex-map"
      >
        <Clusterer
          options={{
            preset: 'islands#invertedVioletClusterIcons',
            groupByCoordinates: false,
          }}
        >
          {masters.map((master) => (
            <Placemark
              key={master.id}
              geometry={[master.location.lat, master.location.lng]}
              data-testid={`map-pin-${master.id}`}
              properties={{
                hintContent: master.name,
                balloonContent: `${master.name} — ${master.categoryName}`,
              }}
              options={{
                preset: 'islands#circleDotIcon',
                iconColor: getPinColor(master.id, hoveredMasterId),
              }}
              onClick={() => onPinClick(master.id)}
              onMouseEnter={() => setHoveredMasterId(master.id)}
              onMouseLeave={() => setHoveredMasterId(null)}
            />
          ))}
        </Clusterer>
      </Map>
    </YMaps>
  );
}
